export function showNotification (message, type) {
    if (type === "success") {
        const notification = document.getElementById("SuccessNotification");
        notification.innerText = message;
        notification.style.display = "block";
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    } else if (type == "error") {
        const notification = document.getElementById("ErrorNotification");
        notification.innerText = message;
        notification.style.display = "block";
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    } else if (type == "notif") {
        const notification = document.getElementById("Notification");
        notification.innerText = message;
        notification.style.display = "block";
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    }
};