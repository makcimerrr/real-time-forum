const socket = new WebSocket("ws://" + window.location.host + "/ws");

function updateUserList(users) {
  const userList = document.getElementById("userList");

  // Crée un nouvel élément ul s'il n'existe pas
  if (!userList) {
    return;
  }

  // Crée un ensemble pour suivre les utilisateurs existants
  const existingUsers = new Set();

  // Parcourt la liste des utilisateurs
  users.forEach(function (user) {
    // Vérifie si l'utilisateur n'est pas un espace (vide)
    if (user.trim() !== "") {
      // Utilise le nom d'utilisateur comme identifiant unique
      const userId = "user-" + user;

      // Vérifie si l'élément existe déjà
      let listItem = document.getElementById(userId);

      // Si l'élément n'existe pas, crée-le
      if (!listItem) {
        listItem = document.createElement("li");
        listItem.id = userId; // Attribue un identifiant unique basé sur le nom d'utilisateur
        userList.appendChild(listItem);
      }

      // Met à jour le contenu de l'élément
      listItem.textContent = user;

      // Ajoute l'utilisateur à l'ensemble des utilisateurs existants
      existingUsers.add(userId);
    }
  });

  // Supprime les éléments qui ne sont plus présents dans la liste
  Array.from(userList.children).forEach(function (listItem) {
    if (!existingUsers.has(listItem.id)) {
      listItem.remove();
    }
  });

  // Affiche un message si la liste est vide
  if (users.length === 0 || users.every((user) => user.trim() === "")) {
    userList.innerHTML = "<p>No users are connected.</p>";
  }

  // Affiche également la liste dans la console du navigateur
  //console.log("Liste des utilisateurs connectés :", users);
}

socket.onmessage = function (event) {
  fetch("/get_users") // Appel de la nouvelle route pour obtenir la liste des utilisateurs
    .then((response) => response.json())
    .then((data) => {
      updateUserList(data);
    })
    .catch((error) =>
      console.error(
        "Erreur lors de la récupération de la liste des utilisateurs :",
        error
      )
    );
};

socket.onclose = function (event) {
  console.error("WebSocket closed:", event);
};

// Gestionnaire d'événements pour l'événement beforeunload
window.addEventListener("beforeunload", function (event) {
  // Envoyer une notification de déconnexion au serveur avec le nom d'utilisateur
  const username = currentUsername; // Utilisez la variable qui contient le nom d'utilisateur
  socket.send(JSON.stringify({ event: "user_leaving", username: username }));
});
