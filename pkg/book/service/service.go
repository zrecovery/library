package service

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"github.com/zrecovery/library/pkg/book"
	"github.com/zrecovery/library/pkg/book/repository"
	"github.com/zrecovery/library/pkg/book/usecase"

	"github.com/labstack/echo/v4"
)

type UseCase interface {
	GetAll() ([]book.Book, error)
	GetByID(int) (book.Book, error)
	GetByAuthor(string) ([]book.Book, error)
	Save(e repository.Entity) (int, error)
	Update(e repository.Entity, id int) error
	Delete(id int) error
}

type Service struct {
	useCase UseCase
}

func NewService(usecCase UseCase) *Service {
	return &Service{useCase: usecCase}
}

func NewBookModule(d *sql.DB) *Service {
	repository := repository.NewRepository(d)
	useCase := usecase.NewUseCase(repository)
	return NewService(useCase)
}

func (s *Service) GetByID(c echo.Context) error {
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
		"book":    b,
	})
}

func (s *Service) Gets(c echo.Context) error {

	author := c.QueryParam("author")

	if author == "" {
		books, err := s.useCase.GetAll()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal Server Error")
		}
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": "OK",
			"books":   books,
		})
	} else {
		books, err := s.useCase.GetByAuthor(author)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, "Internal Server Error")
		}
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": "OK",
			"books":   books,
		})
	}
}

func (s *Service) Post(c echo.Context) error {
	var a book.Book
	if err := c.Bind(&a); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	if err := c.Validate(a); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	id, err := s.useCase.Save(a.Entity())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{
		"message": "Created",
		"id":      id,
	})
}

func (s *Service) Put(c echo.Context) error {
	var a book.Book
	if err := c.Bind(&a); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}
	if err := c.Validate(a); err != nil {
		fmt.Println(err)
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

	err = s.useCase.Update(a.Entity(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}
	return c.JSON(http.StatusNoContent, map[string]string{
		"message": "No Content",
	})
}

func (s *Service) Delete(c echo.Context) error {
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
