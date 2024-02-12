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
)

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrade.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		if err := conn.WriteMessage(messageType, p); err != nil {
			log.Println(err)
			return
		}
	}
}
