package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"hash/fnv"
	"log"
	"net/http"
	"strings"
	"text/template"

	// Utilisez le chemin du module

	"github.com/gorilla/websocket"
	_ "modernc.org/sqlite"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	userList []string
)

// Envoie un message à tous les clients connectés
var templates = template.Must(template.ParseGlob("templates/*.html"))
var db *sql.DB

// Parser les données JSON de la requête
var Loginuser struct {
	LoginData     string `json:"logindata"`
	Loginpassword string `json:"loginpassword"`
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
	http.HandleFunc("/login", LoginHandler)

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

	// Attendre les messages du client
	for {
		// Lire le message du client
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			break
		}
		log.Printf("Message reçu: %s\n", msg)
	}
}

func hash(s string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(s))
	return h.Sum32()
}

// LoginHandler gère la requête de connexion
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var trueemail string
	var truepassword uint32
	var username string
	var Existing bool
	// Vérifier si la méthode de requête est POST
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&Loginuser); err != nil {
		http.Error(w, "Erreur lors de la lecture du corps de la requête", http.StatusBadRequest)
		return
	}

	if strings.Contains(Loginuser.LoginData, "@") {
		loginemail := Loginuser.LoginData
		err := db.QueryRow("SELECT username, email, password FROM users WHERE email = ?", loginemail).Scan(&username, &trueemail, &truepassword)
		if err != nil {
			Existing = true
		}
	} else {
		loginuser := Loginuser.LoginData
		err := db.QueryRow("SELECT username, email, password FROM users WHERE username = ?", loginuser).Scan(&username, &trueemail, &truepassword)
		if err != nil {
			Existing = true
		}
	}

	if !Existing {
		loginpassword := Loginuser.Loginpassword
		hashloginpassword := hash(loginpassword)
		wrongPassword := false
		// Vérifier le mot de passe
		if hashloginpassword != truepassword {
			wrongPassword = true
		}
		if !wrongPassword {
			// Authentification réussie, renvoyer une réponse avec un statut 200 (OK)
			response := map[string]interface{}{
				"status":  "success",
				"message": "Connexion réussie",
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(response)
		} else {
			// Authentification échouée, renvoyer une réponse avec un statut 401 (Unauthorized)
			response := map[string]interface{}{
				"status":  "error",
				"message": "Mot de passe incorrect",
			}
			w.WriteHeader(http.StatusUnauthorized)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(response)
		}
	} else {
		// Authentification échouée, renvoyer une réponse avec un statut 401 (Unauthorized)
		response := map[string]interface{}{
			"status":  "error",
			"message": "Nom d'utilisateur ou email incorrect",
		}
		w.WriteHeader(http.StatusUnauthorized)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}

}
