package controllers

func updateList(username string, add bool) {

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

	userListData.Connected = len(List)
	userListData.Username = username
	userListData.List = List

	usersListDataMessage := WebsocketMessage{Type: "login", Data: userListData}
	broadcast <- usersListDataMessage
}
