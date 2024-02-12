package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"text/template"

	"github.com/gofrs/uuid"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

var templates = template.Must(template.ParseGlob("templates/*.html"))
var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("sqlite3", "database/data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/login", loginHandler)
	http.HandleFunc("/register", registerHandler)

	// Définir le dossier "static" comme dossier de fichiers statiques
	fs := http.FileServer(http.Dir("assets"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	port := 8080
	fmt.Printf("Voici le lien pour ouvrir la page web http://localhost:%d/", port)
	println()
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

func indexHandler(w http.ResponseWriter, r *http.Request) {

	err := templates.ExecuteTemplate(w, "index.html", nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var loginData struct {
		LoginData     string `json:"loginData"`
		LoginPassword string `json:"loginPassword"`
	}

	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var trueemail string
	var truepassword []byte
	var username string
	var err error

	if strings.Contains(loginData.LoginData, "@") {
		// Si loginData contient un "@", alors c'est un email
		Loginemail := loginData.LoginData
		err = db.QueryRow("SELECT username, email, password FROM users WHERE email = ?", Loginemail).Scan(&username, &trueemail, &truepassword)
	} else {
		// Sinon, c'est un nom d'utilisateur
		Loginusername := loginData.LoginData
		err = db.QueryRow("SELECT username, email, password FROM users WHERE username = ?", Loginusername).Scan(&username, &trueemail, &truepassword)
	}

	if err != nil {
		jsonResponse := map[string]interface{}{
			"success": false,
			"message": "Email ou username incorrect",
		}
		json.NewEncoder(w).Encode(jsonResponse)
	} else {
		if err := bcrypt.CompareHashAndPassword([]byte(truepassword), []byte(loginData.LoginPassword)); err != nil {
			jsonResponse := map[string]interface{}{
				"success": false,
				"message": "Mot de passe incorrect",
			}
			json.NewEncoder(w).Encode(jsonResponse)
		} else {

			usernameCookie, sessionTokenCookie, err := createAndSetSessionCookies(w, username)
			if err != nil {
				log.Fatal(err)
			}

			jsonResponse := map[string]interface{}{
				"success":  true,
				"message":  "Connexion spécie",
				"username": usernameCookie,
				"token":    sessionTokenCookie,
			}
			json.NewEncoder(w).Encode(jsonResponse)
		}
	}

}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var registerData struct {
		Username  string `json:"username"`
		Email     string `json:"email"`
		Password  string `json:"password"`
		Age       string `json:"age"`
		Gender    string `json:"gender"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
	}

	if err := json.NewDecoder(r.Body).Decode(&registerData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var isError bool

	// Vérification si le nom d'utilisateur est déjà utilisé
	var existingUsername string
	err := db.QueryRow("SELECT username FROM users WHERE username = ?", registerData.Username).Scan(&existingUsername)
	if err == nil {
		isError = true
		jsonResponse := map[string]interface{}{
			"success": false,
			"message": "Nom d'utilisateur déjà utilisé",
		}
		json.NewEncoder(w).Encode(jsonResponse)
	}
	// Vérification si l'e-mail est déjà utilisé
	var existingEmail string
	err = db.QueryRow("SELECT email FROM users WHERE email = ?", registerData.Email).Scan(&existingEmail)
	if err == nil {
		isError = true
		jsonResponse := map[string]interface{}{
			"success": false,
			"message": "Nom d'utilisateur déjà utilisé",
		}
		json.NewEncoder(w).Encode(jsonResponse)
	}

	if !isError {
		insertUser := "INSERT INTO users (username, email, password, age, gender, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)"

		encryptPassword, _ := bcrypt.GenerateFromPassword([]byte(registerData.Password), bcrypt.DefaultCost)

		_, err = db.Exec(insertUser, registerData.Username, registerData.Email, encryptPassword, registerData.Age, registerData.Gender, registerData.FirstName, registerData.LastName)
		if err != nil {
			log.Fatal(err)
			return
		}
		jsonResponse := map[string]interface{}{
			"success": true,
			"message": "Enregistrement réussie",
		}
		json.NewEncoder(w).Encode(jsonResponse)

	}

}

func generateSessionToken() (string, error) {
	id := uuid.Must(uuid.NewV4())
	token := id.String()
	return token, nil
}

func createAndSetSessionCookies(w http.ResponseWriter, username string) (string, string, error) {
	// Générer un nouveau jeton de session uniquement si le nom d'utilisateur n'est pas vide
	if username == "" {
		return "", "", errors.New("username is empty")
	}
	var err error

	// Vérifier si l'utilisateur a déjà une entrée dans la base de données
	var existingSessionToken string
	err = db.QueryRow("SELECT sessionToken FROM token_user WHERE username = ?", username).Scan(&existingSessionToken)
	if err == sql.ErrNoRows {
		// Si l'utilisateur n'a pas encore d'entrée, générer un nouveau jeton de session
		sessionToken, err := generateSessionToken()

		encryptToken, _ := bcrypt.GenerateFromPassword([]byte(sessionToken), bcrypt.DefaultCost)
		if err != nil {
			return "", "", err
		}
		// Insérer la nouvelle entrée dans la base de données
		_, err = db.Exec("INSERT INTO token_user (username, sessionToken) VALUES (?, ?)", username, encryptToken)
		if err != nil {
			return "", "", err
		}

		return username, sessionToken, nil

	} else if err == nil {
		// Si l'utilisateur a déjà une entrée, mettre à jour le jeton de session existant
		sessionToken, err := generateSessionToken()
		if err != nil {
			return "", "", err
		}
		encryptToken, _ := bcrypt.GenerateFromPassword([]byte(sessionToken), bcrypt.DefaultCost)
		// Mettre à jour le jeton de session dans la base de données
		_, err = db.Exec("UPDATE token_user SET sessionToken = ? WHERE username = ?", encryptToken, username)
		if err != nil {
			return "", "", err
		}

		return username, sessionToken, nil
	} else {
		// En cas d'erreur différente de "pas de lignes", renvoyer l'erreur
		return "", "", err
	}
	return "", "", nil
}
