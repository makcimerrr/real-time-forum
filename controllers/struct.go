package controllers

type Post struct {
	Type      string `json:"type"`
	Username  string `json:"username"`
	TitlePost string `json:"titlePost"`
	Category  string `json:"category"`
	Message   string `json:"message"`
}

type CommentData struct {
	Username string `json:"username"`
	Title    string `json:"title"`
	Message  string `json:"message"`
}

type Discussion struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Title    string `json:"title"`
	Message  string `json:"message"`
	Category string `json:"category"`
}

type User struct {
	Username string `json:"username"`
}

type UserList struct {
	Username  string   `json:"username"`
	Connected int      `json:"connected"`
	List      []string `json:"list"`
}

type DiscussionData struct {
	Id int `json:"id"`
}
