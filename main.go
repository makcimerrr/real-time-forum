package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"realtime/controllers"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	var err error
	controllers.Db, err = sql.Open("sqlite3", "database/data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			log.Fatal(err)
		}
	}(controllers.Db)

	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/login", controllers.LoginHandler)
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
	path := r.URL.Path

	log.Printf("Chemin d'accès de la requête : %s", path)

	err := controllers.Templates.ExecuteTemplate(w, "index.html", nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
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
	err := controllers.Db.QueryRow("SELECT username FROM users WHERE username = ?", registerData.Username).Scan(&existingUsername)
	if err == nil {
		isError = true
		jsonResponse := map[string]interface{}{
			"success": false,
			"message": "Nom d'utilisateur déjà utilisé",
		}
		err := json.NewEncoder(w).Encode(jsonResponse)
		if err != nil {
			return
		}
	}
	// Vérification si l'e-mail est déjà utilisé
	var existingEmail string
	err = controllers.Db.QueryRow("SELECT email FROM users WHERE email = ?", registerData.Email).Scan(&existingEmail)
	if err == nil {
		isError = true
		jsonResponse := map[string]interface{}{
			"success": false,
			"message": "Nom d'utilisateur déjà utilisé",
		}
		err := json.NewEncoder(w).Encode(jsonResponse)
		if err != nil {
			return
		}
	}

	if !isError {
		insertUser := "INSERT INTO users (username, email, password, age, gender, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)"

		encryptPassword, _ := bcrypt.GenerateFromPassword([]byte(registerData.Password), bcrypt.DefaultCost)

		_, err = controllers.Db.Exec(insertUser, registerData.Username, registerData.Email, encryptPassword, registerData.Age, registerData.Gender, registerData.FirstName, registerData.LastName)
		if err != nil {
			log.Fatal(err)
			return
		}
		jsonResponse := map[string]interface{}{
			"success": true,
			"message": "Enregistrement réussie",
			"notif":   "Veuillez vous connecter",
		}
		err := json.NewEncoder(w).Encode(jsonResponse)
		if err != nil {
			return
		}

	}

}
