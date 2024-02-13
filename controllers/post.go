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

	var postData struct {
		Username  string `json:"username"`
		TitlePost string `json:"titlePost"`
		Category  string `json:"category"`
		Mesage    string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&postData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	insertPost := "INSERT INTO discussion_user (username, title, message, category) VALUES (?, ?, ?, ?)"
	_, err := Db.Exec(insertPost, postData.Username, postData.TitlePost, postData.Mesage, postData.Category)
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
