window.onload = function () {
  var username = getCookie("username");
  if (username) {
    // Les cookies existent, afficher la div "home" avec le titre de l'username
    showDiv("home");
    document.querySelector(".home").innerHTML =
      "<h1>Accueil - " + username + "</h1>";

    // Afficher le bouton de déconnexion dans le header
    document.querySelector("header").innerHTML =
      '<button onclick="logout()">Déconnexion</button>';
  }
};

var socket; // Déclarer la variable socket en dehors de la fonction connectWebSocket

// Fonction pour établir une connexion WebSocket
function connectWebSocket() {
    // Établir la connexion WebSocket seulement si elle n'est pas déjà ouverte
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        socket = new WebSocket("ws://" + window.location.host + "/ws");

        socket.onopen = function () {
            console.log("WebSocket connection established");
        };

        socket.onmessage = function (event) {
            var data = JSON.parse(event.data);
            var type = data.type;
            var message = data.message;
            var userList = data.userList;

            // Gérer les différentes réponses du serveur WebSocket
            if (type === "error") {
                // Afficher l'erreur dans la zone de texte d'erreur
                var errorMessageLogin = document.getElementById("errorMessageLogin");
                errorMessageLogin.innerText = message;
                errorMessageLogin.style.display = "block"; // Afficher la zone de texte d'erreur
            } else if (type === "login") {
                // Traitement réussi du login, mettre en œuvre les actions nécessaires
                console.log("Login successful");
                console.log(userList); // Mettre à jour la liste des utilisateurs par exemple
            }
        };

        socket.onclose = function (event) {
            console.log("WebSocket connection closed:", event);
        };
    }
}



// Fonction pour gérer la connexion de l'utilisateur// Fonction pour gérer la connexion de l'utilisateur
function loginUser() {
  // Récupérer le formulaire par son ID
  var loginForm = document.getElementById("loginForm");
  var loginuser = loginForm.elements["loginuser"].value;
  var loginpassword = loginForm.elements["loginpassword"].value;

  // Effacer le contenu de la zone de texte d'erreur
  document.getElementById("errorTextLogin").innerText = "";

  // Variable pour suivre si une erreur a été rencontrée
  var isError = 0;

  var user = {
    type: "login",
    loginuser: loginuser,
    loginpassword: loginpassword,
  };

  // Appeler la fonction pour établir une connexion WebSocket
  connectWebSocket();

  // Envoyer les données utilisateur via WebSocket
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(user));
  } else {
    console.log("WebSocket connection not open");
  }
}
