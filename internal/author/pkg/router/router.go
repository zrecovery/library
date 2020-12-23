package router

import (
	"github.com/labstack/echo/v4"
	"github.com/zrecovery/library/internal/author/internal/api"
	"github.com/zrecovery/library/internal/author/internal/repository"
	"github.com/zrecovery/library/internal/author/internal/usecase"
)

// NewRouter 接受路由分组和数据库连接地址，挂载路由.
func NewRouter(root *echo.Group, connStr string) {
	repos := repository.NewRepository(connStr)
	useCase := usecase.NewUseCase(repos)
	a := api.NewAPI(useCase)

	authors := root.Group("/authors")
	authors.GET("", a.Gets)
	authors.GET(":id", a.GetByID)
	authors.POST("", a.Post)
	authors.PUT(":id", a.Put)
	authors.DELETE(":id", a.Delete)
}
