export async function register() {
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