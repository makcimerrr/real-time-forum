function showDiv(divName) {
    // Masquer toutes les divs
    var divs = document.querySelectorAll('.accueil, .registrationForm, .home');
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
                    console.log("Success Login")
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
    