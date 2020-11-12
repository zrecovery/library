package main

import (
	articleService "github.com/zrecovery/library/pkg/article/service"

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

	// Middleware
	// Temp Auth
	e.Use(middleware.Recover())

	e.GET("/", articleMod.Gets)
	api := e.Group("/api")
	a := api.Group("/articles")
	a.GET("", articleMod.Gets)
	a.GET("/:id", articleMod.GetByID)

	e.Logger.Fatal(e.Start("0.0.0.0:80"))
}
