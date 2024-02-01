// Vérifier les cookies au chargement de la page
window.onload = function () {
  var username = getCookie("username");
  if (username) {
    // Les cookies existent, afficher la div "home" avec le titre de l'username
    showDiv("home");
    document.querySelector(".home").innerHTML =
      "<h1>Accueil - " + username + "</h1>";
  }
};

function registerUser() {
  // Effacer le contenu de la zone de texte d'erreur
  document.getElementById("errorText").innerText = "";

  var username = document.getElementById("username").value;
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  var age = document.getElementById("age").value;
  var gender = document.getElementById("gender").value;
  var firstName = document.getElementById("firstName").value;
  var lastName = document.getElementById("lastName").value;

  var user = {
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

    if (type === "error") {
      // C'est un message d'erreur, afficher dans une zone de texte sur la page HTML
      document.getElementById("errorText").innerText = message;
      // Masquer l'erreur automatiquement après 15 secondes
      setTimeout(function () {
        errorText.innerText = "";
      }, 15000);
    } else if (type === "join") {
      // C'est une notification, afficher la notification de succès
      showNotification("Oh mais qui voilà !", message);
    }
    socket.close();
  };

  // Si l'enregistrement est réussi, créer les cookies
  var username = user.username; // Utilisez la valeur de l'username à partir de votre objet User
  var token = generateUniqueToken(); // Appeler une fonction pour générer un token unique

  // Définir les cookies
  setCookie("username", username, 30); // 30 jours de durée de vie du cookie
  setCookie("token", token, 30);

  // Si l'enregistrement est réussi, masquer la div "registrationForm" et afficher la div "home"
  showDiv("home");
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

// Fonction pour définir un cookie avec une durée de vie spécifique
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function showDiv(divName) {
  // Masquer toutes les divs
  var divs = document.querySelectorAll(".accueil, .registrationForm, .home");
  divs.forEach(function (div) {
    div.style.display = "none";
  });

  // Afficher la div spécifiée
  var selectedDiv = document.querySelector("." + divName);
  if (selectedDiv) {
    selectedDiv.style.display = "block";
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
