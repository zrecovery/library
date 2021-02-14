// Package api 是web的处理单元.
package restful

import (
	"net/http"
	"strconv"

	"github.com/zrecovery/library/internal/book/pkg/book"

	"github.com/labstack/echo/v4"
)

type useCase interface {
	GetAll() ([]*book.Book, error)
	GetByID(int) (*book.Book, error)
	GetByAuthor(string) ([]*book.Book, error)
	Create(*book.Book) (int, error)
	Update(*book.Book, int) error
	Delete(id int) error
	Search(keyword string) ([]*book.Book, error)
}

// RESTful 处理RESTful请求单元.
type RESTful struct {
	useCase useCase
}

// NewRESTful 创建API请求单元.
func NewRESTful(usecCase useCase) *RESTful {
	return &RESTful{useCase: usecCase}
}

// GetByID 通过ID获取数据.
func (rest *RESTful) GetByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	b, err := rest.useCase.GetByID(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "OK",
		"data":    b,
	})
}

// Gets 获取全部数据.
func (rest *RESTful) Gets(c echo.Context) error {
	author := c.QueryParam("author")
	keyword := c.QueryParam("search")

	if author == "" && keyword == "" {
		books, err := rest.useCase.GetAll()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal Server Error")
		}

		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": "OK",
			"data":    books,
		})
	}

	if keyword != "" {
		articles, err := rest.useCase.Search(keyword)
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

	books, err := rest.useCase.GetByAuthor(author)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "OK",
		"data":    books,
	})
}

// Post 上传数据.
func (rest *RESTful) Post(c echo.Context) error {
	b := new(book.Book)
	if err := c.Bind(b); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	if err := c.Validate(b); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	id, err := rest.useCase.Create(b)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"message": "Created",
		"data":    id,
	})
}

// Put 修改数据.
func (rest *RESTful) Put(c echo.Context) error {
	b := new(book.Book)
	if err := c.Bind(b); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	if err := c.Validate(b); err != nil {
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

	err = rest.useCase.Update(b, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}

	return c.JSON(http.StatusNoContent, map[string]string{
		"message": "No Content",
	})
}

// Delete 删除数据.
func (rest *RESTful) Delete(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	err = rest.useCase.Delete(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}

	return c.JSON(http.StatusNoContent, map[string]string{
		"message": "No Content",
	})
}
