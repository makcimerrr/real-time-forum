package controllers

import (
	"encoding/json"
	"net/http"
)

type TypingProgress struct {
	Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
}

func handleTyping(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		Sender   string `json:"sender"`
		Receiver string `json:"receiver"`
		IsTyping bool   `json:"isTyping"`
	}

	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var typingData TypingProgress

	typingData.Sender = requestBody.Sender
	typingData.Receiver = requestBody.Receiver

	if requestBody.IsTyping {
		postDataTyping := WebsocketMessage{Type: "typing", Data: typingData}
		broadcast <- postDataTyping

	} else {
		postDataTyping := WebsocketMessage{Type: "not-typing", Data: typingData}
		broadcast <- postDataTyping
	}
}
