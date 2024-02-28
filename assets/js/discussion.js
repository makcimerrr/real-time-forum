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
                displayDiscussionDetails(responseData);
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

function displayDiscussionDetails(responseData) {
    const discussionContainer = document.getElementById('showDiscussion');
    discussionContainer.innerHTML = '';

    // Créez les éléments HTML correspondant aux détails de la discussion
    const h1 = document.createElement("h1");
    h1.textContent = "Discussion Details";
    discussionContainer.appendChild(h1);

    // Affichage des discussions
    responseData.discussion.forEach(discussion => {
        const discussionDiv = document.createElement("div");
        discussionDiv.classList.add("discussion");
        discussionDiv.innerHTML = `
            <h3>${discussion.title}</h3>
            <p><strong>Par :</strong> ${discussion.username}</p>
            <p>${discussion.message}</p>
        `;
        discussionContainer.appendChild(discussionDiv);
    });

    // Affichage des commentaires
    responseData.comments.forEach(comment => {
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("comment");
        commentDiv.innerHTML = `
            <p><strong>${comment.username}</strong></p>
            <p>${comment.title}</p>
            <p>${comment.message}</p>
        `;
        discussionContainer.appendChild(commentDiv);
    });
}
