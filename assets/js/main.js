import {getCookie} from "./cookie.js";
import {showDiv} from "./show.js";
import {login} from "./login.js";
import {post, fetchAndDisplayDiscussions} from "./post.js";
import {register} from "./register.js";
import {startWebSocket} from "./websocket.js";
import {logout} from "./websocket.js";
import {comment} from "./comment.js";
import {showNotification} from "./notif.js";

const toggleButton = document.getElementById('toggleButton');
const toggleButton2 = document.getElementById('toggleButton2');
const test1 = document.querySelector('.loginForm');
const test2 = document.querySelector('.registrationForm');

toggleButton.addEventListener('click', function() {
    if (test1.classList.contains('hidden')) {
        test1.classList.remove('hidden');
        test2.classList.add('hidden2')
    } else {
        test1.classList.add('hidden');
        test2.classList.remove('hidden2');
    }
});

toggleButton2.addEventListener('click', function() {
    if (test2.classList.contains('hidden2')) {
        test2.classList.remove('hidden2');
        test1.classList.add('hidden');
    } else {
        test2.classList.add('hidden2');
        test1.classList.remove('hidden');
    }
});

const username = getCookie("username")

document.addEventListener('DOMContentLoaded', function () {
    fetchAndDisplayDiscussions();
    // Gérer le clic sur le titre de chaque discussion pour afficher le message
});

const hamburger = document.querySelector(".hamburger");
const userListContainer = document.getElementById("userListContainer");

hamburger.addEventListener("click", function() {
    hamburger.classList.toggle("is-active");
    userListContainer.classList.toggle("is-active");
});


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
        const usernameVerify = getCookie("username")
        if (usernameVerify) {
            showDiv("home");
        }else {
            showNotification("Veuillez vous connecter pour accéder au forum", "notif")
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