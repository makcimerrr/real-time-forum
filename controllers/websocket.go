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
	clients   = make(map[*websocket.Conn]bool)
	broadcast = make(chan Post)
)

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrade.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	clients[conn] = true

	for {
		var post Post
		err := conn.ReadJSON(&post)
		if err != nil {
			log.Println(err)
			delete(clients, conn)
			return
		}
		broadcast <- post
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
