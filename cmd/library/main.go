package main

import (
	"crypto/subtle"
	"html/template"
	"io"

	articleService "github.com/zrecovery/library/pkg/article/service"

	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
)

type Template struct {
	templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
	e := echo.New()

	connStr := "postgres://postgres:postgres@localhost/library?sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}

	t := &Template{
		templates: template.Must(template.ParseGlob("web/views/*.html")),
	}

	e.Renderer = t

	articleMod := articleService.NewArticleModule(db)

	// Middleware
	// Temp Auth
	e.Use(middleware.BasicAuth(func(username, password string, c echo.Context) (bool, error) {
		// Be careful to use constant time comparison to prevent timing attacks
		if subtle.ConstantTimeCompare([]byte(username), []byte("joe")) == 1 &&
			subtle.ConstantTimeCompare([]byte(password), []byte("secret")) == 1 {
			return true, nil
		}
		return false, nil
	}))
	e.Use(middleware.Recover())

	e.GET("/", articleMod.Gets)

	a := e.Group("/articles")
	a.GET("", articleMod.Gets)
	a.GET("/:id", articleMod.GetByID)

	e.Logger.Fatal(e.Start("0.0.0.0:80"))
}
