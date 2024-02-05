// Fonction pour obtenir la valeur d'un cookie en fonction de son nom
function getCookie(name) {
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookieArray = decodedCookie.split(";");
  for (var i = 0; i < cookieArray.length; i++) {
    var cookie = cookieArray[i].trim();
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
} // Vérifier les cookies au chargement de la page


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


// Fonction pour supprimer un cookie en fonction de son nom
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Fonction de déconnexion
function logout() {
  var username = getCookie("username");

  isError = 0;

  var user = {
    type: "logout",
    username: username,
  };

  // Établir une connexion WebSocket
  var socket = new WebSocket("ws://" + window.location.host + "/ws");

  // Envoyer les données utilisateur via WebSocket
  socket.onopen = function () {
    socket.send(JSON.stringify(user));
  };

  socket.onmessage = function (event) {}

  // Supprimer les cookies "username" et "session"
  deleteCookie("username");
  deleteCookie("session");

  // Si l'enregistrement est réussi, masquer la div "registrationForm" et afficher la div "home"
  if (isError === 0) {
    hideHeader();
    showDiv("accueil");
  }
    
}


// Écouter l'événement de soumission du formulaire
document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    // Empêcher le comportement de soumission par défaut
    event.preventDefault();

    // Appeler la fonction registerUser de votre script JavaScript
    registerUser();
  });

// Écouter l'événement de soumission du formulaire
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    // Empêcher le comportement de soumission par défaut
    event.preventDefault();

    // Appeler la fonction registerUser de votre script JavaScript
    loginUser();
  });

function registerUser() {
  // Récupérer le formulaire par son ID
  var registrationForm = document.getElementById("registrationForm");

  // Récupérer les valeurs des champs du formulaire
  var username = registrationForm.elements["username"].value;
  var email = registrationForm.elements["email"].value;
  var password = registrationForm.elements["password"].value;
  var age = registrationForm.elements["age"].value;
  var gender = registrationForm.elements["gender"].value;
  var firstName = registrationForm.elements["firstName"].value;
  var lastName = registrationForm.elements["lastName"].value;

  // Effacer le contenu de la zone de texte d'erreur
  document.getElementById("errorText").innerText = "";

  // Variable pour suivre si une erreur a été rencontrée
  var isError = 0;

  var user = {
    type: "register",
    username: username,
    age: age,
    gender: gender,
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
  };

  // Établir une connexion WebSocket
  var socket = new WebSocket("ws://" + window.location.host + "/ws");

  // Envoyer les données utilisateur via WebSocket
  socket.onopen = function () {
    socket.send(JSON.stringify(user));
  };

  // Recevoir la confirmation d'inscription ou l'erreur via WebSocket
  socket.onmessage = function (event) {
    var data = JSON.parse(event.data);
    var type = data.type;
    var message = data.message;

    var errorText = document.getElementById("errorText");
    var errorMessage = document.getElementById("errorMessage");

    if (type === "error") {
      errorMessage.innerText = message;
      errorText.style.display = "block"; // Afficher la zone de texte d'erreur
      // Masquer l'erreur automatiquement après 15 secondes
      isError = 1;
      setTimeout(function () {
        errorMessage.innerText = "";
        errorText.style.display = "none"; // Masquer la zone de texte d'erreur
      }, 15000);
    } else if (type === "join") {
      // C'est une notification, afficher la notification de succès
      showNotification("Oh mais qui voilà !", message);
    }
    socket.close();

    // Si l'enregistrement est réussi, masquer la div "registrationForm" et afficher la div "home"
    if (isError === 0) {
      showDiv("loginForm");
    }
  };
}

function loginUser() {
  // Récupérer le formulaire par son ID
  var loginForm = document.getElementById("loginForm");

  var loginuser = loginForm.elements["loginuser"].value;
  var loginpassword = loginForm.elements["loginpassword"].value;

  // Effacer le contenu de la zone de texte d'erreur
  document.getElementById("errorText").innerText = "";

  // Variable pour suivre si une erreur a été rencontrée
  var isError = 0;

  var user = {
    type: "login",
    loginuser: loginuser,
    loginpassword: loginpassword,
  };

  // Établir une connexion WebSocket
  var socket = new WebSocket("ws://" + window.location.host + "/ws");

  // Envoyer les données utilisateur via WebSocket
  socket.onopen = function () {
    socket.send(JSON.stringify(user));
  };

  // Recevoir la confirmation de login ou l'erreur via WebSocket
  socket.onmessage = function (event) {
    var data = JSON.parse(event.data);
    var type = data.type;
    var message = data.message;
    var tokenCookie = data.tokenCookie;
    var usernameCookie = data.usernameCookie;

    var errorTextLogin = document.getElementById("errorTextLogin");
    var errorMessageLogin = document.getElementById("errorMessageLogin");



    if (type === "error") {
      errorMessageLogin.innerText = message;
      errorTextLogin.style.display = "block"; // Afficher la zone de texte d'erreur
      // Masquer l'erreur automatiquement après 15 secondes
      isError = 1;
      setTimeout(function () {
        errorMessage.innerText = "";
        errorText.style.display = "none"; // Masquer la zone de texte d'erreur
      }, 15000);
    } else if (type === "login") {
      // Créer un cookie côté client avec le jeton
      document.cookie = "username=" + usernameCookie + "; path=/";
      document.cookie = "session=" + tokenCookie + "; path=/";

      // C'est une notification, afficher la notification de succès
      showNotification("Enfin te voilà !", message);
    }
    socket.close();

    // Si l'enregistrement est réussi, masquer la div "registrationForm" et afficher la div "home"
    if (isError === 0) {
      window.location.reload();
      showDiv("home");
    }
  };
}

function showNotification(title, message) {
  // Vérifier si le navigateur prend en charge les notifications
  if ("Notification" in window) {
    // Vérifier si les notifications sont autorisées, sinon demander la permission
    if (Notification.permission === "granted") {
      // Afficher la notification
      new Notification(title, { body: message });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // Si la permission est accordée, afficher la notification
        if (permission === "granted") {
          new Notification(title, { body: message });
        }
      });
    }
  }
}

function generateUniqueToken() {
  var crypto = window.crypto || window.msCrypto; // Utilise window.crypto pour les navigateurs modernes et window.msCrypto pour les anciens IE
  if (!crypto) {
    console.error(
      "La génération de token n'est pas prise en charge dans ce navigateur."
    );
    return null;
  }

  var token = new Uint8Array(32);
  crypto.getRandomValues(token);

  var base64Token = btoa(String.fromCharCode.apply(null, token));
  base64Token = base64Token
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // Encodage URL-safe

  return base64Token;
}

function showDiv(divName) {
  // Masquer toutes les divs
  var divs = document.querySelectorAll(
    ".accueil, .loginForm, .registrationForm, .home"
  );
  divs.forEach(function (div) {
    div.style.display = "none";
  });

  // Afficher la div spécifiée
  var selectedDiv = document.querySelector("." + divName);
  if (selectedDiv) {
    selectedDiv.style.display = "block";
  }
}


function updateOnlineUserList(userListJSON) {
  var userList = JSON.parse(userListJSON);
  var userListElement = document.getElementById("userList");

  // Effacez la liste actuelle
  userListElement.innerHTML = "";

  // Ajoutez chaque utilisateur à la liste
  userList.forEach(function (user) {
      var listItem = document.createElement("li");
      listItem.textContent = user;
      userListElement.appendChild(listItem);
  });
}

function hideHeader() {
  var header = document.querySelector('header');
  header.style.display = 'none';
}