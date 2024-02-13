export function startWebSocket() {
    // Code JavaScript pour se connecter au serveur websocket et afficher la liste des utilisateurs connectés
    const socket = new WebSocket("ws://localhost:8080/ws");
    // Ajouter des gestionnaires d'événements pour la connexion WebSocket
    socket.onopen = function (event) {
        console.log('Connexion WebSocket établie');
    };

    socket.onmessage = function (event) {
        var data = JSON.parse(evt.data);
        console.log(data);
        console.log('Message WebSocket reçu:', data);
    };

    socket.onclose = function (event) {
        console.log('Connexion WebSocket fermée');
    };
}
