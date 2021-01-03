// Package router 模块路由库
package router

import (
	"github.com/labstack/echo/v4"
	"github.com/zrecovery/library/internal/book/internal/api"
	"github.com/zrecovery/library/internal/book/internal/repository"
	"github.com/zrecovery/library/internal/book/internal/usecase"
)

// NewRouter 接受路由分组和数据库连接地址，挂载路由.
func NewRouter(root *echo.Group, connStr string) {
	repos := repository.NewRepository(connStr)
	useCase := usecase.NewUseCase(repos)
	a := api.NewAPI(useCase)

	books := root.Group("/books")
	books.GET("", a.Gets)
	books.GET("/:id", a.GetByID)
	books.POST("", a.Post)
	books.PUT("/:id", a.Put)
	books.DELETE("/:id", a.Delete)
}
