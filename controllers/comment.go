package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

func CommentHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var commentData CommentData

	if err := json.NewDecoder(r.Body).Decode(&commentData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Récupérez l'ID de la discussion à partir de l'URL
	discussionID := r.URL.Path[len("/comment/"):]
	// Convertissez l'ID de la discussion en un entier
	discussionIDInt, err := strconv.Atoi(discussionID)
	if err != nil {
		http.Error(w, "Invalid discussion ID", http.StatusBadRequest)
		return
	}
	insertComment := "INSERT INTO comments (discussion_id, username, title, message) VALUES (?, ?, ?, ?)"
	_, err = Db.Exec(insertComment, discussionIDInt, commentData.Username, commentData.Title, commentData.Message)
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
		postDataMessage := WebsocketMessage{Type: "comment", Data: commentData}
		broadcast <- postDataMessage

		jsonResponse := map[string]interface{}{
			"success": true,
			"message": "Commentaire créé avec succès",
		}
		err = json.NewEncoder(w).Encode(jsonResponse)
		if err != nil {
			return
		}
	}
}
