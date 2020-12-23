package main

import (
	"net/http"

	articleRouter "github.com/zrecovery/library/internal/article/pkg/router"
	authorRouter "github.com/zrecovery/library/internal/author/pkg/router"
	bookRouter "github.com/zrecovery/library/internal/book/pkg/router"
	echoValidator "github.com/zrecovery/library/pkg/validator"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
)

func main() {
	e := echo.New()
	e.File("/favicon.ico", "../../web/favicon.ico")
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://127.0.0.1"},
		AllowMethods: []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
	}))

	e.Validator = echoValidator.New(validator.New())

	connStr := "postgres://postgres:test@10.211.55.5/test?sslmode=disable"

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	api := e.Group("/api")
	articleRouter.NewRouter(api, connStr)
	authorRouter.NewRouter(api, connStr)
	bookRouter.NewRouter(api, connStr)
	e.Logger.Fatal(e.Start("0.0.0.0:1323"))
}
