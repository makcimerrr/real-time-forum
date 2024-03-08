import {getCookie} from "./cookie.js";
import {showNotification} from "./notif.js";
import {getCurrentTime, extractTimeFromDate} from "./time.js";


export function displayUserList(usernameVerify, NumberofConnected, List, AllUsers) {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    const Number = document.createElement("p");
    Number.textContent = "Users Connected: " + NumberofConnected;
    userList.appendChild(Number);

    const ul = document.createElement("ul");

    AllUsers.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        li.id = user;

        if (List.includes(user)) {
            li.style.position = "relative";
            li.style.paddingLeft = "20px";
            li.style.background = "lightgreen";
            li.style.borderRadius = "5px";
            li.style.marginBottom = "5px";
            li.style.listStyleType = "none";

            const indicator = document.createElement("div");
            indicator.style.position = "absolute";
            indicator.style.top = "50%";
            indicator.style.left = "5px";
            indicator.style.transform = "translateY(-50%)";
            indicator.style.width = "10px";
            indicator.style.height = "10px";
            indicator.style.background = "green";
            indicator.style.borderRadius = "50%";

            li.appendChild(indicator);
            ul.prepend(li); // Ajouter au haut
        } else {
            ul.appendChild(li);
        }

        console.log("user: " + user + " usernameVerify: " + usernameVerify);
        // Ajouter un écouteur d'événements au clic sur l'utilisateur
        li.addEventListener("click", () => {
            if (usernameVerify !== user) {
                displayChatBox(user);
            } else {
                showNotification("You can't chat with yourself", "error");
            }
        });
    });

    // Ajouter la liste d'utilisateurs à l'élément userList
    userList.appendChild(ul);
}


export async function displayChatBox(user) {

    const usernameVerify = getCookie("username");
    const chatBox = document.querySelector('.chat-container');
    chatBox.innerHTML = '';

    chatBox.style.display = 'block';

    const header = document.createElement('div');
    header.className = 'chat-header';
    header.textContent = 'Chat with ' + user;
    chatBox.appendChild(header);

    const closChatBox = document.createElement("span");
    closChatBox.className = 'closeChatBox';
    closChatBox.textContent = '×';
    closChatBox.addEventListener('click', closeChatBox);
    chatBox.appendChild(closChatBox);

    const body = document.createElement('div');
    body.className = 'chat-body';
    chatBox.appendChild(body);

    const messages = await getChatMessages(usernameVerify, user);
    const chatBody = document.querySelector('.chat-body');
    if (messages && messages.length > 0) {

        messages.sort((a, b) => {
            const dateA = new Date(a.time);
            const dateB = new Date(b.time);
            return dateA - dateB;
        });
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message';

            const sender = message.sendUser === usernameVerify ? 'You' : message.sendUser;
            const messageText = message.message;
            const time = extractTimeFromDate(message.time);

            const messageClass = message.sendUser === usernameVerify ? 'you' : 'other';

            messageElement.innerHTML = `
<div class="message-container ${messageClass}">
            <span class="sender">${sender}</span>: 
            <span class="message">${messageText}</span>
            <span class="time">${time}</span>
            </div>
        `;

            body.appendChild(messageElement);
        });

        chatBox.appendChild(body);
    } else {
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
    const usernameVerify = getCookie("username");
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

