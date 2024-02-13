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

	fs := http.FileServer(http.Dir("assets"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	port := 8080
	fmt.Printf("Voici le lien pour ouvrir la page web http://localhost:%d/", port)
	println()
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	log.Printf("Chemin d'accès de la requête : %s", path)

	err := Templates.ExecuteTemplate(w, "index.html", nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func serveStatic(w http.ResponseWriter, r *http.Request) {
	// Définir le bon type MIME pour les fichiers JavaScript
	w.Header().Set("Content-Type", "text/javascript")

	// Charger le fichier demandé depuis le système de fichiers
	http.ServeFile(w, r, r.URL.Path[1:])
}
