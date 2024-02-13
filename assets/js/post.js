import {getCookie} from "./cookie.js";
import {showDiv} from "./show.js";

export async function post() {
    const titlePost = document.getElementById('titlePost').value;
    const category = document.getElementById('category').value;
    const message = document.getElementById('message').value;

    let username = getCookie("username");

    const postData = {
        titlePost: titlePost,
        category: category,
        message: message,
        username: username,
    };

    try {
        const response = await fetch('/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
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