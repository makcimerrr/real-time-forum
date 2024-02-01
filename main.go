package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"text/template"

	"github.com/gorilla/websocket"
	_ "modernc.org/sqlite"
)

var (
	clients = make(map[*websocket.Conn]bool) // Map pour stocker les connexions des clients

	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
)

var templates = template.Must(template.ParseGlob("templates/*.html"))
var db *sql.DB

type User struct {
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Age       string `json:"age"`
	Gender    string `json:"gender"`
	FristName string `json:"firstName"`
	LastName  string `json:"lastName"`
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

func websocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	Existing := false
	for {
		var user User
		err := conn.ReadJSON(&user)
		if err != nil {
			log.Println(err)
			return
		}

		// Vérifier si l'username ou l'adresse email est déjà pris
		if usernameExists(user.Username) {
			// Si l'username est déjà pris, envoyer un message d'erreur
			err = conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "error", "message": "Username déjà pris. Veuillez en choisir un autre."}`))
			if err != nil {
				log.Println(err)
				return
			}
			Existing = true
		}

		if emailExists(user.Email) {
			// Si l'adresse email est déjà prise, envoyer un message d'erreur
			err = conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "error", "message": "Email déjà utilisé. Veuillez en choisir un autre."}`))
			if err != nil {
				log.Println(err)
				return
			}
			Existing = true
		}

		if !Existing {
			// Si tout est OK, insérer les données dans la base de données
			_, err = db.Exec("INSERT INTO users (username, email, password, age, gender, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
				user.Username, user.Email, user.Password, user.Age, user.Gender, user.FristName, user.LastName)
			if err != nil {
				log.Println(err)
				return
			}

			// Confirmer l'inscription à l'utilisateur via la websocket
			err = conn.WriteMessage(websocket.TextMessage, []byte(`{"type": "join", "message": "Bienvenue, `+user.Username+` !"}`))
			if err != nil {
				log.Println(err)
				continue
			}

		} else {
			fmt.Println("Error username or email are already taken ! ")
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
