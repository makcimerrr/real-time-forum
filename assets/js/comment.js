import {getCookie} from "./cookie.js";
import {showDiv} from "./show.js";

export function updateFormWithVariable(idVariable) {
    const form = document.getElementById('commentForm');

    // Attribution de l'ID variable au bouton submit
    const submitButton = form.querySelector('.buttonComment');
    submitButton.id = idVariable;
}
export async function comment(id) {
    const username = getCookie("username")
    // Récupérer les valeurs du formulaire
    const title = document.getElementById('titleComment').value;
    const message = document.getElementById('messageComment').value;
    const discussionId = id;


    const commentData = {
        username : username,
        title: title,
        message: message,
    };

    try {
        const response = await fetch('/comment/' + discussionId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentData)
        });

        if (response.ok) {
            const responseData = await response.json();
            if (responseData.success) {
                showDiv("home")
            } else {
                document.getElementById('notifTextComment').innerText = responseData.message;
            }
        } else {
            throw Error('Erreur lors de la requête.');
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}