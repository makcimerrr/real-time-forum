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
                console.log("postID", responseData.postID)
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
    if (discussion !== null) {
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
    } else {
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
                    discussionDiv.id = `discussion-${discussion.id}`;

                    // Créer et ajouter un titre h1 pour le nom de l'utilisateur
                    const userHeading = document.createElement('h1');
                    userHeading.classList.add(`discussionUser-${discussion.id}`);
                    userHeading.textContent = `User: ${discussion.username}`;
                    discussionDiv.appendChild(userHeading);

                    // Créer et ajouter un titre h2 pour le titre de la discussion
                    const titleHeading = document.createElement('h2');
                    titleHeading.textContent = `Title: ${discussion.title}`;
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
                });
            } else {
                console.error('Erreur lors de la récupération des discussions');
            }
        } catch (error) {
            console.error('Erreur :', error);
        }
    }
}



