package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/websocket"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
	"io/ioutil"
	"log"
	"net/http"
	"realtimeforum/Golang"

	"text/template"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

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
	FirstName     string `json:"firstName"`
	LastName      string `json:"lastName"`
	Title         string `json:"title"`
	Text          string `json:"text"`
	Category      string `json:"category"`
}

// type Discussion struct {
// 	Username string `json:"username"`
// 	Title    string `json:"title"`
// 	Text  string `json:"message"`
// 	Category string `json:"category"`
// }

// type WebSocketMessage struct {
// 	Type string      `json:"type"`
// 	Data interface{} `json:"data"`
// }

func main() {
	var err error
	db, err = sql.Open("sqlite3", "database/data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	http.HandleFunc("/register", RegisterHandler)
	http.HandleFunc("/login", LoginHandler)
	http.HandleFunc("/", indexHandler)

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

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var tokencrypt = ""

	// Lire le corps de la requête
	info, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Erreur de lecture du corps de la requête", http.StatusInternalServerError)
		return
	}

	// Create an instance of User to store the data
	var user User

	// Unmarshal the JSON data into the User struct
	if err := json.Unmarshal(info, &user); err != nil {
		http.Error(w, "Erreur de décodage JSON", http.StatusBadRequest)
		return
	}

	//fmt.Println(user)
	var formError []string
	// Vérifier si l'username ou l'adresse email est déjà pris
	var existingUsername string
	err = db.QueryRow("SELECT username FROM users WHERE username = ?", user.Username).Scan(&existingUsername)

	if err == nil {
		formError = append(formError, "This Username Is Already Use ! ")
	}

	var existingEmail string
	err = db.QueryRow("SELECT email FROM users WHERE email = ?", user.Email).Scan(&existingEmail)
	if err == nil {
		formError = append(formError, "This Email Is Already Use By Another Account ! ")
	}

	if formError == nil {
		hash, _ := HashPassword(user.Password)
		// Insertion des données dans la base de données
		_, err = db.Exec("INSERT INTO users (username, email, password, age, gender, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
			user.Username, user.Email, hash, user.Age, user.Gender, user.FirstName, user.LastName)

		if err != nil {
			fmt.Println("Donnée non insérées ")
		} else {

			var err error
			tokencrypt, err = CreateAndSetSessionCookies(w, user.Username)
			if err != nil {
				fmt.Println(err)
			}
			fmt.Println("Données insérées avec succès!")

		}
	}
	// Définir l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")

	// Écrire le code de statut HTTP 200 OK
	w.WriteHeader(http.StatusOK)

	if len(formError) > 0 {
		// Si des erreurs sont présentes, construire la réponse JSON avec les erreurs
		jsonResponse, err := json.Marshal(map[string]interface{}{
			"type":    "error",
			"message": "Validation failed",
			"errors":  formError,
		})
		if err != nil {
			// Gérer l'erreur lors de la création de la réponse JSON
			http.Error(w, "Erreur lors de la création de la réponse JSON", http.StatusInternalServerError)
			return
		}

		// Écrire la réponse JSON dans le corps de la réponse
		_, err = w.Write(jsonResponse)
		if err != nil {
			// Gérer l'erreur lors de l'écriture de la réponse JSON
			http.Error(w, "Erreur lors de l'écriture de la réponse JSON", http.StatusInternalServerError)
			return
		}
	} else {
		// Si le tableau d'erreurs est vide, renvoyer une réponse JSON indiquant le succès
		successResponse, err := json.Marshal(map[string]interface{}{
			"type":    "success",
			"message": "Validation succeeded",
			"token":   tokencrypt,
		})
		if err != nil {
			// Gérer l'erreur lors de la création de la réponse JSON
			http.Error(w, "Erreur lors de la création de la réponse JSON", http.StatusInternalServerError)
			return
		}

		// Écrire la réponse JSON dans le corps de la réponse
		_, err = w.Write(successResponse)
		if err != nil {
			// Gérer l'erreur lors de l'écriture de la réponse JSON
			http.Error(w, "Erreur lors de l'écriture de la réponse JSON", http.StatusInternalServerError)
			return
		}
	}

}

func LoginHandler(w http.ResponseWriter, r *http.Request) {

	// Lire le corps de la requête
	info, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Erreur de lecture du corps de la requête", http.StatusInternalServerError)
		return
	}

	// Create an instance of User to store the data
	var user User

	// Unmarshal the JSON data into the User struct
	if err := json.Unmarshal(info, &user); err != nil {
		http.Error(w, "Erreur de décodage JSON", http.StatusBadRequest)
		return
	}

	//fmt.Println(user)
	var formError []string

	var AccountUsername string
	var AccountPassword string
	var AccountEmail string
	err = db.QueryRow("SELECT username, email, password FROM users WHERE username = ? OR email = ?", user.LoginUser, user.LoginUser).Scan(&AccountUsername, &AccountEmail, &AccountPassword)

	if err != nil {
		formError = append(formError, "Error checking username and email availability")

	}

	CheckMDP := CheckPasswordHash(user.LoginPassword, AccountPassword)

	var tokencrypt = ""

	if CheckMDP == true {
		fmt.Println("MATCHING PASSWORD")
		tokencrypt, _ = CreateAndSetSessionCookies(w, user.LoginUser)
		fmt.Println(tokencrypt)

	} else {
		formError = append(formError, "Wrong password !")
	}

	// Définir l'en-tête Content-Type
	w.Header().Set("Content-Type", "application/json")

	// Écrire le code de statut HTTP 200 OK
	w.WriteHeader(http.StatusOK)

	if len(formError) > 0 {
		// Si des erreurs sont présentes, construire la réponse JSON avec les erreurs
		jsonResponse, err := json.Marshal(map[string]interface{}{
			"type":    "error",
			"message": "Validation failed",
			"errors":  formError,
		})
		if err != nil {
			// Gérer l'erreur lors de la création de la réponse JSON
			http.Error(w, "Erreur lors de la création de la réponse JSON", http.StatusInternalServerError)
			return
		}

		// Écrire la réponse JSON dans le corps de la réponse
		_, err = w.Write(jsonResponse)
		if err != nil {
			// Gérer l'erreur lors de l'écriture de la réponse JSON
			http.Error(w, "Erreur lors de l'écriture de la réponse JSON", http.StatusInternalServerError)
			return
		}
	} else {
		// Si le tableau d'erreurs est vide, renvoyer une réponse JSON indiquant le succès
		successResponse, err := json.Marshal(map[string]interface{}{
			"type":    "success",
			"message": "Validation succeeded",
			"token":   tokencrypt,
		})
		if err != nil {
			// Gérer l'erreur lors de la création de la réponse JSON
			http.Error(w, "Erreur lors de la création de la réponse JSON", http.StatusInternalServerError)
			return
		}

		// Écrire la réponse JSON dans le corps de la réponse
		_, err = w.Write(successResponse)
		if err != nil {
			// Gérer l'erreur lors de l'écriture de la réponse JSON
			http.Error(w, "Erreur lors de l'écriture de la réponse JSON", http.StatusInternalServerError)
			return
		}
	}

}

func generateSessionToken() (string, error) {
	token := make([]byte, 32) // Crée un slice de bytes de 32 octets
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(token), nil
}

func CreateAndSetSessionCookies(w http.ResponseWriter, username string) (string, error) {
	// Générer un nouveau jeton de session uniquement si le nom d'utilisateur n'est pas vide
	if username == "" {
		return "", errors.New("username is empty")
	}

	// Vérifier si l'utilisateur a déjà une entrée dans la base de données
	var existingSessionToken string
	err := db.QueryRow("SELECT sessionToken FROM token_user WHERE username = ?", username).Scan(&existingSessionToken)

	if err == sql.ErrNoRows {
		// Si l'utilisateur n'a pas encore d'entrée, générer un nouveau jeton de session
		sessionToken, err := generateSessionToken()
		if err != nil {
			return "", err
		}
		// Insérer la nouvelle entrée dans la base de données
		_, err = db.Exec("INSERT INTO token_user (username, sessionToken) VALUES (?, ?)", username, sessionToken)
		if err != nil {
			return "", err
		}

		encText, err := Golang.Encrypt(sessionToken, Golang.MySecret)
		if err != nil {
			fmt.Println("error encrypting your classified text: ", err)
			return "", err
		}

		return encText, nil //Envoie des valeurs pour la création des cookies en JS
	} else if err == nil {
		// Si l'utilisateur a déjà une entrée, mettre à jour le jeton de session existant
		sessionToken, err := generateSessionToken()
		if err != nil {
			return "", err
		}
		// Mettre à jour le jeton de session dans la base de données
		_, err = db.Exec("UPDATE token_user SET sessionToken = ? WHERE username = ?", sessionToken, username)
		if err != nil {
			return "", err
		}

		encText, err := Golang.Encrypt(sessionToken, Golang.MySecret)
		if err != nil {
			fmt.Println("error encrypting your classified text: ", err)
			return "", err
		}

		return encText, nil //Envoie des valeurs pour la création des cookies en JS
	} else {
		// En cas d'erreur différente de "pas de lignes", renvoyer l'erreur
		return "", err
	}
}

func CreateDiscussionRequest(conn *websocket.Conn, user User, r *http.Request) {
	// Récupérer tous les cookies de la requête
	usernameCookie, err := r.Cookie("username")
	if err != nil {
		log.Println(err)
		return
	}

	// Utiliser la valeur du cookie "username"
	username := usernameCookie.Value

	title := user.Title
	message := user.Text
	category := user.Category

	// Ouverture de la connexion à la base de données
	db, err := sql.Open("sqlite", "database/data.db")
	if err != nil {
		log.Println(err)
		return
	}
	defer db.Close()

	// Insérez la nouvelle discussion dans la base de données, y compris la catégorie
	_, err = db.Exec("INSERT INTO post (username, title, message, catégorie) VALUES (?, ?, ?, ?)", username, title, message, category)

	if err != nil {
		log.Println(err)
		return
	}

}

// func fetchRecentDiscussionsFromDatabase() []Discussion {
//     fmt.Println("TESTTTT1")
//     db, err := sql.Open("sqlite", "database/data.db")
//     if err != nil {
//         log.Println("Error opening database:", err)
//         return nil
//     }
//     defer db.Close()

//     rows, err := db.Query("SELECT username, title, message, category FROM post ORDER BY timestamp DESC LIMIT 10")
//     if err != nil {
//         log.Println("Error querying database:", err)
//         return nil
//     }
//     defer rows.Close()
//     fmt.Println("TESTTTT2")

//     var recentDiscussions []Discussion

//     for rows.Next() {
//         var discussion Discussion
//         err := rows.Scan(&discussion.Username, &discussion.Title, &discussion.Text, &discussion.Category)
//         if err != nil {
//             log.Println("Error scanning rows:", err)
//             continue
//         }
//         recentDiscussions = append(recentDiscussions, discussion)
//     }

//     fmt.Println("TESTTTT3")
//     return recentDiscussions
// }

// func sendRecentDiscussions(conn *websocket.Conn) {
//     fmt.Println("Sending recent discussions")
//     recentDiscussions := fetchRecentDiscussionsFromDatabase()

//     message := WebSocketMessage{
//         Type: "discussionList",
//         Data: recentDiscussions,
//     }

//     jsonMessage, err := json.Marshal(message)
//     if err != nil {
//         log.Println(err)
//         return
//     }

//     err = conn.WriteMessage(websocket.TextMessage, jsonMessage)
//     if err != nil {
//         log.Println(err)
//         return
//     }

//     fmt.Println("Recent discussions sent successfully")
// }
