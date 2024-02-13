import { getCookie } from "./cookie.js";
import { showDiv } from "./show.js";
import { login, logout } from "./login.js";
import { post } from "./post.js";

window.onload = function () {
    const username = getCookie("username");

    if (username) {

        const header = document.querySelector("header");
        header.style.display = "block";
        const titleDiv = document.getElementById("title");
        const existingText = titleDiv.innerHTML;
        titleDiv.innerHTML = existingText + " - " + username;
        showDiv("home")
    }
};

document
    .getElementById("Forum")
    .addEventListener("click", function () {
        showDiv("home");
    });

document
    .getElementById("logout")
    .addEventListener("click", function (event) {
        // Empêcher le comportement de soumission par défaut
        event.preventDefault();

        // Appeler la fonction login de votre script JavaScript
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