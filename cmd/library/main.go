package main

import (
	articleService "github.com/zrecovery/library/pkg/article/service"
	authorService "github.com/zrecovery/library/pkg/author/service"
	bookService "github.com/zrecovery/library/pkg/book/service"

	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
)

func main() {
	e := echo.New()

	connStr := "postgres://postgres:postgres@localhost/library?sslmode=disable"
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

	author := api.Group("/authors")
	author.GET("", authorMod.Gets)
	author.GET("/:id", authorMod.GetByID)

	book := api.Group("/books")
	book.GET("", bookMod.Gets)
	book.GET("/:id", bookMod.GetByID)

	e.Logger.Fatal(e.Start("0.0.0.0:80"))
}
