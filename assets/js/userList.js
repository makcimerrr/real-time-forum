import {getCookie} from "./cookie.js";
import {showNotification} from "./notif.js";
import {displayChatBox} from "./chat.js";


export function displayUserList(usernameVerify, NumberofConnected, List, AllUsers) {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    const Number = document.createElement("p");
    Number.textContent = "Users Connected: " + NumberofConnected;
    userList.appendChild(Number);

    const ul = document.createElement("ul");

    AllUsers.forEach(user => {
        if (usernameVerify === user) {
            return;
        }
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
            li.style.position = "relative";
            li.style.paddingLeft = "20px";
            li.style.background = "pink";
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
            indicator.style.background = "red";
            indicator.style.borderRadius = "50%";

            li.appendChild(indicator);
            ul.appendChild(li);
        }
        li.addEventListener("click", () => {
            if (usernameVerify !== user) {
                displayChatBox(user);
            } else {
                showNotification("You can't chat with yourself", "error");
            }
        });
    });
    userList.appendChild(ul);
}