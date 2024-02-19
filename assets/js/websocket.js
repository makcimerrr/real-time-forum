import {deleteCookie} from "./cookie.js";
import {fetchAndDisplayDiscussions} from "./post.js";

let NewWebsocket;

export function logout() {

    if (NewWebsocket) {
        NewWebsocket.close(1000, "Déconnexion de l'utilisateur");
        NewWebsocket = null; // Réinitialiser la variable websocket pour pouvoir la rétablir lors de la prochaine connexion
    }
    deleteCookie("username", "strict");
    deleteCookie("token", "strict");

    window.location.reload();
}

export function startWebSocket() {
    // Vérifier si la connexion WebSocket n'est pas déjà établie
    if (!NewWebsocket) {
        // Code JavaScript pour se connecter au serveur WebSocket et afficher la liste des utilisateurs connectés
        NewWebsocket = new WebSocket("ws://localhost:8080/ws");
        // Ajouter des gestionnaires d'événements pour la connexion WebSocket
        NewWebsocket.onopen = function (event) {
            console.log('Connexion WebSocket établie');
        };

        NewWebsocket.onmessage = function (event) {
            const discussion = JSON.parse(event.data);
            console.log(discussion)
            // Mettre à jour l'interface utilisateur avec la nouvelle discussion
            fetchAndDisplayDiscussions();
        };

        NewWebsocket.onclose = function (event) {
            console.log('Connexion WebSocket fermée avec le statut:', event.code, event.reason);
            if (event.reason) {
                console.log('Raison spécifique:', event.reason);
            }
        };
    }
}
