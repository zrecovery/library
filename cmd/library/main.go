// Package main 是library电子图书、文章管理系统启动入口.
package main

import (
	"net/http"

	articleRouter "github.com/zrecovery/library/internal/article/pkg/router"
	bookRouter "github.com/zrecovery/library/internal/book/pkg/router"
	"github.com/zrecovery/library/pkg/config"
	echoValidator "github.com/zrecovery/library/pkg/validator"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()
	e.File("/favicon.ico", "../../web/favicon.ico")

	e.Validator = echoValidator.New(validator.New())

	configService := config.NewSerivice("../../config/config.json")

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://127.0.0.1"},
		AllowMethods: []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
	}))

	// Router
	api := e.Group("/api")
	articleRouter.NewRouter(api, configService.DataURI)
	bookRouter.NewRouter(api, configService.DataURI)

	e.Logger.Fatal(e.Start("0.0.0.0:1323"))
}
