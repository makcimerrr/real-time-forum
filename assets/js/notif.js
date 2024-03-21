export function showNotification(message, type) {
    const notification = document.getElementById("Notification");
    if (type === "success") {
        notification.style.backgroundColor = "#4caf50";
        notification.innerText = message;
        notification.style.display = "block";
        playNotificationSound();
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    } else if (type === "send") {
        notification.style.backgroundColor = "#045bcc";
        notification.innerText = message;
        notification.style.display = "block";
        playSendSound();
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    } else if (type === "error") {
        notification.style.backgroundColor = "#f44336";
        notification.innerText = message;
        notification.style.display = "block";
        playErrorSound();
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    } else if (type === "notif") {
        notification.style.backgroundColor = "#3b3838";
        notification.innerText = message;
        notification.style.display = "block";
        playNotificationSound();
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    }
};


function playNotificationSound() {
    const audio = new Audio("static/sounds/notification.mp3");
    audio.play().then(r => {}).catch(e => {});
}

function playSendSound() {
    const audio = new Audio("static/sounds/sends.mp3");
    audio.volume = 0.2;
    audio.play().then(r => {}).catch(e => {});
}

function playErrorSound() {
    const audio = new Audio("static/sounds/error.mp3");
    audio.volume = 0.2;
    audio.play().then(r => {}).catch(e => {});
}