import {getCookie, setCookie} from "./cookie.js";
import {showNotification} from "./notif.js";
import {displayChatBox} from "./chat.js";
import {showDiv} from "./show.js";
import {startWebSocket} from "./websocket.js";


export async function displayUserList(usernameVerify, NumberofConnected, List, AllUsers) {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    const Number = document.createElement("p");
    Number.textContent = "Users Connected: " + NumberofConnected;
    userList.appendChild(Number);

    const ul = document.createElement("ul");
    ul.id = "list";

    AllUsers.sort();
    List.sort();

    const ListUserTalk = await ConversationUser();
    console.log(ListUserTalk);

    List.forEach(user => {
        if (usernameVerify === user) {
            return;
        }
        const li = createUserListItem(user, "lightgreen");
        li.addEventListener("click", () => {
            if (usernameVerify !== user) {
                displayChatBox(user);
            } else {
                showNotification("You can't chat with yourself", "error");
            }
        });
        ul.appendChild(li);
    });

    AllUsers.forEach(user => {
        if (!List.includes(user) && usernameVerify !== user) {
            const li = createUserListItem(user, "pink");
            li.addEventListener("click", () => {
                if (usernameVerify !== user) {
                    displayChatBox(user);
                } else {
                    showNotification("You can't chat with yourself", "error");
                }
            });
            ul.appendChild(li);
        }
    });

    ListUserTalk.reverse().forEach(user => {
        const li = ul.querySelector(`#${user}`);
        if (li) {
            ul.insertBefore(li, ul.firstChild);
        }
    });


    userList.appendChild(ul);
}

function createUserListItem(username, color) {
    const li = document.createElement("li");
    li.textContent = username;
    li.id = username;
    li.style.position = "relative";
    li.style.paddingLeft = "20px";
    li.style.background = color;
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
    indicator.style.background = color === "lightgreen" ? "green" : "red";
    indicator.style.borderRadius = "50%";

    li.appendChild(indicator);

    return li;
}

async function ConversationUser() {
    const username = getCookie("username");
    const conversationData = {
        username: username,
    };
    try {
        const response = await fetch('/getConversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(conversationData)
        });

        if (response.ok) {
            const responseData = await response.json();
            return responseData.message
        } else {
            throw Error('Erreur lors de la requête.');
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}

export function updateUserListReceiver(receiver) {
    const userList = document.getElementById("list");

    const li = userList.querySelector(`#${receiver}`);
    if (li) {
        userList.insertBefore(li, userList.firstChild);
    }

}

export function updateUserListSender(sender) {
    const userList = document.getElementById("list");

    const li = userList.querySelector(`#${sender}`);
    if (li) {
        userList.insertBefore(li, userList.firstChild);
    }

}