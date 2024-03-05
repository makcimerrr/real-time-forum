export function getCurrentTime() {
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours = hours < 10 ? '0' + hours : hours;

    minutes = minutes < 10 ? '0' + minutes : minutes;

    return hours + ':' + minutes;
}