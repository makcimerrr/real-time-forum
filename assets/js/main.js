import { getCookie } from "./cookie.js";
import { showDiv } from "./show.js";
import { login } from "./login.js";
import { register } from "./register.js";


window.onload = function () {
    const username = getCookie("username");

    if (username) {
        showDiv("home")
    }
};

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