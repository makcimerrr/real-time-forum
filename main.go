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
	"text/template"

	"github.com/gorilla/websocket"
	_ "modernc.org/sqlite"
)

var (
	//clients = make(map[*websocket.Conn]bool) // Map pour stocker les connexions des clients

	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
)

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
			Login(w, conn, user)
		} else {
			log.Println("Unknown request type:", user.Type)
		}
	}
}

func Register(conn *websocket.Conn, user User) {
	Existing := false

	// Vérifier si l'username ou l'adresse email est déjà pris
	if usernameExists(user.Username) {
		// Si l'username est déjà pris, envoyer un message d'erreur
		err := conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "error", "message": "Username déjà pris. Veuillez en choisir un autre."}`))
		if err != nil {
			log.Println(err)
			return
		}

		Existing = true
	}

	if emailExists(user.Email) {
		// Si l'adresse email est déjà prise, envoyer un message d'erreur
		err := conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "error", "message": "Email déjà utilisé. Veuillez en choisir un autre."}`))
		if err != nil {
			log.Println(err)
			return
		}
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
		fmt.Println("Error username or email are already taken ! ")
	}
}

func Login(w http.ResponseWriter, conn *websocket.Conn, user User) {
	loginemail := user.LoginUser
	loginpassword := user.LoginPassword

	var trueemail string
	var truepassword uint32
	var username string

	fmt.Println("1")

	err := db.QueryRow("SELECT username, email, password FROM users WHERE email = ?", loginemail).Scan(&username, &trueemail, &truepassword)
	if err != nil {
		err = conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "error", "message": Email unknown !"}`))
		return
	} else {
		fmt.Println("2")
		hashloginpassword := hash(loginpassword)
		// Vérifier le mot de passe
		if hashloginpassword != truepassword {
			err := conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "error", "message": Password Incorrect !"}`))
			if err != nil {
				log.Println(err)
				return
			}
		} else {
			fmt.Println("3")
			// L'utilisateur est connecté avec succès
			err := CreateAndSetSessionCookies(w, username)
			if err != nil {
				fmt.Println(err)
				return
			}
			// Confirmer l'inscription à l'utilisateur via la websocket
			err = conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "login", "message": "Connexion réussi, `+username+` !"}`))
			if err != nil {
				log.Println(err)
			}
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

func CreateAndSetSessionCookies(w http.ResponseWriter, username string) error {
	// Générer un nouveau jeton de session uniquement si le nom d'utilisateur n'est pas vide
	if username == "" {
		return errors.New("username is empty")
	}

	// Vérifier si l'utilisateur a déjà une entrée dans la base de données
	var existingSessionToken string
	err := db.QueryRow("SELECT sessionToken FROM token_user WHERE username = ?", username).Scan(&existingSessionToken)
	if err == sql.ErrNoRows {
		// Si l'utilisateur n'a pas encore d'entrée, générer un nouveau jeton de session
		sessionToken, err := generateSessionToken()
		if err != nil {
			return err
		}
		// Insérer la nouvelle entrée dans la base de données
		_, err = db.Exec("INSERT INTO token_user (username, sessionToken) VALUES (?, ?)", username, sessionToken)
		if err != nil {
			return err
		}
		// Créer un cookie contenant le nom d'utilisateur
		userCookie := http.Cookie{
			Name:     "username",
			Value:    username,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteStrictMode, // ou http.SameSiteLaxMode
		}
		http.SetCookie(w, &userCookie)

		encText, err := Encrypt(sessionToken, MySecret)
		if err != nil {
			fmt.Println("error encrypting your classified text: ", err)
		}

		// Créer un cookie contenant le jeton de session
		sessionCookie := http.Cookie{
			Name:     "session",
			Value:    encText,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteStrictMode, // ou http.SameSiteLaxMode
		}
		http.SetCookie(w, &sessionCookie)
	} else if err == nil {
		// Si l'utilisateur a déjà une entrée, mettre à jour le jeton de session existant
		sessionToken, err := generateSessionToken()
		if err != nil {
			return err
		}
		// Mettre à jour le jeton de session dans la base de données
		_, err = db.Exec("UPDATE token_user SET sessionToken = ? WHERE username = ?", sessionToken, username)
		if err != nil {
			return err
		}
		// Créer un cookie contenant le nom d'utilisateur
		userCookie := http.Cookie{
			Name:     "username",
			Value:    username,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteStrictMode, // ou http.SameSiteLaxMode
		}
		http.SetCookie(w, &userCookie)
		encText, err := Encrypt(sessionToken, MySecret)
		if err != nil {
			fmt.Println("error encrypting your classified text: ", err)
		}
		// Créer un cookie contenant le jeton de session
		sessionCookie := http.Cookie{
			Name:     "session",
			Value:    encText,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteStrictMode, // ou http.SameSiteLaxMode
		}

		http.SetCookie(w, &sessionCookie)
	} else {
		// En cas d'erreur différente de "pas de lignes", renvoyer l'erreur
		return err
	}
	return nil
}
