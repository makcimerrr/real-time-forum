package controllers

import (
	"database/sql"
	"errors"
	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"

	_ "github.com/mattn/go-sqlite3"
)

func generateSessionToken() (string, error) {
	id := uuid.Must(uuid.NewV4())
	token := id.String()
	return token, nil
}

func createAndSetSessionCookies(username string) (string, string, error) {
	// Générer un nouveau jeton de session uniquement si le nom d'utilisateur n'est pas vide
	if username == "" {

		return "", "", errors.New("username is empty")
	}
	var err error

	// Vérifier si l'utilisateur a déjà une entrée dans la base de données
	var existingSessionToken string
	err = Db.QueryRow("SELECT sessionToken FROM token_user WHERE username = ?", username).Scan(&existingSessionToken)
	if err == sql.ErrNoRows {
		// Si l'utilisateur n'a pas encore d'entrée, générer un nouveau jeton de session
		sessionToken, err := generateSessionToken()

		encryptToken, _ := bcrypt.GenerateFromPassword([]byte(sessionToken), bcrypt.DefaultCost)
		if err != nil {
			return "", "", err
		}
		// Insérer la nouvelle entrée dans la base de données
		_, err = Db.Exec("INSERT INTO token_user (username, sessionToken) VALUES (?, ?)", username, encryptToken)
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
		_, err = Db.Exec("UPDATE token_user SET sessionToken = ? WHERE username = ?", encryptToken, username)
		if err != nil {
			return "", "", err
		}

		return username, sessionToken, nil
	} else {
		// En cas d'erreur différente de "pas de lignes", renvoyer l'erreur
		return "", "", err
	}
}
