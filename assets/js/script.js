function WebSocketManager(user) {}

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
}

// Vérifier les cookies au chargement de la page
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

  errorText.innerText = "";

  // Effectuer une requête POST vers votre API Go
  fetch("http://localhost:8080/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Loguer la réponse pour le débogage
      console.log("Server response:", data);

      // Traiter la réponse JSON côté client
      if (data.type === "error") {
        // Loguer l'entrée dans la branche "error"
        console.log("Entered error branch");

        // Afficher les messages d'erreur
        document.getElementById("errorText").innerText =
          "Erreur : " + data.message + " " + data.errors.join(", ");
      } else if (data.type === "success") {
        // Traiter le succès (peut-être rediriger l'utilisateur, afficher un message, etc.)
        console.log("Inscription réussie !");
        showDiv("home");
        showNotification("Success", "Connected");
      } else {
        // Loguer l'entrée dans la branche inattendue
        console.error("Réponse inattendue du serveur:", data);
      }
    });
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

  errorText.innerText = "";

  // Effectuer une requête POST vers votre API Go
  fetch("http://localhost:8080/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Loguer la réponse pour le débogage
      console.log("Server response:", data);

      // Traiter la réponse JSON côté client
      if (data.type === "error") {
        // Loguer l'entrée dans la branche "error"
        console.log("Entered error branch");

        // Afficher les messages d'erreur
        document.getElementById("errorTextLogin").innerText =
          "Erreur : " + data.message + " " + data.errors.join(", ");
      } else if (data.type === "success") {
        // Traiter le succès (peut-être rediriger l'utilisateur, afficher un message, etc.)
        console.log("conn réussie !");

        showDiv("home");

        showNotification("Success", "Connected");
        //WebSocketManager()
      } else {
        // Loguer l'entrée dans la branche inattendue
        console.error("Réponse inattendue du serveur:", data);
      }
    });
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
  console.log("2");

  // C'est une notification, afficher la notification de succès
  console.log("Discussion Created:");

  showDiv("home");
}

// // Créez une instance de WebSocket au chargement de la page
// var socket = new WebSocket("ws://" + window.location.host + "/ws");

// // Écoutez les événements de message de la WebSocket
// socket.onopen = function () {
//   console.log("WebSocket connection opened.");
// };

// socket.onmessage = function (event) {
//   var data = JSON.parse(event.data);
//   console.log("Received message:", data);

//   var type = data.type;

//   if (type === "discussionList") {
//     // Les données reçues sont une liste de discussions
//     var discussions = data.data;

//     // Faites quelque chose avec la liste de discussions, par exemple, les afficher
//     console.log("Discussions received:", discussions);
//     displayDiscussions(discussions);
//   }
// };

// socket.onclose = function (event) {
//   console.log("WebSocket connection closed:", event);
// };

// socket.onerror = function (error) {
//   console.error("WebSocket encountered an error:", error);
// };

// Fonction pour afficher les discussions dans l'interface utilisateur
// function displayDiscussions(discussions) {
//   console.log("testttttttt");
//   // Récupérer l'élément où vous souhaitez afficher les discussions
//   var discussionContainer = document.getElementById("discussionContainer");

//   // Effacer le contenu précédent du conteneur de discussion
//   discussionContainer.innerHTML = "";

//   // Parcourir toutes les discussions et les afficher
//   discussions.forEach(function (discussion) {
//     // Créer un élément de discussion
//     var discussionElement = document.createElement("div");
//     discussionElement.classList.add("discussion");

//     // Construire le contenu de la discussion
//     var discussionHTML = "<h3>" + discussion.title + "</h3>";
//     discussionHTML += "<p>" + discussion.text + "</p>";
//     discussionHTML +=
//       "<p><strong>Category:</strong> " + discussion.category + "</p>";

//     // Mettre le contenu dans l'élément de discussion
//     discussionElement.innerHTML = discussionHTML;

//     // Ajouter l'élément de discussion au conteneur de discussion
//     discussionContainer.appendChild(discussionElement);
//   });

//   // Afficher les données des discussions dans la console pour le test
//   console.log("Discussions:", discussions);
// }
