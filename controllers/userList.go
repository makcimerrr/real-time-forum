package controllers

import (
	"log"
)

func updateList(username string, add bool) {
	rows, _ := Db.Query("SELECT username FROM users")

	var AllUser []string

	for rows.Next() {
		var username string
		err := rows.Scan(&username)
		if err != nil {
			log.Fatal(err)
		}
		AllUser = append(AllUser, username)
	}
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}
	var userListData UserList

	if add {
		List = append(List, username)
	} else {
		for i, user := range List {
			if user == username {
				List = append(List[:i], List[i+1:]...)
				break
			}
		}
	}

	userListData.NumberConnected = len(List)
	userListData.Username = username
	userListData.List = List
	userListData.AllUsers = AllUser

	usersListDataMessage := WebsocketMessage{Type: "login", Data: userListData}
	broadcast <- usersListDataMessage
}
