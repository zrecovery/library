// Package router 模块路由库
package router

import (
	"github.com/labstack/echo/v4"
	"github.com/zrecovery/library/internal/article/internal/repository"
	restful "github.com/zrecovery/library/internal/article/internal/rest"
	"github.com/zrecovery/library/internal/article/internal/usecase"
)

// NewRouter 接受路由分组和数据库连接地址，挂载路由.
func NewRouter(root *echo.Group, connStr string) {
	repos := repository.NewRepository(connStr)
	useCase := usecase.NewUseCase(repos)
	r := restful.NewRESTful(useCase)

	articles := root.Group("/articles")
	articles.GET("", r.Gets)
	articles.GET("/:id", r.GetByID)
	articles.POST("", r.Post)
	articles.PUT("/:id", r.Put)
	articles.DELETE("/:id", r.Delete)
}
