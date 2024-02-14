package controllers

type Post struct {
	Username  string `json:"username"`
	TitlePost string `json:"titlePost"`
	Category  string `json:"category"`
	Mesage    string `json:"message"`
}

type Discussion struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Title    string `json:"title"`
	Message  string `json:"message"`
	Category string `json:"category"`
}
