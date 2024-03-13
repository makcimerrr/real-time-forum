import {getCookie} from "./cookie.js";
import {showDiv} from "./show.js";
import {updateFormWithVariable} from "./comment.js";
import {displayDiscussion} from "./discussion.js";

let currentPage = 1;
const discussionsPerPage = 15;
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
    try {
        const response = await fetch('/getDiscussions'); // Endpoint à définir côté serveur pour récupérer les discussions
        if (response.ok) {
            const discussions = await response.json();
            displayDiscussions(discussions);
        } else {
            console.error('Erreur lors de la récupération des discussions');
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}
function displayDiscussions(discussions) {
    const Alldiscussions = document.getElementById('Alldiscussions');
    Alldiscussions.innerHTML = '';
    const startIndex = (currentPage - 1) * discussionsPerPage;
    const endIndex = startIndex + discussionsPerPage;
    const currentDiscussions = discussions.slice(startIndex, endIndex);
    currentDiscussions.forEach(function (discussion) {
        const discussionDiv = document.createElement('div');
        discussionDiv.classList.add('Post');
        discussionDiv.id = `discussion-${discussion.id}`;
        const userHeading = document.createElement('h1');
        userHeading.classList.add('discussionUser');
        userHeading.textContent = `User: ${discussion.username}`;
        discussionDiv.appendChild(userHeading);
        const titleHeading = document.createElement('h2');
        titleHeading.textContent = `Title: ${discussion.title}`;
        titleHeading.classList.add('discussionTitle');
        titleHeading.style.cursor = 'pointer';
        discussionDiv.appendChild(titleHeading);
        const categoryParagraph = document.createElement('p');
        categoryParagraph.textContent = `Category: ${discussion.category}`;
        categoryParagraph.classList.add('discussionCategory');
        discussionDiv.appendChild(categoryParagraph);
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = `Message: ${discussion.message}`;
        messageParagraph.classList.add('discussionMessage');
        messageParagraph.style.display = 'none';
        discussionDiv.appendChild(messageParagraph);

        const AddComment = document.createElement('button')
        const AddCommentText = document.createElement('span')
        AddCommentText.textContent = 'Add Comment'
        AddComment.appendChild(AddCommentText)
        AddComment.classList.add('bn3637')
        AddComment.classList.add('bn38')
        AddComment.id = `${discussion.id}`
        AddComment.style.display = 'none';
        AddComment.addEventListener('click', function () {
            let id = discussion.id
            updateFormWithVariable(id)
            showDiv('createCommentForm')
        })

        const ShowDiscussion = document.createElement('button')
        const ShowDiscussionText = document.createElement('span')
        ShowDiscussion.appendChild(ShowDiscussionText)
        ShowDiscussionText.textContent = 'Show Discussion'
        ShowDiscussion.classList.add('bn3637')
        ShowDiscussion.classList.add('bn38')
        ShowDiscussion.id = `${discussion.id}`
        ShowDiscussion.style.display = 'none';
        ShowDiscussion.addEventListener('click', function () {
            let id = discussion.id
            console.log("ShowDiscussion", id)
            displayDiscussion(id)
            showDiv('showDiscussion')
        })


        const divButton = document.createElement('div')
        divButton.classList.add('divButton')
        divButton.appendChild(AddComment)
        divButton.appendChild(ShowDiscussion)
        discussionDiv.appendChild(divButton)


        titleHeading.addEventListener('click', function () {
            const messageDiv = discussionDiv.querySelector(`.discussionMessage`);
            if (messageDiv.style.display === 'none') {
                messageDiv.style.display = 'block';
                AddComment.style.display = 'block';
                ShowDiscussion.style.display = 'block';
            } else {
                messageDiv.style.display = 'none';
                AddComment.style.display = 'none';
                ShowDiscussion.style.display = 'none';
            }
        });
        Alldiscussions.appendChild(discussionDiv);
    });
    // Gestion de la pagination
    const totalPages = Math.ceil(discussions.length / discussionsPerPage);
    renderPaginationButtons(totalPages);
}

function renderPaginationButtons(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', function () {
            currentPage = i;
            fetchAndDisplayDiscussions(currentPage);
            updateActiveButton();
        });
        paginationContainer.appendChild(button);
    }
}

function updateActiveButton() {
    const buttons = document.querySelectorAll('#pagination button');
    buttons.forEach(function(button, index) {
        if (index + 1 === currentPage) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}
