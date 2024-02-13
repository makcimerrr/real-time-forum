// Fonction pour récupérer la valeur d'un cookie
export function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    if (match) {
        return match[2];
    }
    return null;
}


export function deleteCookie(name, sameSite) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/" + (sameSite ? "; SameSite=" + sameSite : "");
}

export function setCookie(name, value, days, sameSite) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }

    var sameSiteOption = "";
    if (sameSite) {
        sameSiteOption = "; SameSite=" + sameSite;
    }
    document.cookie = name + "=" + value + expires + "; path=/" + sameSiteOption;
}