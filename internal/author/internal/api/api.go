package api

import (
	"net/http"
	"strconv"

	"github.com/zrecovery/library/internal/author/pkg/author"

	"github.com/labstack/echo/v4"
)

type UseCase interface {
	GetAll() ([]*author.Author, error)
	GetByID(int) (*author.Author, error)
	Save(*author.Author) (int, error)
	Update(*author.Author, int) error
	Delete(id int) error
}

type API struct {
	useCase UseCase
}

func NewAPI(usecCase UseCase) *API {
	return &API{useCase: usecCase}
}

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

func (api *API) Gets(c echo.Context) error {
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

func (api *API) Post(c echo.Context) error {
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

func (api *API) Put(c echo.Context) error {
	a := new(author.Author)
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
