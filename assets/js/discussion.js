import {updateFormWithVariable} from "./comment.js";
import {showDiv} from "./show.js";

export async function displayDiscussion(id) {
    const discussion = document.querySelector('showDiscussion');

    const idDiscussion = id

    const DiscussionData = {
        id: idDiscussion
    };

    try {
        const response = await fetch('/discussion', {
            method: 'POST', headers: {
                'Content-Type': 'application/json'
            }, body: JSON.stringify(DiscussionData)
        });

        if (response.ok) {
            const responseData = await response.json();
            if (responseData.success) {
                console.log("Discussion affichee")
                displayDiscussionDetails(responseData, idDiscussion);
            } else {
                console.log("Erreur")
            }
        } else {
            throw Error('Erreur lors de la requête.');
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}

function displayDiscussionDetails(responseData, idDiscussion) {
    const discussionContainer = document.getElementById('showDiscussion');
    discussionContainer.innerHTML = ''

    const h1 = document.createElement("h1");
    h1.textContent = "Discussion Details";
    discussionContainer.appendChild(h1);

    responseData.discussion.forEach(discussion => {
        const discussionDiv = document.createElement("div");
        discussionDiv.classList.add("discussion");
        discussionDiv.innerHTML = `
            <h3>Title Post : ${discussion.title}</h3>
            <p><strong>By : </strong> ${discussion.username}</p>
            <p>Message : ${discussion.message}</p>
        `;
        discussionContainer.appendChild(discussionDiv);
    });

    if (!responseData.comments || responseData.comments.length === 0) {
        const p = document.createElement("p");
        p.textContent = "No comments yet";
        p.style.color = "red";
        p.style.textAlign = "center";
        p.style.marginTop = "10px";
        p.style.marginBottom = "10px";
        discussionContainer.appendChild(p);
    } else {
        responseData.comments.forEach(comment => {
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("comment");
            commentDiv.innerHTML = `
            <p>From : <strong>${comment.username}</strong></p>
            <p>Title : ${comment.title}</p>
            <p>Message : ${comment.message}</p>
        `;
            discussionContainer.appendChild(commentDiv);
        });
    }

    const AddComment = document.createElement('button')
    AddComment.textContent = 'Add Comment'
    AddComment.classList.add('bn3637')
    AddComment.classList.add('bn38')
    AddComment.id = idDiscussion
    AddComment.addEventListener('click', function () {
        let id = idDiscussion
        updateFormWithVariable(id)
        showDiv('createCommentForm')
    })
    discussionContainer.appendChild(AddComment)
}
