package service_test

import (
	"library/pkg/article"
	"library/pkg/article/service"
	mock_service "library/test/mocks/article/service"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func Test_GetByID(t *testing.T) {
	tests := []struct {
		name              string
		id                int
		mockReturnArticle article.Article
		mockReturnError   error
		statusCode        int
		expected          string
	}{
		{
			name:              "通过ID获取文章",
			id:                0,
			mockReturnArticle: article.Article{},
			mockReturnError:   nil,
			statusCode:        http.StatusOK,
			expected:          "{\"ID\":0,\"Author\":\"\",\"Book\":\"\",\"Title\":\"\",\"Article\":\"\",\"Serial\":0}\n",
		},
	}

	// Setup
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_service.NewMockUseCase(ctrl)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/articles", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/articles/:id")
	c.SetParamNames("id")
	c.SetParamValues("0")

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			c.SetParamValues(strconv.Itoa(test.id))

			mockUseCase.EXPECT().GetByID(gomock.Any()).Return(test.mockReturnArticle, test.mockReturnError)
			testService := service.NewService(mockUseCase)

			err := testService.GetByID(c)
			if assert.NoError(t, err) {
				assert.Equal(t, test.statusCode, rec.Code)
				assert.Equal(t, test.expected, rec.Body.String())
			}
		})
	}
}

func Test_Gets(t *testing.T) {
	tests := []struct {
		name               string
		mockReturnArticles []article.Article
		mockReturnError    error
		statusCode         int
		expected           string
	}{
		{
			name:               "获取全部文章",
			mockReturnArticles: []article.Article{{}},
			mockReturnError:    nil,
			statusCode:         http.StatusOK,
			expected:           "[{\"ID\":0,\"Author\":\"\",\"Book\":\"\",\"Title\":\"\",\"Article\":\"\",\"Serial\":0}]\n",
		},
	}

	// Setup
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_service.NewMockUseCase(ctrl)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/articles", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/articles")

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			mockUseCase.EXPECT().GetAll().Return(test.mockReturnArticles, test.mockReturnError)
			testService := service.NewService(mockUseCase)
			err := testService.Gets(c)
			if assert.NoError(t, err) {
				assert.Equal(t, test.statusCode, rec.Code)
				assert.Equal(t, test.expected, rec.Body.String())
			}
		})
	}
}

func Test_Post(t *testing.T) {
	tests := []struct {
		name            string
		data            string
		mockReturnID    int
		mockReturnError error
		statusCode      int
		expected        string
	}{
		{
			name:            "Post",
			data:            `{"title":"","book":"","serial":0,"article":"","author":""}`,
			mockReturnID:    0,
			mockReturnError: nil,
			statusCode:      http.StatusCreated,
			expected:        "0\n",
		},
	}

	// Setup
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_service.NewMockUseCase(ctrl)
	e := echo.New()

	rec := httptest.NewRecorder()

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/articles", strings.NewReader(test.data))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			c := e.NewContext(req, rec)
			mockUseCase.EXPECT().Save(gomock.Any()).Return(test.mockReturnID, test.mockReturnError)
			testService := service.NewService(mockUseCase)
			err := testService.Post(c)
			if assert.NoError(t, err) {
				assert.Equal(t, test.statusCode, rec.Code)
				assert.Equal(t, test.expected, rec.Body.String())
			}
		})
	}

}

func Test_Put(t *testing.T) {
	tests := []struct {
		name            string
		data            string
		id              string
		mockReturnError error
		statusCode      int
		expected        string
	}{
		{
			name:            "Put",
			data:            `{"name":"","email":"","password":""}`,
			id:              "0",
			mockReturnError: nil,
			statusCode:      http.StatusNoContent,
			expected:        "\"No Content\"\n",
		},
	}

	// Setup
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_service.NewMockUseCase(ctrl)
	e := echo.New()

	rec := httptest.NewRecorder()

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPut, "/articles", strings.NewReader(test.data))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			c := e.NewContext(req, rec)
			c.SetPath("/articles/:id")
			c.SetParamNames("id")
			c.SetParamValues(test.id)

			mockUseCase.EXPECT().Update(gomock.Any(), gomock.Any()).Return(test.mockReturnError)
			testService := service.NewService(mockUseCase)

			err := testService.Put(c)
			if assert.NoError(t, err) {
				assert.Equal(t, test.statusCode, rec.Code)
				assert.Equal(t, test.expected, rec.Body.String())
			}
		})
	}
}

func Test_Delete(t *testing.T) {
	tests := []struct {
		name            string
		id              int
		mockReturnError error
		statusCode      int
		expected        string
	}{
		{
			name:            "Delete by ID",
			id:              0,
			mockReturnError: nil,
			statusCode:      http.StatusNoContent,
			expected:        "\"No Content\"\n",
		},
	}

	// Setup
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_service.NewMockUseCase(ctrl)

	e := echo.New()
	req := httptest.NewRequest(http.MethodDelete, "/articles", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/articles/:id")
	c.SetParamNames("id")
	c.SetParamValues("0")

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			c.SetParamValues(strconv.Itoa(test.id))
			mockUseCase.EXPECT().Delete(gomock.Any()).Return(test.mockReturnError)
			testService := service.NewService(mockUseCase)

			err := testService.Delete(c)
			if assert.NoError(t, err) {
				assert.Equal(t, test.statusCode, rec.Code)
				assert.Equal(t, test.expected, rec.Body.String())
			}
		})
	}
}
