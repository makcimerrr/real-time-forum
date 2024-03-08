export function getCurrentTime() {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    const year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
}

export function extractTimeFromDate(dateString) {
    const dateTimeParts = dateString.split(' ');
    const time = dateTimeParts[1]; // Sélectionner la deuxième partie (l'heure)
    return time;
}
