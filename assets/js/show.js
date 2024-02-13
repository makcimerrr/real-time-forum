import {logout} from "./login.js";
import {getCookie} from "./cookie.js";

function showHome() {
    const username = getCookie("username");

    if (username) {
        var header = document.querySelector("header");
        var logoutButton = document.createElement("button");
        logoutButton.textContent = "Déconnexion";
        logoutButton.onclick = logout;

        // Ajouter le bouton de déconnexion à l'élément header
        header.appendChild(logoutButton);

        var title = document.getElementById("title");
        var heading = document.createElement("h3");
        heading.innerHTML = "Accueil - " + username;
        title.appendChild(heading)
    } else {
        console.error("Impossible de trouver le nom d'utilisateur dans les cookies.");
    }
}

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
    // Masquer toutes les divs
    var divs = document.querySelectorAll
    (
        '.logout, .loginForm, .accueil, .registrationForm, .home'
    );
    divs.forEach(function (div) {
        div.style.display = 'none';
    });

    // Afficher la div spécifiée
    var selectedDiv = document.querySelector('.' + divName);
    if (selectedDiv) {
        selectedDiv.style.display = 'block';
        if (divName === "home") {
            showHome();
        }
    }

}