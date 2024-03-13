import {getCookie} from "./cookie.js";
import {extractTimeFromDate, getCurrentTime} from "./time.js";
import {showNotification} from "./notif.js";

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
    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
        console.log("je scroll")
    }

    if (messages && messages.length > 0) {

        let currentDate = null;

        messages.sort((a, b) => {
            const dateA = new Date(a.time);
            const dateB = new Date(b.time);
            return dateA - dateB;
        });
        messages.forEach(message => {

            const messageDate = message.time.split(' ')[0];
            if (messageDate !== currentDate) {
                const dateSeparator = document.createElement('div');
                dateSeparator.className = 'date-separator';
                dateSeparator.textContent = messageDate;
                chatBody.appendChild(dateSeparator);
                currentDate = messageDate;
            }

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
        setTimeout(scrollToBottom, 0);
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
                    showNotification(responseData.message, "error")
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
