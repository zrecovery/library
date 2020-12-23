package api

import (
	"net/http"
	"strconv"

	"github.com/zrecovery/library/internal/book/pkg/book"

	"github.com/labstack/echo/v4"
)

type UseCase interface {
	GetAll() ([]*book.Book, error)
	GetByID(int) (*book.Book, error)
	GetByAuthor(string) ([]*book.Book, error)
	Save(*book.Book) (int, error)
	Update(*book.Book, int) error
	Delete(id int) error
}

type API struct {
	useCase UseCase
}

func NewAPI(usecCase UseCase) *API {
	return &API{useCase: usecCase}
}

func (s *API) GetByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	b, err := s.useCase.GetByID(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "OK",
		"data":    b,
	})
}

func (s *API) Gets(c echo.Context) error {
	author := c.QueryParam("author")

	if author == "" {
		books, err := s.useCase.GetAll()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal Server Error")
		}
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": "OK",
			"data":    books,
		})
	}
	books, err := s.useCase.GetByAuthor(author)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "OK",
		"data":    books,
	})
}

func (s *API) Post(c echo.Context) error {
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

	id, err := s.useCase.Save(b)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{
		"message": "Created",
		"data":    id,
	})
}

func (s *API) Put(c echo.Context) error {
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

	err = s.useCase.Update(b, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}
	return c.JSON(http.StatusNoContent, map[string]string{
		"message": "No Content",
	})
}

func (s *API) Delete(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	err = s.useCase.Delete(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}

	return c.JSON(http.StatusNoContent, map[string]string{
		"message": "No Content",
	})
}
