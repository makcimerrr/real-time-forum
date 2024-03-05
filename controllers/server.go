package controllers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
)

func StartServer() {
	var err error
	Db, err = sql.Open("sqlite3", "database/data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			log.Fatal(err)
		}
	}(Db)

	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/login", LoginHandler)
	http.HandleFunc("/post", PostHandler)
	http.HandleFunc("/register", RegisterHandler)
	http.HandleFunc("/ws", WebSocketHandler)
	http.HandleFunc("/getDiscussions", getDiscussionsHandler)
	http.HandleFunc("/comment/", CommentHandler)
	http.HandleFunc("/discussion", displayDiscussion)
	http.HandleFunc("/chat", chatHandler)
	http.HandleFunc("/getChatMessages", getChatMessages)
	go handleMessages()

	fs := http.FileServer(http.Dir("assets"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	port := 8080
	fmt.Printf("Voici le lien pour ouvrir la page web http://localhost:%d/", port)
	println()
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	err := Templates.ExecuteTemplate(w, "index.html", nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
