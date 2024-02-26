import {deleteCookie} from "./cookie.js";
import {fetchAndDisplayDiscussions} from "./post.js";
import { displayNotification } from "./notif.js";
import {getCookie} from "./cookie.js";

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
        const username = getCookie("username");
        // Code JavaScript pour se connecter au serveur WebSocket et afficher la liste des utilisateurs connectés
        NewWebsocket = new WebSocket("ws://localhost:8080/ws?username=" + username);
        // Ajouter des gestionnaires d'événements pour la connexion WebSocket
        NewWebsocket.onopen = function (event) {
            console.log('Connexion WebSocket établie pour l\'utilisateur ' + username);
        };

        NewWebsocket.onmessage = function (event) {
            const message = JSON.parse(event.data);
            //console.log(message);
            if (message.type === 'post') {
                // Vérifier si l'utilisateur actuel est l'auteur du post
                const currentUser = getCookie("username"); // Supposons que vous stockez l'identifiant de l'utilisateur dans un cookie
                if (message.data.username !== currentUser) {
                    console.log("Hey")
                    // Si l'utilisateur actuel n'est pas l'auteur du post, affichez une notification
                    displayNotification("New post added ! By: " + message.data.username); // Cette fonction doit être implémentée pour afficher une notification à l'utilisateur
                }
                // Mettre à jour l'interface utilisateur avec la nouvelle discussion
                fetchAndDisplayDiscussions();
            }else if (message.type === 'comment') {
                // Mettre à jour l'interface utilisateur avec la nouvelle discussion
                //fetchAndDisplayDiscussions();
            }else if (message.type === "add") {
                // Ajouter l'utilisateur à la liste
                var user = message.User;
                var userListElement = document.getElementById("userList");
                var listItem = document.createElement("li");
                listItem.textContent = user;
                userListElement.appendChild(listItem);
            } else if (message.type === "remove") {
                // Supprimer l'utilisateur de la liste
                var user = message.User;
                var userListElement = document.getElementById("userList");
                var listItems = userListElement.getElementsByTagName("li");
                for (var i = 0; i < listItems.length; i++) {
                    if (listItems[i].textContent === user) {
                        userListElement.removeChild(listItems[i]);
                        break;
                    }
                }
            }
        };

        NewWebsocket.onclose = function (event) {
            console.log('Connexion WebSocket fermée avec le statut:', event.code, event.reason);
            if (event.reason) {
                console.log('Raison spécifique:', event.reason);
            }
        };
    }
}