export function displayNotification(message) {
    // Vérifier si les notifications sont prises en charge par le navigateur
    if (!("Notification" in window)) {
        console.log("Ce navigateur ne prend pas en charge les notifications.");
        return;
    }

    // Vérifier si l'utilisateur a déjà autorisé les notifications
    if (Notification.permission === "granted") {
        // Si les notifications sont autorisées, afficher une notification
        showNotification(message);
    } else if (Notification.permission !== "denied") {
        // Demander à l'utilisateur l'autorisation d'afficher les notifications
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                // Si l'utilisateur autorise les notifications, afficher une notification
                showNotification(message);
            }
        });
    }
}

function showNotification(message) {
    const notification = new Notification("Ehhh YOU !", {
        body: message,
    });

    notification.onclick = function () {
        window.location.href = "/";
    };
}