package controllers

import (
	"encoding/json"
	"log"
	"net/http"
)

func PostHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var postData Post

	if err := json.NewDecoder(r.Body).Decode(&postData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	insertPost := "INSERT INTO discussion_user (username, title, message, category) VALUES (?, ?, ?, ?)"
	_, err := Db.Exec(insertPost, postData.Username, postData.TitlePost, postData.Message, postData.Category)
	if err != nil {
		jsonResponse := map[string]interface{}{
			"success": false,
			"message": "Error Post Message",
		}
		err := json.NewEncoder(w).Encode(jsonResponse)
		if err != nil {
			return
		}
		log.Fatal(err)
	} else {
		var postID int
		errors := Db.QueryRow("SELECT last_insert_rowid()").Scan(&postID)
		if errors != nil {
			jsonResponse := map[string]interface{}{
				"success": false,
				"message": "Error Post Message",
			}
			err := json.NewEncoder(w).Encode(jsonResponse)
			if err != nil {
				return
			}
			log.Fatal(errors)
		} else {
			postDataMessage := WebsocketMessage{Type: "post", Data: postData}
			broadcast <- postDataMessage

			jsonResponse := map[string]interface{}{
				"success": true,
				"message": "Post créé",
				"postID":  postID,
			}
			err = json.NewEncoder(w).Encode(jsonResponse)
			if err != nil {
				return
			}
		}
	}

}

func getDiscussionsHandler(w http.ResponseWriter, r *http.Request) {
	// Exécuter la requête pour récupérer les discussions depuis la base de données
	rows, err := Db.Query("SELECT id, username, title, message, category FROM discussion_user ORDER BY id DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Parcourir les résultats et les stocker dans une slice de discussions
	var discussions []Discussion
	for rows.Next() {
		var discussion Discussion
		if err := rows.Scan(&discussion.ID, &discussion.Username, &discussion.Title, &discussion.Message, &discussion.Category); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		discussions = append(discussions, discussion)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encoder les discussions en JSON et les envoyer en réponse
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(discussions); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
