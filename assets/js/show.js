import {getCookie} from "./cookie.js";

export function showDiv(divName) {

    let username = getCookie("username");
    // Masquer toutes les divs
    const divs = document.querySelectorAll
    (
        '.logout, .accueil, .home, .createPosteForm, .createCommentForm, .showDiscussion'
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

        if (divName === "accueil"){
            selectedDiv.style.display = 'flex';
        }else {
            selectedDiv.style.display = 'block';
        }
    }

}

const addPostButton = document.getElementById('createPoste');
addPostButton.addEventListener('click', function () {
    showDiv('createPosteForm');
})
