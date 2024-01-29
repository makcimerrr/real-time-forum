package forum

import (
	"database/sql"
	"fmt"
	codeerreur "forum/codeErreur"
	"html/template"
	"log"
	"net/http"
	"net/url"
	"strconv"
)

func CreateDiscussion(w http.ResponseWriter, r *http.Request) {
	// Vérifiez la validité de la session
	validSession, errMsg := isSessionValid(r)
	if !validSession {
		clearSessionCookies(w)
		// La session n'est pas valide, redirigez l'utilisateur vers la page de connexion ou effectuez d'autres actions
		http.Redirect(w, r, "/log_in?error="+url.QueryEscape(errMsg), http.StatusSeeOther)
		return
	}

	logUserCookie, err := r.Cookie("username")
	var logUser string
	if err == nil {
		logUser = logUserCookie.Value
	}
	if r.Method == http.MethodPost {
		title := r.FormValue("title")
		message := r.FormValue("message")
		category := r.FormValue("category") // Récupérez la catégorie du formulaire
		// Obtenez le nom d'utilisateur à partir du cookie "username"
		usernameCookie, err := r.Cookie("username")
		if err != nil {
			// Gérer l'erreur ici, par exemple, en redirigeant l'utilisateur vers une page de connexion s'il n'est pas connecté.
			http.Redirect(w, r, "/log_in", http.StatusSeeOther)
			return
		}
		username := usernameCookie.Value
		// Ouverture de la connexion à la base de données
		db, err := sql.Open("sqlite", "database/data.db")
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer db.Close()
		// Insérez la nouvelle discussion dans la base de données, y compris la catégorie
		_, err = db.Exec("INSERT INTO discussion_user (username, title, message, filter) VALUES (?, ?, ?, ?)", username, title, message, category)

		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		// Récupérez l'ID de la discussion nouvellement créée
		var discussionID int
		err = db.QueryRow("SELECT last_insert_rowid()").Scan(&discussionID)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		// Redirigez l'utilisateur vers la page de la discussion
		http.Redirect(w, r, fmt.Sprintf("/discussion/%d", discussionID), http.StatusSeeOther)
		return
	}

	data := struct{
		LogUser string
	}{
		LogUser: logUser,
	}
	// Affichez la page pour écrire une discussion (write_discussion.html) avec le menu déroulant
	tmpl, err := template.ParseFiles("templates/write_discussion.html")

	if err != nil {
		codeerreur.CodeErreur(w, r, 500, "Template not found : write_discussion.html")
		return
	}

	
	err = tmpl.Execute(w, data)
}

func ShowDiscussion(w http.ResponseWriter, r *http.Request) {
	// Vérifiez la validité de la session
	validSession, errMsg := isSessionValid(r)
	if !validSession {
		clearSessionCookies(w)
		// La session n'est pas valide, redirigez l'utilisateur vers la page de connexion ou effectuez d'autres actions
		http.Redirect(w, r, "/log_in?error="+url.QueryEscape(errMsg), http.StatusSeeOther)
		return
	}

	logUserCookie, err := r.Cookie("username")
	var logUser string
	if err == nil {
		logUser = logUserCookie.Value
	}
	// Récupérez l'ID de la discussion à partir de l'URL
	discussionID := r.URL.Path[len("/discussion/"):]
	// Convertissez l'ID de la discussion en un entier
	discussionIDInt, err := strconv.Atoi(discussionID)
	if err != nil {
		http.Error(w, "Invalid discussion ID", http.StatusBadRequest)
		return
	}
	// Ouverture de la connexion à la base de données
	db, err := sql.Open("sqlite", "database/data.db")
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Effectuez une requête SQL pour récupérer les détails de la discussion en fonction de l'ID
	var username, title, message string
	err = db.QueryRow("SELECT username, title, message FROM discussion_user WHERE id = ?", discussionIDInt).Scan(&username, &title, &message)
	if err != nil {
		http.Error(w, "Discussion not found", http.StatusNotFound)
		return
	}

	// Effectuez une autre requête SQL pour récupérer les commentaires associés à cette discussion
	rows, err := db.Query("SELECT id, username, message FROM comments WHERE discussion_id = ?", discussionIDInt)
	if err != nil {
		http.Error(w, "Error fetching comments", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Créez une structure de données pour stocker les détails de la discussion et les commentaires
	data := struct {
		LogUser string
		Username string
		Title    string
		ID       int
		Message  string
		Filter   *string
		Comments []struct {
			ID     int
			Username string
			Message  string
		}
	}{
		LogUser: logUser,
		Username: username,
		Title:    title,
		ID:       discussionIDInt,
		Message:  message,
	}

	var filter sql.NullString
	err = db.QueryRow("SELECT COALESCE(filter, '') FROM discussion_user WHERE id = ?", discussionIDInt).Scan(&filter)
	if err != nil {
		http.Error(w, "Filter not found", http.StatusNotFound)
		return
	}

	var filterValue string
	if filter.Valid {
		filterValue = filter.String
	}

	data.Filter = &filterValue // Permet l'affiche du filtre {{ .Filter}}

	// Parcourez les commentaires et ajoutez-les à la structure de données
	for rows.Next() {
		var comment struct {
			ID int
			Username string
			Message  string
		}
		if err := rows.Scan(&comment.ID, &comment.Username, &comment.Message); err != nil {
			http.Error(w, "Error scanning comments", http.StatusInternalServerError)
			return
		}
		data.Comments = append(data.Comments, comment)
	}

	// Affichez les détails de la discussion et les commentaires dans un modèle HTML
	tmpl, err := template.ParseFiles("templates/show_discussion.html")

	if err != nil {
		codeerreur.CodeErreur(w, r, 500, "Template not found : show_discussion.html")
		return
	}

	err = tmpl.Execute(w, data)
}

func GetAllDiscussionsFromDB() ([]Discussion, error) {
	// Ouvrez la connexion à la base de données
	db, err := sql.Open("sqlite", "database/data.db")
	if err != nil {
		return nil, err
	}
	defer db.Close()
	// Exécutez une requête SQL pour récupérer toutes les discussions
	rows, err := db.Query("SELECT id, username, title, message FROM discussion_user")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	// Créez une slice pour stocker les discussions
	var discussions []Discussion
	// Parcourez les résultats et stockez-les dans la slice
	for rows.Next() {
		var discussion Discussion
		err := rows.Scan(&discussion.ID, &discussion.Username, &discussion.Title, &discussion.Message)
		if err != nil {
			return nil, err
		}
		discussions = append(discussions, discussion)
	}
	return discussions, nil
}

func GetDiscussionsFromDBByCategories(category string) ([]Discussion, error) {
	// Ouvrez la connexion à la base de données
	db, err := sql.Open("sqlite", "database/data.db")
	if err != nil {
		return nil, err
	}
	defer db.Close()
	// Exécutez une requête SQL pour récupérer toutes les discussions
	// Créez une requête préparée
	stmt, err := db.Prepare("SELECT id, username, title, message FROM discussion_user WHERE filter = $1")
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	// Exécutez la requête préparée avec la variable category
	rows, err := stmt.Query(category)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	// Créez une slice pour stocker les discussions
	var discussions []Discussion
	// Parcourez les résultats et stockez-les dans la slice
	for rows.Next() {
		var discussion Discussion
		err := rows.Scan(&discussion.ID, &discussion.Username, &discussion.Title, &discussion.Message)
		if err != nil {
			return nil, err
		}
		discussions = append(discussions, discussion)
	}
	return discussions, nil
}

func AddMessage(w http.ResponseWriter, r *http.Request) {
	// Vérifiez la validité de la session
	validSession, errMsg := isSessionValid(r)
	if !validSession {
		clearSessionCookies(w)
		// La session n'est pas valide, redirigez l'utilisateur vers la page de connexion ou effectuez d'autres actions
		http.Redirect(w, r, "/log_in?error="+url.QueryEscape(errMsg), http.StatusSeeOther)
		return
	}
	if r.Method == http.MethodPost {
		// Récupérez l'ID de la discussion à partir de l'URL
		discussionID := r.URL.Path[len("/add_message/"):]
		// Convertissez l'ID de la discussion en un entier
		discussionIDInt, err := strconv.Atoi(discussionID)
		if err != nil {
			http.Error(w, "Invalid discussion ID", http.StatusBadRequest)
			return
		}

		message := r.FormValue("message")
		// Obtenez le nom d'utilisateur à partir du cookie "username"
		usernameCookie, err := r.Cookie("username")
		if err != nil {
			// Gérer l'erreur ici, par exemple, en redirigeant l'utilisateur vers une page de connexion s'il n'est pas connecté.
			http.Redirect(w, r, "/log_in", http.StatusSeeOther)
			return
		}
		username := usernameCookie.Value

		// Ouverture de la connexion à la base de données
		db, err := sql.Open("sqlite", "database/data.db")
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer db.Close()

		// Insérez le nouveau message dans la base de données en incluant l'ID de discussion
		_, err = db.Exec("INSERT INTO comments (discussion_id, username, message) VALUES (?, ?, ?)", discussionIDInt, username, message)
		if err != nil {
			log.Printf("Erreur lors de l'insertion du message : %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		// Redirigez l'utilisateur vers la page de discussion
		http.Redirect(w, r, fmt.Sprintf("/discussion/%d", discussionIDInt), http.StatusSeeOther)
		return
	}

	// Affichez la page pour écrire une discussion (write_discussion.html)
	tmpl, err := template.ParseFiles("templates/show_discussion.html")

	if err != nil {
		codeerreur.CodeErreur(w, r, 500, "Template not found : show_discussion.html")
	}
	err = tmpl.Execute(w, nil)
}

func GetCategoryForDiscussionFromDB(discussionID int) (string, error) {
	db, err := sql.Open("sqlite", "database/data.db")
	if err != nil {
		return "", err
	}
	defer db.Close()

	var category string
	err = db.QueryRow("SELECT COALESCE(filter, '') FROM discussion_user WHERE id = ?", discussionID).Scan(&category)
	if err != nil {
		return "", err
	}

	return category, nil
}

func GetUniqueCategoriesFromDiscussions(discussions []Discussion) []string {
	uniqueCategories := make(map[string]struct{})

	// Parcourez les discussions et ajoutez chaque catégorie à la carte uniqueCategories
	for _, discussion := range discussions {
		uniqueCategories[discussion.Category] = struct{}{}
	}

	// Créez une slice pour stocker les catégories uniques
	categories := make([]string, 0, len(uniqueCategories))

	// Parcourez la carte uniqueCategories pour extraire les catégories uniques
	for category := range uniqueCategories {
		categories = append(categories, category)
	}

	return categories
}
