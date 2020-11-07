package service

import (
	"database/sql"
	"html/template"
	"net/http"
	"strconv"
	"strings"

	"github.com/zrecovery/library/pkg/article"
	"github.com/zrecovery/library/pkg/article/repository"
	"github.com/zrecovery/library/pkg/article/usecase"

	"github.com/labstack/echo/v4"
)

type UseCase interface {
	GetAll() ([]article.Article, error)
	GetByID(int) (article.Article, error)
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

func NewArticleModule(d *sql.DB) *Service {
	repository := repository.NewRepository(d)
	useCase := usecase.NewUseCase(repository)
	return NewService(useCase)
}

func (s *Service) GetByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Bad Request")
	}

	a, err := s.useCase.GetByID(id)
	if err != nil {
		return c.Render(http.StatusInternalServerError, "article", "Internal Server Error")
	}
	a.Article = strings.Replace(a.Article, "\n", "<br>", -1)
	return c.Render(http.StatusOK, "article", template.HTML(a.Article))
}

func (s *Service) Gets(c echo.Context) error {
	articles, err := s.useCase.GetAll()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}

	return c.Render(http.StatusOK, "index", articles)
}

func (s *Service) Post(c echo.Context) error {
	var a article.Article
	if err := c.Bind(&a); err != nil {
		return c.JSON(http.StatusBadRequest, "Bad Request")
	}
	id, err := s.useCase.Save(a.Entity())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}
	return c.JSON(http.StatusCreated, id)
}

func (s *Service) Put(c echo.Context) error {
	var a article.Article
	if err := c.Bind(&a); err != nil {
		return c.JSON(http.StatusBadRequest, "Bad Request")
	}
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Bad Request")
	}

	err = s.useCase.Update(a.Entity(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}
	return c.JSON(http.StatusNoContent, "No Content")
}

func (s *Service) Delete(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Bad Request")
	}

	err = s.useCase.Delete(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, "Internal Server Error")
	}

	return c.JSON(http.StatusNoContent, "No Content")
}
