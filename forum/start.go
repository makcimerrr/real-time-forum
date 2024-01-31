package forum

import (
	"database/sql"
	"fmt"
	codeerreur "forum/codeErreur"
	"html/template"
	"net/http"
	"net/url"
	"strings"
	"time"

	_ "modernc.org/sqlite"
)


func HandleNotFound(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/404.html")

	if err != nil {
		codeerreur.CodeErreur(w, r, 500, "Template not found : 404.html")
		return
	}

	err = tmpl.Execute(w, nil)
}

func HandleServerError(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/500.html")

	if err != nil {
		codeerreur.CodeErreur(w, r, 500, "Template not found : 500.html")
		return
	}

	err = tmpl.Execute(w, nil)
}

func HandleBadRequest(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/400.html")
	if err != nil {
		codeerreur.CodeErreur(w, r, 500, "Template not found : 400.html")
		return
	}

	err = tmpl.Execute(w, nil)

}

func Logorsign(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/logorsign.html")

	if err != nil {
		codeerreur.CodeErreur(w, r, 500, "Template not found : logorsign.html")
		return
	}

	err = tmpl.Execute(w, nil)
}

func Sign_up(w http.ResponseWriter, r *http.Request) {
	var formError []string

	if r.Method == http.MethodPost {
		// Récupération des informations du formulaire
		username := r.FormValue("username")
		email := r.FormValue("email")
		password := r.FormValue("password")
		age := r.FormValue("age")
		gender := r.FormValue("gender")
		fistname := r.FormValue("firstName")
		lastname := r.FormValue("lastName")

		hashpass := hash(password)

		// Ouverture de la connexion à la base de données
		db, err := sql.Open("sqlite", "database/data.db")
		if err != nil {
			fmt.Println(err)
			return
		}
		defer db.Close()

		// Création de la table s'il n'existe pas
		createTable := `
           CREATE TABLE IF NOT EXISTS account_user (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               username TEXT,
               email TEXT,
               mot_de_passe INT
           )
       `
		_, err = db.Exec(createTable)
		if err != nil {
			fmt.Println(err)
			return
		}

		// Vérification si le nom d'utilisateur est déjà utilisé
		var existingUsername string
		err = db.QueryRow("SELECT username FROM account_user WHERE username = ?", username).Scan(&existingUsername)
		if err == nil {
			formError = append(formError, "This Username Is Already Use !! ")
		}

		// Vérification si l'e-mail est déjà utilisé
		var existingEmail string
		err = db.QueryRow("SELECT email FROM account_user WHERE email = ?", email).Scan(&existingEmail)
		if err == nil {
			formError = append(formError, "This Email Is Already Use !!")
		}

		if formError == nil {
			insertUser := "INSERT INTO account_user (username, age, gender, first name, last name, email, mot_de_passe) VALUES (?, ?, ?, ?, ?, ?, ?)"
			_, err = db.Exec(insertUser, username, age, gender, fistname, lastname, email, hashpass)
			if err != nil {
				fmt.Println(err)
				return
			}

			err := CreateAndSetSessionCookies(w, username)
			fmt.Println(username)

			if err != nil {
				fmt.Println(err)
				return
			}

			// Ajoutez l'utilisateur à la liste des utilisateurs connectés
			userLock.Lock()
			connectedUsers[username] = true
			userLock.Unlock()

			// Envoie la liste mise à jour à tous les clients connectés
			SendUserList()


			// Rediriger l'utilisateur vers la page "/home" après l'enregistrement
			http.Redirect(w, r, "/home", http.StatusSeeOther)
			return
		}
	}

	tmpl, err := template.ParseFiles("templates/sign_up.html")
	data := struct {
		Errors []string
	}{
		Errors: formError,
	}

	if err != nil {
		codeerreur.CodeErreur(w, r, 500, "Template not found : sign_up.html")
		return
	}

	err = tmpl.Execute(w, data)
}

func Log_in(w http.ResponseWriter, r *http.Request) {
	var formError []string
	errMsg := r.URL.Query().Get("error") // Récupérez le message d'erreur de la requête

	if r.Method == http.MethodPost {
		loginIdentifier := r.FormValue("loginidentifier")
		loginpassword := r.FormValue("loginpassword")

		// Ouverture de la connexion à la base de données
		db, err := sql.Open("sqlite", "database/data.db")
		if err != nil {
			formError = append(formError, "Internal Server Error")
			http.Redirect(w, r, "/log_in?error="+url.QueryEscape(strings.Join(formError, "; ")), http.StatusSeeOther)
			return
		}
		defer db.Close()

		var trueemail string
		var truepassword uint32
		var username string
	
		// Check if the login identifier contains "@"
        if strings.Contains(loginIdentifier, "@") {
            // Treat it as an email
            err = db.QueryRow("SELECT username, email, mot_de_passe FROM account_user WHERE email = ?", loginIdentifier).Scan(&username, &trueemail, &truepassword)
        } else {
            // Treat it as a username
            err = db.QueryRow("SELECT username, email, mot_de_passe FROM account_user WHERE username = ?", loginIdentifier).Scan(&username, &trueemail, &truepassword)
        }
		if err != nil {
			formError = append(formError, "Email or Username Doesn't exist.")
		} else {
			hashloginpassword := hash(loginpassword)

			// Vérifier le mot de passe
			if hashloginpassword != truepassword {
				formError = append(formError, "Password Failed.")
			} else {
				// L'utilisateur est connecté avec succès
				err := CreateAndSetSessionCookies(w, username)
				if err != nil {
					formError = append(formError, "Internal Server Error")
					http.Redirect(w, r, "/log_in?error="+url.QueryEscape(strings.Join(formError, "; ")), http.StatusSeeOther)
					return
				}

				// Ajoutez l'utilisateur à la liste des utilisateurs connectés
				userLock.Lock()
				connectedUsers[username] = true
				userLock.Unlock()

				// Envoie la liste mise à jour à tous les clients connectés
				SendUserList()

				// Redirigez l'utilisateur vers la page "/"
				http.Redirect(w, r, "/home", http.StatusSeeOther)
				return
			}
		}
	}

	tmpl, err := template.ParseFiles("templates/login.html")
	data := struct {
		Error  string
		Errors []string
	}{
		Error:  errMsg,
		Errors: formError,
	}
	if err != nil {
		codeerreur.CodeErreur(w, r, 500, "Template not found : login.html")
		return
	}

	err = tmpl.Execute(w, data)
}



func Logout(w http.ResponseWriter, r *http.Request) {
	var notification []string
	// Supprimer le cookie "username"
	usernameCookie, err := r.Cookie("username")
	var username string
	if err == nil {
		username = usernameCookie.Value
		usernameCookie.Expires = time.Now().AddDate(0, 0, -1) // Définir une date d'expiration dans le passé pour supprimer le cookie
		http.SetCookie(w, usernameCookie)
	}

	// Supprimer le cookie "session"
	sessionCookie, err := r.Cookie("session")
	if err == nil {
		sessionCookie.Expires = time.Now().AddDate(0, 0, -1) // Définir une date d'expiration dans le passé pour supprimer le cookie
		http.SetCookie(w, sessionCookie)
	}

	userLock.Lock()
	delete(connectedUsers, username)
	userLock.Unlock()

	// Envoie la liste mise à jour à tous les clients connectés
	SendUserList()


	// Créer un message de notification
	notification = append(notification, "Déconnexion réussie.")

	// Rediriger vers la page "/home" avec le message de notification
	http.Redirect(w, r, "/log_in?error="+url.QueryEscape(strings.Join(notification, "; ")), http.StatusSeeOther)
}

func Home(w http.ResponseWriter, r *http.Request) {

	if r.URL.Path != "/home" && r.URL.Path != "/" {
		codeerreur.CodeErreur(w, r, 404, "Page not found")
		return
	}


	// Vérifiez la validité de la session
	validSession, errMsg := isSessionValid(r)
	if !validSession {
		clearSessionCookies(w)
		// La session n'est pas valide, redirigez l'utilisateur vers la page de connexion ou effectuez d'autres actions
		http.Redirect(w, r, "/log_in?error="+url.QueryEscape(errMsg), http.StatusSeeOther)
		return
	}

	// Récupérer le nom d'utilisateur à partir du cookie "username"
	usernameCookie, err := r.Cookie("username")
	var username string
	if err == nil {
		username = usernameCookie.Value
	}

	var category string
	var discussions []Discussion

	category = r.URL.Query().Get(`category`)

	if category == "" {
		// Récupérer toutes les discussions à partir de la base de données
		discussions, err = GetAllDiscussionsFromDB()
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	} else {
		discussions, err = GetDiscussionsFromDBByCategories(category)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}

	// Récupérer les catégories pour chaque discussion
	for i, discussion := range discussions {
		category, err := GetCategoryForDiscussionFromDB(discussion.ID)
		if err == nil {
			discussions[i].Category = category
		}
	}

	// Récupérer les catégories uniques
	categories := GetUniqueCategoriesFromDiscussions(discussions)

	// Pour chaque discussion, vérifiez si l'utilisateur l'a aimée
	for i := range discussions {
		liked, err := CheckIfUserLikedDiscussion(username, discussions[i].ID)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		discussions[i].Liked = liked

		// Pour chaque discussion, vérifiez si l'utilisateur l'a pas aimée
		disliked, err := CheckIfUserDislikedDiscussion(username, discussions[i].ID)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		discussions[i].Disliked = disliked

		// Pour chaque discussion, vérifiez si l'utilisateur l'a aimée
		numberLike, err := CheckNumberOfLikesForDiscussion(discussions[i].ID)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		discussions[i].NumberLike = numberLike

		numberDislike, err := CheckNumberOfDislikesForDiscussion(discussions[i].ID)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		discussions[i].NumberDislike = numberDislike
	}

	// Ajoutez l'utilisateur à la liste des utilisateurs connectés
				userLock.Lock()
				connectedUsers[username] = true
				userLock.Unlock()

				// Envoie la liste mise à jour à tous les clients connectés
				SendUserList()

	// Créer une structure de données pour passer les informations au modèle
	data := struct {
		Username    string
		Discussions []Discussion
		Categories  []string
	}{
		Username:    username,
		Discussions: discussions,
		Categories:  categories,
	}

	tmpl, err := template.ParseFiles("templates/home.html")
	if err != nil {
		codeerreur.CodeErreur(w, r, 500, "Template not found : home.html")
		return
	}

	err = tmpl.Execute(w, data)
}
