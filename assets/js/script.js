import { logout } from "./application/action";
import  { getCookie } from "./application/cookie";
import { startWebSocket } from "./application/websocket";
import { showDiv} from "./application/show";

window.onload = function () {
    const username = getCookie("username");

    if (username) {
        showDiv("home")
        startWebSocket();
    }
};


