package controllers

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	_ "github.com/gorilla/websocket"
)

var (
	upgrade = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	// clients est une carte qui associe chaque connexion WebSocket à ses données utilisateur
	clients   = make(map[*websocket.Conn]bool)
	broadcast = make(chan WebsocketMessage)
)

type WebsocketMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrade.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	// Ajouter la connexion à la carte des clients
	clients[conn] = true

	for {
		var message WebsocketMessage
		err := conn.ReadJSON(&message)
		if err != nil {
			log.Println(err)
			delete(clients, conn)
			break
		}
	}
}

func handleMessages() {
	for {
		post := <-broadcast
		for client := range clients {
			err := client.WriteJSON(post)
			if err != nil {
				log.Println(err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}
