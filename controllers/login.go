package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
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

	var trueEmail string
	var truePassword []byte
	var username string
	var err error
	var UserData User

	if strings.Contains(loginData.LoginData, "@") {
		// Si loginData contient un "@", alors c'est un email
		loginEmail := loginData.LoginData
		err = Db.QueryRow("SELECT username, email, password FROM users WHERE email = ?", loginEmail).Scan(&username, &trueEmail, &truePassword)
	} else {
		// Sinon, c'est un nom d'utilisateur
		loginUsername := loginData.LoginData
		err = Db.QueryRow("SELECT username, email, password FROM users WHERE username = ?", loginUsername).Scan(&username, &trueEmail, &truePassword)
	}

	UserData.Username = username
	
	if err != nil {
		jsonResponse := map[string]interface{}{
			"success": false,
			"message": "Email ou username incorrect",
		}
		err := json.NewEncoder(w).Encode(jsonResponse)
		if err != nil {
			return
		}
	} else {
		if err := bcrypt.CompareHashAndPassword(truePassword, []byte(loginData.LoginPassword)); err != nil {
			jsonResponse := map[string]interface{}{
				"success": false,
				"message": "Mot de passe incorrect",
			}
			err := json.NewEncoder(w).Encode(jsonResponse)
			if err != nil {
				return
			}
		} else {

			usernameCookie, sessionTokenCookie, err := createAndSetSessionCookies(username)
			if err != nil {
				log.Fatal(err)
			}

			/*postDataLogin := WebsocketMessage{Type: "login", Data: UserData}
			broadcast <- postDataLogin*/

			jsonResponse := map[string]interface{}{
				"success":  true,
				"message":  "Connexion spécie",
				"username": usernameCookie,
				"token":    sessionTokenCookie,
			}
			err = json.NewEncoder(w).Encode(jsonResponse)
			if err != nil {
				return
			}
		}
	}

}
