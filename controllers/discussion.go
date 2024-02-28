package controllers

import (
	"encoding/json"
	"net/http"
)

func displayDiscussion(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var discussion DiscussionData

	var isError bool

	if err := json.NewDecoder(r.Body).Decode(&discussion); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Exécuter la requête pour récupérer les discussions depuis la base de données
	rows, err := Db.Query("SELECT id, username, title, message, category FROM discussion_user WHERE id = ?", discussion.Id)
	if err != nil {
		isError = true
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Parcourir les résultats et les stocker dans une slice de discussions
	var discussions []Discussion
	for rows.Next() {
		var discussion Discussion
		if err := rows.Scan(&discussion.ID, &discussion.Username, &discussion.Title, &discussion.Message, &discussion.Category); err != nil {
			isError = true
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		discussions = append(discussions, discussion)
	}

	AllComments, err := Db.Query("SELECT username, title, message FROM comments WHERE discussion_id = ?", discussion.Id)
	if err != nil {
		isError = true
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer AllComments.Close()

	// Parcourir les résultats et les stocker dans une slice de discussions
	var comments []CommentData
	for AllComments.Next() {
		var comment CommentData
		if err := AllComments.Scan(&comment.Username, &comment.Title, &comment.Message); err != nil {
			isError = true
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		comments = append(comments, comment)
	}

	if isError {
		jsonResponse := map[string]interface{}{
			"success": false,
			"message": "Error Display Discussion",
		}
		err := json.NewEncoder(w).Encode(jsonResponse)
		if err != nil {
			return
		}
	} else {
		jsonResponse := map[string]interface{}{
			"success":    true,
			"discussion": discussions,
			"comments":   comments,
		}
		err := json.NewEncoder(w).Encode(jsonResponse)
		if err != nil {
			return
		}
	}
}
