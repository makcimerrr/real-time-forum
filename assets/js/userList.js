import {getCookie} from "./cookie.js";
import {showNotification} from "./notif.js";
import {getCurrentTime} from "./time.js";


const usernameVerify = getCookie("username");

export function displayUserList(NumberofConnected, List) {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    const Number = document.createElement("p");
    Number.textContent = "Users Connected :" + NumberofConnected;
    userList.appendChild(Number);

    // Boucle pour afficher chaque utilisateur dans la liste
    const ul = document.createElement("ul");
    List.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        li.id = user
        li.addEventListener("click", () => {
            if (usernameVerify !== user) {
                displayChatBox(user);
            } else {
                showNotification("You can't chat with yourself", "error")
            }
        });
        ul.appendChild(li);
    });

    userList.appendChild(ul);
}

export async function displayChatBox(user) {
    // Création de la boîte de chat
    const chatBox = document.querySelector('.chat-container');
    chatBox.innerHTML = '';

    chatBox.style.display = 'block';

    // Création de l'en-tête de la boîte de chat
    const header = document.createElement('div');
    header.className = 'chat-header';
    header.textContent = 'Chat with ' + user;
    chatBox.appendChild(header);

    const closChatBox = document.createElement("span");
    closChatBox.className = 'closeChatBox';
    closChatBox.textContent = '×';
    closChatBox.addEventListener('click', closeChatBox);
    chatBox.appendChild(closChatBox);

    // Création du corps de la boîte de chat
    const body = document.createElement('div');
    body.className = 'chat-body';
    chatBox.appendChild(body);

    // Récupérer tous les messages de la base de données pour cette conversation
    const messages = await getChatMessages(usernameVerify, user);
    // Sélectionner l'élément où vous souhaitez afficher les messages
    const chatBody = document.querySelector('.chat-body');
    if (messages && messages.length > 0) {
        // Afficher chaque message dans la boîte de chat
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message';

            const sender = message.sendUser === usernameVerify ? 'You' : message.sendUser;
            const messageText = message.message;
            const time = message.time;

            messageElement.innerHTML = `
            <span class="sender">${sender}</span>: 
            <span class="message">${messageText}</span>
            <span class="time">${time}</span>
        `;

            body.appendChild(messageElement);
        });

        chatBox.appendChild(body);
    } else { // Afficher un texte indiquant qu'il n'y a aucun message
        chatBody.innerHTML = '<p>No messages available</p>';
    }


    // Création de la zone de saisie
    const input = document.createElement('input');
    input.className = 'chat-input';
    input.placeholder = 'Type your message here...';
    input.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            sendMessage(user)
        }
    });
    chatBox.appendChild(input);

    // Ajout de la boîte de chat à la page
    document.body.appendChild(chatBox);
}

function closeChatBox() {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.innerHTML = '';
    chatContainer.style.display = 'none';
}

// Fonction pour envoyer le message
async function sendMessage(user) {
    const input = document.querySelector('.chat-input');
    const message = input.value.trim(); // Récupérer le contenu de la zone de saisie
    const time = getCurrentTime();

    if (message !== '') {
        /*console.log("Send user : ", usernameVerify, " to : ", user, " message : ", message, " date : ", time);*/
        const chatData = {
            sendUser: usernameVerify, toUser: user, message: message, time: time
        };

        try {
            const response = await fetch('/chat', {
                method: 'POST', headers: {
                    'Content-Type': 'application/json'
                }, body: JSON.stringify(chatData)
            });

            if (response.ok) {
                const responseData = await response.json();
                if (responseData.success) {
                    showNotification("Message sent", "success")
                    input.value = '';
                    displayChatBox(user);
                } else {
                    showNotification("Bug", "error")
                }
            } else {
                throw Error('Erreur lors de la requête.');
            }
        } catch (error) {
            console.error('Erreur :', error);
        }
    } else {
        showNotification("You can't send an empty message", "error")
    }
}

async function getChatMessages(sender, receiver) {

    const chatData = {
        sender: sender,
        receiver: receiver
    };
    try {
        const response = await fetch('/getChatMessages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chatData)
        });

        if (response.ok) {
            const responseData = await response.json();
            return responseData.message
        } else {
            throw Error('Erreur lors de la requête.');
        }
    } catch (error) {
        console.error('Erreur :', error);
        return [];
    }
}

/*function addMessageToChat(message) {
    var chatBody = document.querySelector('.chat-body');

    var chatMessage = document.createElement('div');
    chatMessage.className = 'chat-message';

    var sender = document.createElement('span');
    sender.className = 'sender';
    sender.textContent = message.sender + ': ';
    chatMessage.appendChild(sender);

    var messageText = document.createElement('span');
    messageText.className = 'message';
    messageText.textContent = message.text;
    chatMessage.appendChild(messageText);

    chatBody.appendChild(chatMessage);
}*/

