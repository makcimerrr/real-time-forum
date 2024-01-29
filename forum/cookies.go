package forum

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"hash/fnv"
	"net/http"
)

func hash(s string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(s))
	return h.Sum32()
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
		return errors.New("Username is empty")
	}

	// Ouvrir une connexion à la base de données
	db, err := sql.Open("sqlite", "database/data.db")
	if err != nil {
		return err
	}
	defer db.Close()

	// Vérifier si l'utilisateur a déjà une entrée dans la base de données
	var existingSessionToken string
	err = db.QueryRow("SELECT sessionToken FROM token_user WHERE username = ?", username).Scan(&existingSessionToken)
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
