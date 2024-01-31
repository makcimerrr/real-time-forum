package forum

import (
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Discussion struct {
	ID            int
	Title         string
	Message       string
	Username      string
	Category      string
	Liked         bool // Champ pour indiquer si l'utilisateur a aimé cette discussion
	Disliked      bool
	NumberLike    int
	NumberDislike int
}

// Ajoutez cette structure pour représenter un message
type Comment struct {
	Username string
	Message  string
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	conn *websocket.Conn
}

var clients = make(map[*Client]bool)
var broadcast = make(chan string)


var connectedUsers = make(map[string]bool)
var userLock sync.Mutex

var connectedUsersList []string

