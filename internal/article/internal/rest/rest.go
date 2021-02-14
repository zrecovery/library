// Package api 是web的处理单元.
package restful

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

// RESTful 处理RESTful请求单元.
type RESTful struct {
	useCase useCase
}

// NewRESTful 创建API请求单元.
func NewRESTful(usecCase useCase) *RESTful {
	return &RESTful{useCase: usecCase}
}

// GetByID 使用GET通过ID获取指定文章.
func (rest *RESTful) GetByID(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	a, err := rest.useCase.GetByID(ctx, id)
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
func (rest *RESTful) Gets(c echo.Context) error {
	ctx := c.Request().Context()

	keyword := c.QueryParam("search")
	if keyword != "" {
		articles, err := rest.useCase.Search(ctx, keyword)
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

	articles, err := rest.useCase.GetAll(ctx)
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
func (rest *RESTful) Post(c echo.Context) error {
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

	id, err := rest.useCase.Save(ctx, a)
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
func (rest *RESTful) Put(c echo.Context) error {
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

	err = rest.useCase.Update(ctx, a, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Internal Server Error",
		})
	}

	return c.NoContent(http.StatusNoContent)
}

// Delete 删除指定文章.
func (rest *RESTful) Delete(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	err = rest.useCase.Delete(ctx, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Internal Server Error",
		})
	}

	return c.NoContent(http.StatusNoContent)
}
