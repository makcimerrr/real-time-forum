export async function displayDiscussion(id) {
    const discussion = document.querySelector('showDiscussion');

    const idDiscussion = id

    const DiscussionData = {
        id: idDiscussion
    };

    try {
        const response = await fetch('/discussion', {
            method: 'POST', headers: {
                'Content-Type': 'application/json'
            }, body: JSON.stringify(DiscussionData)
        });

        if (response.ok) {
            const responseData = await response.json();
            if (responseData.success) {
                console.log("Discussion affichee")
            } else {
                console.log("Erreur")
            }
        } else {
            throw Error('Erreur lors de la requête.');
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
}