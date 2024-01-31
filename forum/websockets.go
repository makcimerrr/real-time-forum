package forum

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{conn: conn}
	clients[client] = true

    defer delete(clients, client)

	/*defer func() {
		delete(clients, client)
		conn.Close()
	}()*/

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}

		// Si le message est de type texte
        if messageType == websocket.TextMessage {
            // Traitez le message JSON
            var message map[string]interface{}
            if err := json.Unmarshal(p, &message); err != nil {
                log.Println("Erreur lors de la lecture du message JSON:", err)
                continue
            }

            // Vérifiez le type d'événement
            if eventType, ok := message["event"].(string); ok {
                switch eventType {
                case "user_leaving":
                    // Récupérez le nom d'utilisateur du message
                    if username, ok := message["username"].(string); ok {
                        // Affichez le message dans la console avec fmt
                        fmt.Printf("Utilisateur déconnecté : %s\n", username)
                    }
                default:
                    log.Println("Événement non pris en charge:", eventType)
                }
			}
		}
	}
}

func HandleMessages() {
   	ticker := time.NewTicker(10 * time.Millisecond)
	defer ticker.Stop()

	for range ticker.C {
		SendUserList()
	}
}


func SendUserList() {
    userLock.Lock()
    defer userLock.Unlock()

    userList := make([]string, 0, len(connectedUsers))
    for user := range connectedUsers {
        userList = append(userList, user)
    }

    message := strings.Join(userList, ", ")

    // Mise à jour de la variable globale
    connectedUsersList = userList

    /* Affiche la liste dans la console côté serveur

    if len(userList) > 1 {
        fmt.Println("Liste des utilisateurs connectés :", message)
    }*/

    // Envoyer la liste uniquement aux clients connectés
    for client := range clients {
        err := client.conn.WriteMessage(websocket.TextMessage, []byte(message))
        if err != nil {
            // Gestion de l'erreur (par exemple, log ou fermeture de la connexion)
            fmt.Println("Erreur lors de l'envoi de la liste à un client :", err)
            // Vous pouvez également retirer le client du tableau clients ici
        }
    }
}

func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
    // Retourne la liste des utilisateurs connectés au format JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(connectedUsersList)
}

