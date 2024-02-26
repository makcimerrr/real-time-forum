package controllers

import (
	"github.com/gorilla/websocket"
	_ "github.com/gorilla/websocket"
	"log"
	"net/http"
)

var (
	upgrade = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	// clients est une carte qui associe chaque connexion WebSocket à ses données utilisateur
	clients   = make(map[*websocket.Conn]*Client)
	broadcast = make(chan WebsocketMessage)
	List      []string
)

// Créez une structure pour stocker à la fois la connexion websocket et le nom d'utilisateur
type Client struct {
	Conn     *websocket.Conn
	Username string
}

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

	// Obtenez le nom d'utilisateur de la demande ou utilisez une valeur par défaut
	username := r.URL.Query().Get("username")
	if username == "" {
		username = "Unknown"
	}

	// Ajoutez la connexion et le nom d'utilisateur à la carte des clients
	clients[conn] = &Client{
		Conn:     conn,
		Username: username,
	}

	// Ajoutez l'utilisateur à la liste
	updateList(username, true)

	for {
		var message WebsocketMessage
		err := conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure) {
				log.Println("Déconnexion")
			}
			log.Println("Error:", err)
			delete(clients, conn)
			// Supprimez l'utilisateur de la liste
			updateList(username, false)
			break
		}
	}
}

func handleMessages() {
	for {
		message := <-broadcast
		for client := range clients {
			err := client.WriteJSON(message)
			if err != nil {
				log.Println(err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}
