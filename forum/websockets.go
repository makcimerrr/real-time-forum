// main.go
package forum

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]string) // Map pour stocker les clients connectés avec leur username
var broadcast = make(chan Message)             // Channel pour diffuser des messages à tous les clients

// Message struct pour stocker les messages envoyés par les clients
type Message struct {
	Action   string `json:"action"`
	Username string `json:"username"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade de la connexion HTTP à une connexion WebSocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer ws.Close()

	// Obtenez le nom d'utilisateur à partir des cookies
	cookie, err := r.Cookie("username")
	if err != nil {
		fmt.Println("Erreur de lecture du cookie:", err)
		return
	}
	username := cookie.Value

	// Enregistrez le nouveau client avec son nom d'utilisateur
	clients[ws] = username

	// Informez les autres clients qu'un nouvel utilisateur a rejoint
	broadcast <- Message{Action: "join", Username: username}

	for {
		// Attendre et lire le prochain message du client (peut être ignoré dans ce cas)
		_, _, err := ws.ReadMessage()
		if err != nil {
			fmt.Printf("Erreur de lecture du message: %v\n", err)
			break
		}
	}
}

func HandleMessages() {
	for {
		// Récupérez le prochain message du canal de diffusion (peut être ignoré dans ce cas)
		<-broadcast
		// Envoyez la liste des utilisateurs connectés à tous les clients
		userList := getUserList()
		for client := range clients {
			err := client.WriteJSON(userList)
			if err != nil {
				fmt.Printf("Erreur d'écriture du message: %v\n", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}


func getUserList() []string {
	// Construisez la liste des utilisateurs connectés
	var userList []string
	for _, username := range clients {
		userList = append(userList, username)
	}
	return userList
}


