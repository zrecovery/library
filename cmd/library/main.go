package main

import (
	"net/http"

	articleService "github.com/zrecovery/library/pkg/article/service"
	authorService "github.com/zrecovery/library/pkg/author/service"
	bookService "github.com/zrecovery/library/pkg/book/service"
	echoValidator "github.com/zrecovery/library/pkg/validator"

	"database/sql"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
)

func main() {
	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://127.0.0.1"},
		AllowMethods: []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
	}))

	e.Validator = echoValidator.New(validator.New())
	connStr := "postgres://postgres:postgres@localhost/test?sslmode=disable"

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		panic(err)
	}

	articleMod := articleService.NewArticleModule(db)
	authorMod := authorService.NewAuthorModule(db)
	bookMod := bookService.NewBookModule(db)

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/", articleMod.Gets)
	api := e.Group("/api")
	a := api.Group("/articles")
	a.GET("", articleMod.Gets)
	a.GET("/:id", articleMod.GetByID)
	a.POST("", articleMod.Post)
	a.PUT("/:id", articleMod.Put)

	// api/authors
	author := api.Group("/authors")
	author.GET("", authorMod.Gets)
	author.GET("/:id", authorMod.GetByID)
	author.POST("", authorMod.Post)
	author.DELETE("/:id", authorMod.Delete)

	// api/books
	book := api.Group("/books")
	book.GET("", bookMod.Gets)
	book.GET("/:id", bookMod.GetByID)

	e.Logger.Fatal(e.Start("0.0.0.0:1323"))
}
