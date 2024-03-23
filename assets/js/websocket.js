import {deleteCookie} from "./cookie.js";
import {fetchAndDisplayDiscussions} from "./post.js";
import {getCookie} from "./cookie.js";
import {displayUserList, updateUserListReceiver, updateUserListSender} from "./userList.js";
import {displayChatBox} from "./chat.js";
import {showNotification} from "./notif.js";

let NewWebsocket;

export function logout() {

    if (NewWebsocket) {
        NewWebsocket.close(1000, "Déconnexion de l'utilisateur : " + getCookie("username"));
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
                const currentUser = getCookie("username");
                if (message.data.username !== currentUser) {
                    console.log("Hey")
                }
                fetchAndDisplayDiscussions();
            } else if (message.type === 'comment') {
                console.log("helloo")
                fetchAndDisplayDiscussions();
                showNotification("Un nouveau commentaire !", "success")
            } else if (message.type === 'login') {
                if (message.data.username === username) {
                    displayUserList(message.data.username, message.data.connected, message.data.list, message.data.allUsers)
                } else {
                    displayUserList(username, message.data.connected, message.data.list, message.data.allUsers)
                }
            } else if (message.type === 'chat') {
                if (message.data.receiverUser === username) {
                    updateUserListSender(message.data.senderUser)
                    showNotification("Nouvelle notif de : " + message.data.senderUser, "notif")

                    const chatBody = document.querySelector('.chat-body');
                    const isChatBoxDisplayed = chatBody.style.display !== 'none';

                    if (isChatBoxDisplayed) {
                        displayChatBox(message.data.senderUser);
                        chatBody.scrollTop = chatBody.scrollHeight - chatBody.offsetHeight;
                    }
                    const notification = document.getElementById("Notification");
                    notification.addEventListener('click', function (event) {
                        event.preventDefault(); // Empêche le comportement par défaut du lien
                        displayChatBox(message.data.senderUser); // Actualiser la boîte de chat
                        chatBody.scrollTop = chatBody.scrollHeight - chatBody.offsetHeight;
                    });
                }else {
                    updateUserListReceiver(message.data.receiverUser)
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
