// Package api 是web的处理单元.
package api

import (
	"net/http"
	"strconv"

	"github.com/zrecovery/library/internal/article/pkg/article"

	"github.com/labstack/echo/v4"
)

type useCase interface {
	GetAll() ([]*article.Article, error)
	GetByID(int) (*article.Article, error)
	Save(a *article.Article) (int, error)
	Update(a *article.Article, id int) error
	Delete(id int) error
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
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	a, err := api.useCase.GetByID(id)
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
	articles, err := api.useCase.GetAll()
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

	id, err := api.useCase.Save(a)
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

	err = api.useCase.Update(a, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Internal Server Error",
		})
	}

	return c.JSON(http.StatusNoContent, map[string]string{
		"message": "No Content",
	})
}

// Delete 删除指定文章.
func (api *API) Delete(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	err = api.useCase.Delete(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Internal Server Error",
		})
	}

	return c.JSON(http.StatusNoContent, map[string]string{
		"message": "No Content",
	})
}
