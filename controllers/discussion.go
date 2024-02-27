package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func displayDiscussion(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var discussion DiscussionData

	if err := json.NewDecoder(r.Body).Decode(&discussion); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Println(discussion.Id)

	//Todo :
	//Recupérer les commentaires en fonction de l'id de la discussion
	//Récupérer les autres infos de la discussion
	//Envoyer les infos de la discussion et les commentaires

	if discussion.Id != 1 {
		fmt.Println("Error 1")
		jsonResponse := map[string]interface{}{
			"success": false,
			"message": "Error Post Message",
		}
		err := json.NewEncoder(w).Encode(jsonResponse)
		if err != nil {
			return
		}
	} else {
		fmt.Println("Error 2")
		jsonResponse := map[string]interface{}{
			"success": true,
		}
		err := json.NewEncoder(w).Encode(jsonResponse)
		if err != nil {
			return
		}
	}
}
