package controllers

import (
	"encoding/json"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
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
	err := Db.QueryRow("SELECT username FROM users WHERE username = ?", registerData.Username).Scan(&existingUsername)
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
	err = Db.QueryRow("SELECT email FROM users WHERE email = ?", registerData.Email).Scan(&existingEmail)
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

		_, err = Db.Exec(insertUser, registerData.Username, registerData.Email, encryptPassword, registerData.Age, registerData.Gender, registerData.FirstName, registerData.LastName)
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
