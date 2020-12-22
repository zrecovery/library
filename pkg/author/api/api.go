package api

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/zrecovery/library/pkg/author"
	"github.com/zrecovery/library/pkg/author/repository"
	"github.com/zrecovery/library/pkg/author/usecase"

	"github.com/labstack/echo/v4"
)

type UseCase interface {
	GetAll() ([]author.Author, error)
	GetByID(int) (author.Author, error)
	Save(e repository.Entity) (int, error)
	Update(e repository.Entity, id int) error
	Delete(id int) error
}

type api struct {
	useCase UseCase
}

func NewApi(usecCase UseCase) *api {
	return &api{useCase: usecCase}
}

func NewAuthorModule(d *sql.DB) *api {
	repository := repository.NewRepository(d)
	useCase := usecase.NewUseCase(repository)
	return NewApi(useCase)
}

func (api *api) GetByID(c echo.Context) error {
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

func (api *api) Gets(c echo.Context) error {
	authors, err := api.useCase.GetAll()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Internal Server Error",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "OK",
		"data":    authors,
	})
}

func (api *api) Post(c echo.Context) error {
	a := new(author.Author)

	if err := c.Bind(a); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}
	if err := c.Validate(*a); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Bad Request",
		})
	}

	id, err := api.useCase.Save(a.Entity())
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

func (api *api) Put(c echo.Context) error {
	var a author.Author
	if err := c.Bind(&a); err != nil {
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

	err = api.useCase.Update(a.Entity(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Internal Server Error",
		})
	}
	return c.JSON(http.StatusNoContent, map[string]string{
		"message": "No Content",
	})
}

func (api *api) Delete(c echo.Context) error {
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
