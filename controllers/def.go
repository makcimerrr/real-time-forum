package controllers

import (
	"database/sql"

	"text/template"
)

var (
	Templates = template.Must(template.ParseGlob("templates/*.html"))
	Db        *sql.DB
)
