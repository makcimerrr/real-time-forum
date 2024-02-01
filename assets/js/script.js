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
