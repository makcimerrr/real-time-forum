export function displayUserList(NumberofConnected, List) {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    const Number = document.createElement("p");
    Number.textContent = "Users Connected :" + NumberofConnected;
    userList.appendChild(Number);

    // Boucle pour afficher chaque utilisateur dans la liste
    const ul = document.createElement("ul");
    List.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        ul.appendChild(li);
    });
    userList.appendChild(ul);
}