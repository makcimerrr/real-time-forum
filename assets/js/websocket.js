import {deleteCookie} from "./cookie.js";
import {fetchAndDisplayDiscussions} from "./post.js";
import {getCookie} from "./cookie.js";
import {displayUserList} from "./userList.js";
import {displayChatBox} from "./userList.js";
import {showNotification} from "./notif.js";

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
                }
                // Mettre à jour l'interface utilisateur avec la nouvelle discussion
                fetchAndDisplayDiscussions();
            } else if (message.type === 'comment') {
                // Mettre à jour l'interface utilisateur avec la nouvelle discussion
                //fetchAndDisplayDiscussions();
            } else if (message.type === 'login') {
                displayUserList(message.data.connected, message.data.list)
            }else if (message.data.receiverUser === username) {
                showNotification("Nouvelle notif de : " + message.data.senderUser, "notif")

                const chatBody = document.querySelector('.chat-body');
                chatBody.innerHTML = '<p>Click <a id="refreshChat">here</a> to refresh</p>';

                const refreshLink = document.getElementById('refreshChat');
                refreshLink.style.color = 'blue'; // Appliquer la couleur bleue
                refreshLink.style.textDecoration = 'underline'; // Souligner le texte
                refreshLink.style.cursor = 'pointer'; // Utiliser le curseur pointeur

                refreshLink.addEventListener('click', function(event) {
                    event.preventDefault(); // Empêche le comportement par défaut du lien
                    displayChatBox(message.data.senderUser); // Actualiser la boîte de chat
                });

                const notification = document.getElementById("Notification");
                notification.addEventListener('click', function(event) {
                    event.preventDefault(); // Empêche le comportement par défaut du lien
                    displayChatBox(message.data.senderUser); // Actualiser la boîte de chat
                });

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
