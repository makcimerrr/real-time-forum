package main

import (
	"fmt"
	"net/http"
	"sync"
	"time"
)

func sendRequest(address string, wg *sync.WaitGroup) {
	defer wg.Done()
	resp, err := http.Get(address)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer resp.Body.Close()

	//Status de la requete (200 = succès)
	fmt.Println("Status Code:", resp.StatusCode)
}

func main() {
	// Adresse du site
	serverAddress := "https://zone01normandie.org/"

	// Nombre de requêtes à envoyer
	numRequests := 2

	var wg sync.WaitGroup

	// Boucle pour les requetes
	for i := 0; i < numRequests; i++ {
		wg.Add(1)
		go sendRequest(serverAddress, &wg)
		//Pause avant la prochaine requete
		time.Sleep(100 * time.Millisecond)
	}

	// Attendre que toutes les requêtes se terminent
	wg.Wait()
}
