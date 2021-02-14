// Package router 模块路由库
package router

import (
	"github.com/labstack/echo/v4"
	"github.com/zrecovery/library/internal/book/internal/repository"
	restful "github.com/zrecovery/library/internal/book/internal/rest"
	"github.com/zrecovery/library/internal/book/internal/usecase"
)

// NewRouter 接受路由分组和数据库连接地址，挂载路由.
func NewRouter(root *echo.Group, connStr string) {
	repos := repository.NewRepository(connStr)
	useCase := usecase.NewUseCase(repos)
	rest := restful.NewRESTful(useCase)

	books := root.Group("/books")
	books.GET("", rest.Gets)
	books.GET("/:id", rest.GetByID)
	books.POST("", rest.Post)
	books.PUT("/:id", rest.Put)
	books.DELETE("/:id", rest.Delete)
}
