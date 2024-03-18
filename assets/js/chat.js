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

    const messageGroups = [];

    if (messages && messages.length > 0) {
        for (let i = 0; i < messages.length; i += 10) {
            messageGroups.push(messages.slice(i, i + 10));
        }

        const chatBody = document.querySelector('.chat-body');

        let currentGroupIndex = 0;

        function displayNextGroup() {
            if (currentGroupIndex < messageGroups.length) {
                const group = messageGroups[currentGroupIndex];
                //Affichage des groupes
                //console.log(`Affichage du groupe ${currentGroupIndex + 1}:`, group);
                const groupContainer = document.createElement('div');
                groupContainer.className = 'message-group';


                group.forEach(message => {
                    const messageElement = createMessageElement(usernameVerify, message);
                    groupContainer.appendChild(messageElement);
                });


                chatBody.appendChild(groupContainer);


                currentGroupIndex++;
            }
        }

        //scroll event
        chatBody.addEventListener('scroll', function () {
            const scrollHeight = chatBody.scrollHeight;
            const scrollTop = chatBody.scrollTop;
            const clientHeight = chatBody.clientHeight;

            if (scrollHeight - scrollTop === clientHeight) {
                displayNextGroup();
            }
        });

        displayNextGroup();

    } else {
        const chatBody = document.querySelector('.chat-body');
        chatBody.innerHTML = '<p>No messages available</p>';
    }

    const input = document.createElement('input');
    input.className = 'chat-input';
    input.placeholder = 'Type your message here...';
    input.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            sendMessage(user)
        }
    });
    chatBox.appendChild(input);


    document.body.appendChild(chatBox);
}

function createMessageElement(usernameVerify, message) {
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

    return messageElement;
}

function closeChatBox() {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.innerHTML = '';
    chatContainer.style.display = 'none';
}

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
