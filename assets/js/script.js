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
    document.querySelector(".title").innerHTML =
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
  // Supprimer les cookies "username" et "session"
  deleteCookie("username");
  deleteCookie("session");

  // Rediriger l'utilisateur vers la page d'accueil ou effectuer d'autres actions nécessaires
  window.location.href = "/";
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
    ".accueil, .loginForm, .registrationForm, .home, .creatediscussion"
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

function HideDiv(divName) {
  // Masquer toutes les divs
  var divs = document.querySelectorAll(".creatediscussion");
  divs.forEach(function (div) {
    div.style.display = "block";
  });

  // Afficher la div spécifiée
  var selectedDiv = document.querySelector("." + divName);
  if (selectedDiv) {
    selectedDiv.style.display = "none";
  }
}

// Écouter l'événement de soumission du formulaire
document
  .getElementById("creatediscussion")
  .addEventListener("submit", function (event) {
    // Empêcher le comportement de soumission par défaut
    event.preventDefault();

    // Appeler la fonction registerUser de votre script JavaScript
    submitDiscussionForm();
  });

  function submitDiscussionForm() {
    // Récupérer le formulaire par son ID
    var discussionForm = document.getElementById("creatediscussion");
  
    // Récupérer les valeurs des champs du formulaire
    var title = discussionForm.elements["title"].value;
    var text = discussionForm.elements["message"].value;
    var category = discussionForm.elements["category"].value;
  
    console.log(title);
    console.log(text);
    console.log(category);
  
    // Variable pour suivre si une erreur a été rencontrée
    var isError = 0;
  
    var discussionData = {
      type: "createDiscussion",
      title: title,
      text: text,
      category: category,
    };
  
    // Établir une connexion WebSocket
    var socket = new WebSocket("ws://" + window.location.host + "/ws");
  
    // Envoyer les données de discussion via WebSocket
    socket.onopen = function () {
      socket.send(JSON.stringify(discussionData));
    };
  
    // Gérer les réponses du serveur
    socket.onmessage = function (event) {
      var data = JSON.parse(event.data);
      var type = data.type;
      var message = data.message;
  
      if (type === "error") {
        // Gérer les erreurs si nécessaire
        console.error("Error:", message);
        isError = 1;
      } else if (type === "createDiscussion") {
        // C'est une notification, afficher la notification de succès
        console.log("Discussion Created:", message);
        showNotification("Discussion Created!", message);
      }
  
      // Fermer la connexion WebSocket
      socket.close();
  
      // Si la création de la discussion est réussie, masquer la div "creatediscussion" et afficher la div "home"
      if (isError === 0) {
        window.location.reload();
        showDiv("home");
      }
    };
  }
  
