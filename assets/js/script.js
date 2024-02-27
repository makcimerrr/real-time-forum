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

document.getElementById("Logout").addEventListener("click", function (event) {
  // Empêcher le comportement de soumission par défaut
  event.preventDefault();
  fetch("http://localhost:8080/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify("logout"),
  });

  logout();
});

// Fonction de déconnexion
function logout() {
  // Supprimer les cookies "username" et "session"
  var Cookies = document.cookie.split(";");

  for (var i = 0; i < Cookies.length; i++) {
    document.cookie = Cookies[i] + "=; expires=" + new Date(0).toUTCString();
  }

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
        connection(user.username, data.token);
        console.log(data.token);
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
        connection(user.loginuser, data.token);
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

function showDiv(divName) {
  // Masquer toutes les divs
  var divs = document.querySelectorAll(
    ".accueil, .loginForm, .registrationForm, .home, .creatediscussion, .logout , .watchthepost"
  );
  divs.forEach(function (div) {
    div.style.display = "none";
  });

  // Afficher la div spécifiée
  var selectedDiv = document.querySelector("." + divName);
  var logoutdiv = document.querySelector(".logout");

  if (selectedDiv) {
    selectedDiv.style.display = "block";

    if (divName === "home") {
      logoutdiv.style.display = "block";
    }
  }
}

function submitDiscussionForm() {
  var discussionForm = document.getElementById("creatediscussion");

  // Récupérer les valeurs des champs du formulaire
  var title = discussionForm.elements["title"].value;
  var text = discussionForm.elements["message"].value;
  var category = discussionForm.elements["category"].value;

  var discussionData = {
    type: "createDiscussion",
    title: title,
    text: text,
    category: category,
  };

  // C'est une notification, afficher la notification de succès
  console.log("Discussion Created:");
  return discussionData;
}

function connection(name, token) {
  setCookie(name, token);
  var socket = new WebSocket("ws://localhost:8080/socket"); //make sure the port matches with your golang code

  socket.addEventListener("open", (event) => {
    console.log("WebSocket connection opened:", event);

    var discussionData = {
      type: "showpost",
    };
    socket.send(JSON.stringify(discussionData));

    var userconnected = {
      type: "userconnected",
    };
    socket.send(JSON.stringify(userconnected));
  });

  document.addEventListener("submit", function (event) {
    // Empêcher le comportement de soumission par défaut
    event.preventDefault();
    // Appeler la fonction registerUser de votre script JavaScript
    INFO = submitDiscussionForm();
    // console.log(INFO)
    socket.send(JSON.stringify(INFO));
    showDiv("home");
  });

  socket.addEventListener("message", function (event) {
    var responseData = JSON.parse(event.data);
    console.log(responseData.type);
    switch (responseData.type) {
      case "showpost":
        // Action pour le type "showpost"
        displayPost(responseData.data);
        break;
      case "createDiscussionResponse":
        // Action pour le type "createDiscussionResponse"
        displayPost(responseData.data);
        break;
      // Ajoutez d'autres cas au besoin

      case "userconnected":
        console.log("superrrrrrrr testttttttttt");
        console.log(responseData.data);

      default:
        console.warn("Type de message non géré:", responseData.type);
    }
  });

  socket.addEventListener("close", (event) => {
    console.log("WebSocket connection closed:", event);
  });
}

function displayPost(messageData) {
  var discussionListDiv = document.getElementById("post");

  // Créer une nouvelle div parente
  var parentDiv = document.createElement("div");
  parentDiv.classList.add("parent-container");

  messageData.forEach(function (Post) {
    var discussions = document.createElement("div");
    discussions.classList.add("post");
    discussions.id = `${Post.id}`;
    discussions.style.border = "1px solid #ccc"; // Exemple de style
    discussions.style.width = "25%"; // Exemple de style

    var title = document.createElement("h1");
    title.classList.add("title");
    title.textContent = `Title: ${Post.title}`;
    title.style.fontSize = "20px"; // Exemple de style
    discussions.appendChild(title);

    var username = document.createElement("h2");
    username.classList.add("username");
    username.textContent = `Username: ${Post.username}`;
    discussions.appendChild(username);

    var message = document.createElement("h2");
    message.classList.add("message");
    message.textContent = `Message: ${Post.message}`;
    discussions.appendChild(message);

    var category = document.createElement("h2");
    category.classList.add("category");
    category.textContent = `Category: ${Post.category}`;
    discussions.appendChild(category);

    // Ajouter la div de discussion à la div parente
    parentDiv.appendChild(discussions);

    // Ajouter un event listener à chaque élément "post"
    discussions.addEventListener("click", function () {
      // Utiliser l'ID spécifique de l'élément cliqué
      var postId = discussions.id;
      // Appeler une fonction ou effectuer une action avec l'ID
      handlePostClick(postId, messageData);
    });
  });

  // Ajouter la div parente à la div principale
  discussionListDiv.appendChild(parentDiv);
}

function handlePostClick(postId, messageData) {
  console.log("Post clicked with ID:", postId);

  // Récupérer le post spécifique en fonction de l'ID
  var clickedPost = messageData.find((post) => post.id === parseInt(postId));

  // Vérifier si l'élément watchpost existe dans le DOM
  var watchpostDiv = document.querySelector(".watchthepost");
  if (watchpostDiv) {
    // Afficher le post dans la classe "watchpost"
    watchpostDiv.innerHTML = `
      <h1>Title: ${clickedPost.title}</h1>
      <h2>Username: ${clickedPost.username}</h2>
      <h2>Message: ${clickedPost.message}</h2>
      <h2>Category: ${clickedPost.category}</h2>
      <!-- Ajoutez d'autres éléments nécessaires -->
    `;

    // Faites la transition vers la classe "watchpost"
    showDiv("watchthepost");
  } else {
    console.error("Element with ID 'watchpost' not found in the DOM.");
  }
}

function setCookie(name, token) {
  document.cookie = `${name}=${token}`;
}
