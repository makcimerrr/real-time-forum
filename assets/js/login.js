import { setCookie, deleteCookie } from "./cookie.js";
import { showDiv } from "./show.js";
import { startWebSocket } from "./websocket.js";



export async function login() {
    const loginData = document.getElementById('logindata').value;
    const loginPassword = document.getElementById('loginpassword').value;

    const loginUserData = {
        loginData: loginData,
        loginPassword: loginPassword
    };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginUserData)
        });

        if (response.ok) {
            const responseData = await response.json();
            if (responseData.success) {
                setCookie("username", responseData.username, 30, "strict"); // 30 jours de durée de vie du cookie
                setCookie("token", responseData.token, 30, "strict");
                showDiv("home")
                startWebSocket();
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