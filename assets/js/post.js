import {getCookie} from "./cookie.js";
import {showDiv} from "./show.js";

export async function post() {
    const titlePost = document.getElementById('titlePost').value;
    const category = document.getElementById('category').value;
    const message = document.getElementById('message').value;

    let username = getCookie("username");

    const postData = {
        titlePost: titlePost, category: category, message: message, username: username,
    };

    try {
        const response = await fetch('/post', {
            method: 'POST', headers: {
                'Content-Type': 'application/json'
            }, body: JSON.stringify(postData)
        });

        if (response.ok) {
            const responseData = await response.json();
            if (responseData.success) {
                showDiv("home")
            } else {
                document.getElementById('errorMessageLogin').innerText = responseData.message;
            }
        } else {
            throw Error('Erreur lors de la requête.');
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}

export async function fetchAndDisplayDiscussions(discussion = null) {
    /*if (discussion !== null) {
        const Alldiscussions = document.getElementById('Alldiscussions');

        const discussionDiv = document.createElement('div');
        discussionDiv.id = `discussion-${discussion.id}`;

        // Créer et ajouter un titre h1 pour le nom de l'utilisateur
        const userHeading = document.createElement('h1');
        userHeading.classList.add(`discussionUser-${discussion.id}`);
        userHeading.textContent = `User: ${discussion.username}`;
        discussionDiv.appendChild(userHeading);

        // Créer et ajouter un titre h2 pour le titre de la discussion
        const titleHeading = document.createElement('h2');
        titleHeading.textContent = `Title: ${discussion.titlePost}`;
        titleHeading.classList.add(`discussionTitle-${discussion.id}`);
        discussionDiv.appendChild(titleHeading);

        // Créer et ajouter un paragraphe pour la catégorie
        const categoryParagraph = document.createElement('p');
        categoryParagraph.textContent = `Category: ${discussion.category}`;
        categoryParagraph.classList.add(`discussionCategory-${discussion.id}`);
        discussionDiv.appendChild(categoryParagraph);

        // Créer et ajouter un paragraphe pour le message
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = `Message: ${discussion.message}`;
        messageParagraph.classList.add(`discussionMessage-${discussion.id}`);
        discussionDiv.appendChild(messageParagraph);

        // Ajouter la div de discussion à la liste des utilisateurs
        Alldiscussions.appendChild(discussionDiv);
    } else {*/
        try {
            const response = await fetch('/getDiscussions'); // Endpoint à définir côté serveur pour récupérer les discussions
            if (response.ok) {
                const discussions = await response.json();

                // Afficher les discussions dans la page HTML
                const Alldiscussions = document.getElementById('Alldiscussions');
                Alldiscussions.innerHTML = ''; // Effacer le contenu existant
                discussions.forEach(function (discussion) {
                    // Créer une div pour chaque discussion
                    const discussionDiv = document.createElement('div');
                    discussionDiv.classList.add('Post');
                    discussionDiv.id = `discussion-${discussion.id}`;

                    // Créer et ajouter un titre h1 pour le nom de l'utilisateur
                    const userHeading = document.createElement('h1');
                    userHeading.classList.add('discussionUser');
                    userHeading.textContent = `User: ${discussion.username}`;
                    discussionDiv.appendChild(userHeading);

                    // Créer et ajouter un titre h2 pour le titre de la discussion
                    const titleHeading = document.createElement('h2');
                    titleHeading.textContent = `Title: ${discussion.title}`;
                    titleHeading.classList.add('discussionTitle');
                    discussionDiv.appendChild(titleHeading);

                    // Créer et ajouter un paragraphe pour la catégorie
                    const categoryParagraph = document.createElement('p');
                    categoryParagraph.textContent = `Category: ${discussion.category}`;
                    categoryParagraph.classList.add('discussionCategory');
                    discussionDiv.appendChild(categoryParagraph);

                    // Créer et ajouter un paragraphe pour le message
                    const messageParagraph = document.createElement('p');
                    messageParagraph.textContent = `Message: ${discussion.message}`;
                    messageParagraph.classList.add('discussionMessage');
                    messageParagraph.style.display = 'none'; // Masquer le message par défaut
                    discussionDiv.appendChild(messageParagraph);

                    const AddComment = document.createElement('button')
                    AddComment.textContent = 'Add Comment'
                    AddComment.classList.add('AddComment')
                    AddComment.id = `${discussion.id}`
                    AddComment.style.display = 'none'; // Masquer le message par défaut
                    AddComment.addEventListener('click', function (){
                        let id = discussion.id
                        updateFormWithVariable(id)
                        showDiv('createCommentForm')
                    })
                    discussionDiv.appendChild(AddComment)

                    // Ajouter un gestionnaire d'événements au titre pour afficher/cacher le message
                    titleHeading.addEventListener('click', function () {
                        const messageDiv = discussionDiv.querySelector(`.discussionMessage`);
                        if (messageDiv.style.display === 'none') {
                            messageDiv.style.display = 'block';
                            AddComment.style.display = 'block';
                        } else {
                            messageDiv.style.display = 'none';
                            AddComment.style.display = 'none';
                        }
                    });

                    // Ajouter la div de discussion à la liste des utilisateurs
                    Alldiscussions.appendChild(discussionDiv);
                });
            } else {
                console.error('Erreur lors de la récupération des discussions');
            }
        } catch (error) {
            console.error('Erreur :', error);
        }
}

function updateFormWithVariable(idVariable) {
    // Sélection du formulaire par son ID
    const form = document.getElementById('commentForm');

    // Attribution de l'ID variable au bouton submit
    const submitButton = form.querySelector('.buttonComment');
    submitButton.id = idVariable;
}

document
    .getElementById("commentForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        let currentDiscussionId = event.target.querySelector('button[type="submit"]').id;

        comment(currentDiscussionId);
    });

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