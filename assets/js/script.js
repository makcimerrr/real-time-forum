function showDiv(divName) {
    // Masquer toutes les divs
    var divs = document.querySelectorAll('.loginForm, .accueil, .registrationForm, .home');
    divs.forEach(function (div) {
        div.style.display = 'none';
    });

    // Afficher la div spécifiée
    var selectedDiv = document.querySelector('.' + divName);
    if (selectedDiv) {
        selectedDiv.style.display = 'block';
    }
}

document
    .getElementById("loginForm")
    .addEventListener("submit", function (event) {
        // Empêcher le comportement de soumission par défaut
        event.preventDefault();

        // Appeler la fonction login de votre script JavaScript
        login();
    });

document
    .getElementById("registrationForm")
    .addEventListener("submit", function (event) {
        // Empêcher le comportement de soumission par défaut
        event.preventDefault();

        // Appeler la fonction login de votre script JavaScript
        register();
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
                setCookie("username", responseData.username, 30); // 30 jours de durée de vie du cookie
                setCookie("token", responseData.token, 30);
                showDiv("home");
                window.location.reload();
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

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  }
  
  window.onload = function () {
    var username = getCookie("username");
    if (username) {
      // Les cookies existent, afficher la div "home" avec le titre de l'username
      showDiv("home");
      title = document.getElementById("title");
      heading = document.createElement("h3");
      heading.innerHTML = "Accueil - " + username;
      title.appendChild(heading);
    }
  };
  
// Fonction pour récupérer la valeur d'un cookie
function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    if (match) {
      return match[2];
    }
    return null;
  }