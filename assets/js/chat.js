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

    const chatBody = document.querySelector('.chat-body');
    chatBody.innerHTML = ''; // Efface le contenu existant de la div chat-body

    const messages = await getChatMessages(usernameVerify, user);

    if (messages && messages.length > 0) {

        console.log(messages.length)

        const numberOfGroups = Math.ceil(messages.length / 10);
        console.log(numberOfGroups)


        messages.sort((a, b) => new Date(b.date) - new Date(a.date));

        let currentGroupIndex = 0;


        console.log("currentGroupIndex: " + currentGroupIndex);

        const groups = [];
        for (let i = 0; i < numberOfGroups; i++) {
            const startIndex = messages.length - ((i + 1) * 10);
            const endIndex = startIndex + 10;
            groups.push(messages.slice(startIndex >= 0 ? startIndex : 0, endIndex));
        }

        const group = groups[currentGroupIndex];
       const firstGroup = displayMessages(chatBody, group, usernameVerify);

       chatBody.appendChild(firstGroup);


        chatBody.addEventListener('scroll', function () {
            const scrollTop = chatBody.scrollTop;
            if (scrollTop === 0 && currentGroupIndex >= 0) {
                if (currentGroupIndex < numberOfGroups- 1) {
                    currentGroupIndex++;
                    const group = groups[currentGroupIndex];
                    const displayGroup = displayMessages(chatBody, group, usernameVerify);

                    chatBody.insertBefore(displayGroup, chatBody.firstChild);
                    console.log("currentGroupIndex: " + currentGroupIndex);
                }
            }
        });

    } else {
        const messageElement = document.createElement('p');
        messageElement.textContent = 'No messages yet';
        chatBody.appendChild(messageElement);
    }

    const input = document.createElement('input');
    input.className = 'chat-input';
    input.placeholder = 'Type your message here...';
    input.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            sendMessage(user);
        }
    });
    chatBox.appendChild(input);

    document.body.appendChild(chatBox);

    chatBody.scrollTop = chatBody.scrollHeight - chatBody.clientHeight;
}

function displayMessages(chatBody, messages, usernameVerify) {
    const group = document.createElement('div');
    group.className = 'group';
    messages.forEach(message => {
        const messageElement = createMessageElement(usernameVerify, message);
        group.appendChild(messageElement);
    });

    chatBody.scrollTop = chatBody.scrollHeight - chatBody.clientHeight;

    return group;
}

function createDateSeparator(date) {
    const separator = document.createElement('div');
    separator.className = 'date-separator';
    separator.textContent = date;
    return separator;
}


/*export async function displayChatBox(user) {
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

    const chatBody = document.querySelector('.chat-body');

    const messages = await getChatMessages(usernameVerify, user);

    console.log(messages)

    const messageGroups = [];

    if (messages && messages.length > 0) {
        // Group messages by date
        const groupedMessages = groupMessagesByDate(messages);

        for (const group of groupedMessages) {
            messageGroups.push(group); // Add the group to the end
        }

        let currentGroupIndex = messageGroups.length - 1; // Start from the latest messages
        let messagesToDisplay = [];

        let isFirstOpen = true;
        function displayNextGroup() {
            if (currentGroupIndex >= 0) {
                const group = messageGroups[currentGroupIndex];
                const groupContainer = document.createElement('div');
                groupContainer.className = 'message-group';

                // Display date separator
                const dateSeparator = createDateSeparator(group.date);
                groupContainer.appendChild(dateSeparator);

                // Add messages to messagesToDisplay, up to a maximum of 10 messages
                const remainingMessages = group.messages.slice(0, 10 - messagesToDisplay.length);
                messagesToDisplay = messagesToDisplay.concat(remainingMessages);

                // Display messages in the group container
                messagesToDisplay.forEach(message => {
                    const messageElement = createMessageElement(usernameVerify, message);
                    groupContainer.appendChild(messageElement);
                });

                chatBody.insertBefore(groupContainer, chatBody.firstChild);

                    chatBody.scrollTop =  chatBody.scrollHeight;


                currentGroupIndex--;
                console.log("Group", currentGroupIndex + 1, "has", messagesToDisplay.length, "messages");

                // If the messagesToDisplay array is full (10 messages), reset it for the next group
                if (messagesToDisplay.length === 10) {
                    messagesToDisplay = [];
                }
            }
        }

        chatBody.addEventListener('scroll', function () {
            const scrollTop = chatBody.scrollTop;

            if (scrollTop === 0 && currentGroupIndex >= 0) {
                displayNextGroup();
            }
        });

        displayNextGroup();
    } else {
        body.innerHTML = '<p>No messages available</p>';
    }

    const input = document.createElement('input');
    input.className = 'chat-input';
    input.placeholder = 'Type your message here...';
    input.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            sendMessage(user);
        }
    });
    chatBox.appendChild(input);

    document.body.appendChild(chatBox);
}

function groupMessagesByDate(messages) {
    const groups = [];
    let currentDate = null;
    let currentGroup = null;
    messages.forEach(message => {
        const messageDate = message.time.split(' ')[0];
        if (messageDate !== currentDate) {
            if (currentGroup) {
                groups.push(currentGroup); // Add the latest group to the end
            }
            currentGroup = { date: messageDate, messages: [] };
            currentDate = messageDate;
        }
        currentGroup.messages.push(message); // Add the message to the group
    });
    if (currentGroup) {
        groups.push(currentGroup); // Add the last group to the end
    }
    return groups // Reverse the order of groups to display the latest first
}
function createDateSeparator(date) {
    const separator = document.createElement('div');
    separator.className = 'date-separator';
    separator.textContent = date;
    return separator;
}*/

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
