import {getCookie} from "./cookie.js";
import {showDiv} from "./show.js";
import {login} from "./login.js";
import {post, fetchAndDisplayDiscussions} from "./post.js";
import {register} from "./register.js";
import {startWebSocket} from "./websocket.js";
import {logout} from "./websocket.js";
import {comment} from "./comment.js";

const username = getCookie("username")
document.addEventListener('DOMContentLoaded', function () {
    // Appeler la fonction pour récupérer et afficher les discussions initiales
    fetchAndDisplayDiscussions();
    // Gérer le clic sur le titre de chaque discussion pour afficher le message
});

const hamburger = document.querySelector(".hamburger");
const userListContainer = document.getElementById("userListContainer");

hamburger.addEventListener("click", function() {
    hamburger.classList.toggle("is-active");
    userListContainer.classList.toggle("is-active");
});

/*document.getElementById('hamburger').addEventListener('click', function() {
    document.querySelector('.container').classList.toggle('show-sidebar');
});*/


window.onload = function () {
    const username = getCookie("username");
    if (username) {
        startWebSocket()
        showDiv("home");
    }
}

document
    .getElementById("Forum")
    .addEventListener("click", function () {
        if (username) {
            showDiv("home");
        }
    });

document
    .getElementById("logout")
    .addEventListener("click", function (event) {
        // Empêcher le comportement de soumission par défaut
        event.preventDefault();

        logout();
    });

document
    .getElementById("loginForm")
    .addEventListener("submit", function (event) {
        // Empêcher le comportement de soumission par défaut
        event.preventDefault();

        // Appeler la fonction login de votre script JavaScript
        login();
    });

document
    .getElementById("registrationForm")
    .addEventListener("submit", function (event) {
        // Empêcher le comportement de soumission par défaut
        event.preventDefault();

        // Appeler la fonction login de votre script JavaScript
        register();
    });

document
    .getElementById("postForm")
    .addEventListener("submit", function (event) {
        // Empêcher le comportement de soumission par défaut
        event.preventDefault();

        // Appeler la fonction login de votre script JavaScript
        post();
    });

document
    .getElementById("commentForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        let currentDiscussionId = event.target.querySelector('button[type="submit"]').id;

        comment(currentDiscussionId);
    });