window.onload = function () {
    const username = getCookie("username");

    if (username) {
        showDiv("home")
        startWebSocket();
    }
};

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
        title.appendChild(heading);
    } else {
        console.error("Impossible de trouver le nom d'utilisateur dans les cookies.");
    }
}

// Fonction pour envoyer le message de déconnexion au serveur websocket
function logout() {
    const username = getCookie("username");
    deleteCookie("username", "strict");
    deleteCookie("token", "strict");
    const message = {
        type: "logout",
        username: username // Remplacer "username_to_logout" par le nom d'utilisateur à déconnecter
    };
    socket.send(JSON.stringify(message));
}

function logout() {
    deleteCookie("username", "strict");
    deleteCookie("token", "strict");

    window.location.reload();
}

function deleteCookie(name, sameSite) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/" + (sameSite ? "; SameSite=" + sameSite : "");
}

document
    .getElementById("loginForm")
    .addEventListener("submit", function (event) {
        // Empêcher le comportement de soumission par défaut
        event.preventDefault();

        // Appeler la fonction login de votre script JavaScript
        login();
    });

async function login() {
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
                showDiv("home");
                startWebSocket();
            } else {
                document.getElementById('errorMessageLogin').innerText = responseData.message;
            }
        } else {
            throw new Error('Erreur lors de la requête.');
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}

document
    .getElementById("registrationForm")
    .addEventListener("submit", function (event) {
        // Empêcher le comportement de soumission par défaut
        event.preventDefault();

        console.log("Hello")

        // Appeler la fonction login de votre script JavaScript
        register();
    });

async function register() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;

    const userData = {
        username: username,
        email: email,
        password: password,
        age: age,
        gender: gender,
        firstName: firstName,
        lastName: lastName
    };

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const responseData = await response.json();
            if (responseData.success) {
                console.log("Success Register");
                showDiv("login");
                window.location.reload();
                document.getElementById('notifMessageLogin').innerText = responseData.notif;
            } else {
                document.getElementById('errorMessageRegister').innerText = responseData.message;
            }
        } else {
            throw new Error('Erreur lors de la requête.');
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}

function showDiv(divName) {
    // Masquer toutes les divs
    var divs = document.querySelectorAll('.logout, .loginForm, .accueil, .registrationForm, .home');
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


// Fonction pour récupérer la valeur d'un cookie
function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    if (match) {
        return match[2];
    }
    return null;
}

function setCookie(name, value, days, sameSite) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }

    var sameSiteOption = "";
    if (sameSite) {
        sameSiteOption = "; SameSite=" + sameSite;
    }
    document.cookie = name + "=" + value + expires + "; path=/" + sameSiteOption;
}


function startWebSocket() {
    // Code JavaScript pour se connecter au serveur websocket et afficher la liste des utilisateurs connectés
    const socket = new WebSocket("ws://localhost:8080/ws");
    // Ajouter des gestionnaires d'événements pour la connexion WebSocket
    socket.onopen = function (event) {
        console.log('Connexion WebSocket établie');
    };

    socket.onmessage = function (event) {
        var data = JSON.parse(evt.data);
        console.log(data);
        console.log('Message WebSocket reçu:', data);
    };

    socket.onclose = function (event) {
        console.log('Connexion WebSocket fermée');
    };
}
