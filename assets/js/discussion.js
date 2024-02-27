export function updateFormWithVariable(idVariable) {
    const form = document.getElementById('');

    // Attribution de l'ID variable au bouton submit
    const submitButton = form.querySelector('.buttonComment');
    submitButton.id = idVariable;
}