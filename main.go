package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"hash/fnv"
	"log"
	"net/http"
	"strings"
	"text/template"

	"realtimeforum/Golang" // Utilisez le chemin du module

	"github.com/gorilla/websocket"
	_ "modernc.org/sqlite"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Envoie un message à tous les clients connectés
var templates = template.Must(template.ParseGlob("templates/*.html"))
var db *sql.DB

type User struct {
	Type          string `json:"type"` // Type de l'opération (register ou login)
	Username      string `json:"username"`
	LoginUser     string `json:"loginuser"`
	LoginPassword string `json:"loginpassword"`
	Email         string `json:"email"`
	Password      string `json:"password"`
	Age           string `json:"age"`
	Gender        string `json:"gender"`
	FristName     string `json:"firstName"`
	LastName      string `json:"lastName"`
}

func main() {
	var err error
	db, err = sql.Open("sqlite", "database/data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/ws", websocketHandler)

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

func hash(s string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(s))
	return h.Sum32()
}

func websocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	for {
		var user User
		err := conn.ReadJSON(&user)
		if err != nil {
			log.Println(err)
			return
		}

		if user.Type == "register" {
			Register(conn, user)
		} else if user.Type == "login" {
			Login(w, r, conn, user)
		} else {
			log.Println("Unknown request type:", user.Type)
		}
	}
}

func Register(conn *websocket.Conn, user User) {
	Existing := false

	// Vérifier si l'username ou l'adresse email est déjà pris
	if usernameExists(user.Username) {
		Existing = true
	}

	if emailExists(user.Email) {
		Existing = true
	}

	if !Existing {
		hashpass := hash(user.Password)

		// Si tout est OK, insérer les données dans la base de données
		_, err := db.Exec("INSERT INTO users (username, email, password, age, gender, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
			user.Username, user.Email, hashpass, user.Age, user.Gender, user.FristName, user.LastName)
		if err != nil {
			log.Println(err)
			return
		}

		// Confirmer l'inscription à l'utilisateur via la websocket
		err = conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "join", "message": "Bienvenue, `+user.Username+` !"}`))
		if err != nil {
			log.Println(err)
		}
	} else {
		// Si l'adresse email est déjà prise, envoyer un message d'erreur
		err := conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "error", "message": "Email or Username déjà utilisé. Veuillez en choisir un autre."}`))
		if err != nil {
			log.Println(err)
			return
		}
	}
}

func Login(w http.ResponseWriter, r *http.Request, conn *websocket.Conn, user User) {
	loginuser := user.LoginUser
	loginpassword := user.LoginPassword

	var trueemail string
	var truepassword uint32
	var username string

	Existing := false

	if strings.Contains(loginuser, "@") {

		loginemail := loginuser

		err := db.QueryRow("SELECT username, email, password FROM users WHERE email = ?", loginemail).Scan(&username, &trueemail, &truepassword)

		if err != nil {
			Existing = true
		}
	} else {
		err := db.QueryRow("SELECT username, email, password FROM users WHERE username = ?", loginuser).Scan(&username, &trueemail, &truepassword)
		if err != nil {
			Existing = true
		}
	}

	if !Existing {
		hashloginpassword := hash(loginpassword)
		wrongPassword := false
		// Vérifier le mot de passe
		if hashloginpassword != truepassword {

			wrongPassword = true

		}
		if !wrongPassword {
			// L'utilisateur est connecté avec succès
			usernameCookie, tokenCookie, err := CreateAndSetSessionCookies(w, username)
			if err != nil {
				fmt.Println(err)
				return
			}

			// Confirmer l'inscription à l'utilisateur via la websocket
			err = conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "login", "message": "Connexion réussi, `+username+` !","usernameCookie": "`+usernameCookie+`","tokenCookie": "`+tokenCookie+`"}`))
			if err != nil {
				log.Println(err)
			}
		} else {
			fmt.Println("3")
			err := conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "error", "message": "Password Incorrect"}`))
			if err != nil {
				log.Println(err)
				return
			}
		}
	} else {
		fmt.Println("err")
		err := conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "error", "message": "Email or Username unknown"}`))
		if err != nil {
			log.Println(err)
			return
		}
	}

}

func usernameExists(username string) bool {
	// Vérifier si l'username existe dans la base de données
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", username).Scan(&count)
	if err != nil {
		log.Println(err)
		return false
	}
	return count > 0
}

func emailExists(email string) bool {
	// Vérifier si l'adresse email existe dans la base de données
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", email).Scan(&count)
	if err != nil {
		log.Println(err)
		return false
	}
	return count > 0
}

func generateSessionToken() (string, error) {
	token := make([]byte, 32) // Crée un slice de bytes de 32 octets
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(token), nil
}

func CreateAndSetSessionCookies(w http.ResponseWriter, username string) (string, string, error) {
	// Générer un nouveau jeton de session uniquement si le nom d'utilisateur n'est pas vide
	if username == "" {
		return "", "", errors.New("username is empty")
	}

	// Vérifier si l'utilisateur a déjà une entrée dans la base de données
	var existingSessionToken string
	err := db.QueryRow("SELECT sessionToken FROM token_user WHERE username = ?", username).Scan(&existingSessionToken)

	if err == sql.ErrNoRows {
		// Si l'utilisateur n'a pas encore d'entrée, générer un nouveau jeton de session
		sessionToken, err := generateSessionToken()
		if err != nil {
			return "", "", err
		}
		// Insérer la nouvelle entrée dans la base de données
		_, err = db.Exec("INSERT INTO token_user (username, sessionToken) VALUES (?, ?)", username, sessionToken)
		if err != nil {
			return "", "", err
		}

		encText, err := Golang.Encrypt(sessionToken, Golang.MySecret)
		if err != nil {
			fmt.Println("error encrypting your classified text: ", err)
			return "", "", err
		}

		return username, encText, nil //Envoie des valeurs pour la création des cookies en JS
	} else if err == nil {
		// Si l'utilisateur a déjà une entrée, mettre à jour le jeton de session existant
		sessionToken, err := generateSessionToken()
		if err != nil {
			return "", "", err
		}
		// Mettre à jour le jeton de session dans la base de données
		_, err = db.Exec("UPDATE token_user SET sessionToken = ? WHERE username = ?", sessionToken, username)
		if err != nil {
			return "", "", err
		}

		encText, err := Golang.Encrypt(sessionToken, Golang.MySecret)
		if err != nil {
			fmt.Println("error encrypting your classified text: ", err)
			return "", "", err
		}

		return username, encText, nil //Envoie des valeurs pour la création des cookies en JS
	} else {
		// En cas d'erreur différente de "pas de lignes", renvoyer l'erreur
		return "", "", err
	}
}
