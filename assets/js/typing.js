export async function sendTypingMessage(user, usernameVerify) {
    const typingData = {
        sender: usernameVerify,
        receiver: user,
        isTyping: true
    };

    try {
        const response = await fetch('/sendTypingMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(typingData)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'envoi du message de saisie.');
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}
export async function stopTypingMessage(user, usernameVerify) {
    const typingData = {
        sender: usernameVerify,
        receiver: user,
        isTyping: false
    };

    try {
        const response = await fetch('/sendTypingMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(typingData)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'arrêt de l\'envoi du message de saisie.');
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}

let typingIndicatorTimeout; // Variable pour stocker l'identifiant du minuteur


export function toggleTypingAnimation(isTyping) {
    const typingAnimation = document.getElementById('typing-indicator');
    typingAnimation.className = 'typing-animation';
    typingAnimation.innerHTML = 'Is Typing<span class="dot1">.</span><span class="dot2">.</span><span class="dot3">.</span>';

    const header = document.querySelector('.chat-header');

    if (isTyping) {
        typingAnimation.style.display = 'block';
        header.appendChild(typingAnimation);
        if (typingIndicatorTimeout) {
            clearTimeout(typingIndicatorTimeout);
        }

        typingIndicatorTimeout = setTimeout(() => {
            typingAnimation.style.display = 'none';
        }, 5000);
    } else {
        typingAnimation.style.display = 'none';

        if (typingIndicatorTimeout) {
            clearTimeout(typingIndicatorTimeout);
        }
    }
}