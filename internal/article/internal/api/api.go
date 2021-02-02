// Package api 是web的处理单元.
package api

import (
	"context"
	"log"
	"net/http"
	"strconv"

	"github.com/zrecovery/library/internal/article/pkg/article"

	"github.com/labstack/echo/v4"
)

type useCase interface {
	GetAll(context.Context) ([]*article.Article, error)
	GetByID(context.Context, int) (*article.Article, error)
	Search(context.Context, string) ([]*article.Article, error)
	Save(ctx context.Context, a *article.Article) (int, error)
	Update(ctx context.Context, a *article.Article, id int) error
	Delete(ctx context.Context, id int) error
}

// API 处理RESTful请求单元.
type API struct {
	useCase useCase
}

// NewAPI 创建API请求单元.
func NewAPI(usecCase useCase) *API {
	return &API{useCase: usecCase}
}

// GetByID 使用GET通过ID获取指定文章.
func (api *API) GetByID(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	a, err := api.useCase.GetByID(ctx, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Internal Server Error",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "OK",
		"data":    a,
	})
}

// Gets 使用GET获取多篇文章.
func (api *API) Gets(c echo.Context) error {
	ctx := c.Request().Context()

	keyword := c.QueryParam("search")
	if keyword != "" {
		articles, err := api.useCase.Search(ctx, keyword)
		if err != nil {
			log.Print(err)
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"message": "Internal Server Error",
			})
		}
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": "OK",
			"data":    articles,
		})
	}

	articles, err := api.useCase.GetAll(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Internal Server Error",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "OK",
		"data":    articles,
	})
}

// Post 使用POST通过添加文章.
func (api *API) Post(c echo.Context) error {
	ctx := c.Request().Context()

	a := new(article.Article)

	if err := c.Bind(a); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	//	初次添加，json中不应有ID，模型中ID应为0
	if a.ID != 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	id, err := api.useCase.Save(ctx, a)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Internal Server Error",
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"message": "Created",
		"data":    id,
	})
}

// Put 使用PUT通过ID修改指定文章.
func (api *API) Put(c echo.Context) error {
	ctx := c.Request().Context()

	a := new(article.Article)
	if err := c.Bind(a); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	// URL中id应与请求模型中ID一致
	if int64(id) != a.ID {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	err = api.useCase.Update(ctx, a, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Internal Server Error",
		})
	}

	return c.NoContent(http.StatusNoContent)
}

// Delete 删除指定文章.
func (api *API) Delete(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	err = api.useCase.Delete(ctx, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Internal Server Error",
		})
	}

	return c.NoContent(http.StatusNoContent)
}
