package facebook

import (
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/facebook"
)

type FacebookUser struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

var (
	oauthConf = &oauth2.Config{
		ClientID:     "712932427470282",
		ClientSecret: "6274420be1b190fa2d48af4214b48eee",
		RedirectURL:  "http://localhost:3000/oauth2callback",
		Scopes:       []string{"public_profile"},
		Endpoint:     facebook.Endpoint,
	}
	oauthStateString = "thisshouldberandom"
)
