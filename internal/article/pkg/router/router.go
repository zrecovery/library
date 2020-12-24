// Package router 模块路由库
package router

import (
	"github.com/labstack/echo/v4"
	"github.com/zrecovery/library/internal/article/internal/api"
	"github.com/zrecovery/library/internal/article/internal/repository"
	"github.com/zrecovery/library/internal/article/internal/usecase"
)

// NewRouter 接受路由分组和数据库连接地址，挂载路由.
func NewRouter(root *echo.Group, connStr string) {
	repos := repository.NewRepository(connStr)
	useCase := usecase.NewUseCase(repos)
	a := api.NewAPI(useCase)

	articles := root.Group("/articles")
	articles.GET("", a.Gets)

	articles.GET(":id", a.GetByID)
	articles.POST("", a.Post)
	articles.PUT(":id", a.Put)
	articles.DELETE(":id", a.Delete)
}
