import {getCookie} from "./cookie.js";

// Récupérer les liens par leur ID
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');

// Ajouter un gestionnaire d'événements pour le clic sur le lien "Login"
loginLink.addEventListener('click', function(event) {
    event.preventDefault(); // Empêcher le comportement par défaut du lien
    showDiv('loginForm');
});

// Ajouter un gestionnaire d'événements pour le clic sur le lien "Register"
registerLink.addEventListener('click', function(event) {
    event.preventDefault(); // Empêcher le comportement par défaut du lien
    showDiv('registrationForm');
});

export function showDiv(divName) {

    let username = getCookie("username");
    // Masquer toutes les divs
    const divs = document.querySelectorAll
    (
        '.logout, .loginForm, .accueil, .registrationForm, .home, .createPosteForm'
    );
    divs.forEach(function (div) {
        div.style.display = 'none';
    });

    // Afficher la div spécifiée
    const selectedDiv = document.querySelector('.' + divName);
    if (selectedDiv) {
        if (divName === "home"){
            const header = document.querySelector("header");
            header.style.display = "block";
            const titleDiv = document.getElementById("title");
            titleDiv.innerHTML = ''
            titleDiv.innerHTML = "Home - " + username;
        }
        selectedDiv.style.display = 'block';
    }

}

const addPostButton = document.getElementById('createPoste');
addPostButton.addEventListener('click', function () {
    showDiv('createPosteForm');
})
