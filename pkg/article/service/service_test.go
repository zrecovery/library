package service_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/zrecovery/library/pkg/article"
	"github.com/zrecovery/library/pkg/article/service"
	mock_service "github.com/zrecovery/library/test/mocks/article/service"

	"github.com/golang/mock/gomock"
)

func TestService_GetByID(t *testing.T) {
	type mockReturn struct {
		Article article.Article
		Error   error
	}

	type want struct {
		Error      error
		JSON       string
		StatusCode int
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_service.NewMockUseCase(ctrl)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	tests := []struct {
		name string
		mock mockReturn

		id   string
		want want
	}{
		{
			name: "正常通过ID获取",
			mock: mockReturn{
				Article: article.Article{},
				Error:   nil,
			},
			id: "0",
			want: want{
				Error:      nil,
				JSON:       "{\"data\":{\"author\":\"\",\"book\":\"\",\"title\":\"\",\"article\":\"\",\"serial\":0},\"message\":\"OK\"}\n",
				StatusCode: http.StatusOK,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c.SetPath("/articles/:id")
			c.SetParamNames("id")
			c.SetParamValues(tt.id)
			mockUseCase.EXPECT().GetByID(gomock.Any()).Return(tt.mock.Article, tt.mock.Error)
			s := service.NewService(mockUseCase)
			err := s.GetByID(c)
			if assert.NoError(t, err) {
				assert.Equal(t, tt.want.StatusCode, rec.Code)
				assert.Equal(t, tt.want.JSON, rec.Body.String())
			}
		})
	}
}

func TestService_GetAll(t *testing.T) {
	type mockReturn struct {
		Articles []article.Article
		Error    error
	}

	type want struct {
		Error      error
		JSON       string
		StatusCode int
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_service.NewMockUseCase(ctrl)

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	tests := []struct {
		name string
		mock mockReturn

		want want
	}{
		{
			name: "正常获取全部文章",
			mock: mockReturn{
				Articles: []article.Article{{}},
				Error:    nil,
			},
			want: want{
				Error:      nil,
				JSON:       "{\"data\":[{\"author\":\"\",\"book\":\"\",\"title\":\"\",\"article\":\"\",\"serial\":0}],\"message\":\"OK\"}\n",
				StatusCode: http.StatusOK,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c.SetPath("/articles")

			mockUseCase.EXPECT().GetAll().Return(tt.mock.Articles, tt.mock.Error)
			s := service.NewService(mockUseCase)

			err := s.Gets(c)
			if assert.NoError(t, err) {
				assert.Equal(t, tt.want.StatusCode, rec.Code)
				assert.Equal(t, tt.want.JSON, rec.Body.String())
			}
		})
	}
}

func TestService_Post(t *testing.T) {
	type mockReturn struct {
		ID    int
		Error error
	}

	type want struct {
		Error      error
		JSON       string
		StatusCode int
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_service.NewMockUseCase(ctrl)

	e := echo.New()

	rec := httptest.NewRecorder()

	tests := []struct {
		name     string
		postJSON string
		mock     mockReturn
		want     want
	}{
		{
			name:     "正常提交文章",
			postJSON: `{"book":"test book","author":"test author","serial":1,"title":""test title","article":"test article"}`,
			mock: mockReturn{
				ID:    0,
				Error: nil,
			},
			want: want{
				Error:      nil,
				JSON:       "{\"data\":0,\"message\":\"Created\"}\n",
				StatusCode: http.StatusCreated,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.postJSON))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
			c := e.NewContext(req, rec)
			c.SetPath("/articles")
			mockUseCase.EXPECT().Save(gomock.Any()).Return(tt.mock.ID, tt.mock.Error)
			s := service.NewService(mockUseCase)
			err := s.Post(c)
			if assert.NoError(t, err) {
				assert.Equal(t, tt.want.StatusCode, rec.Code)
				assert.Equal(t, tt.want.JSON, rec.Body.String())
			}
		})
	}
}

func TestService_Put(t *testing.T) {
	type mockReturn struct {
		Error error
	}

	type want struct {
		Error      error
		JSON       string
		StatusCode int
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_service.NewMockUseCase(ctrl)

	e := echo.New()

	rec := httptest.NewRecorder()

	tests := []struct {
		name     string
		postJSON string
		mock     mockReturn

		id   string
		want want
	}{
		{
			name:     "正常修改文章",
			postJSON: `{"id":0,"book":"test book","author":"test author","serial":1,"title":""test title","article":"test article"}`,
			mock: mockReturn{
				Error: nil,
			},
			id: "0",
			want: want{
				Error:      nil,
				JSON:       "{\"message\":\"No Content\"}\n",
				StatusCode: http.StatusNoContent,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPut, "/", strings.NewReader(tt.postJSON))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
			c := e.NewContext(req, rec)
			c.SetPath("/articles/:id")
			c.SetParamNames("id")
			c.SetParamValues(tt.id)

			mockUseCase.EXPECT().Update(gomock.Any(), gomock.Any()).Return(tt.mock.Error)
			s := service.NewService(mockUseCase)
			err := s.Put(c)
			if assert.NoError(t, err) {
				assert.Equal(t, tt.want.StatusCode, rec.Code)
				assert.Equal(t, tt.want.JSON, rec.Body.String())
			}
		})
	}
}

func TestService_Delete(t *testing.T) {
	type mockReturn struct {
		Error error
	}

	type want struct {
		Error      error
		JSON       string
		StatusCode int
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_service.NewMockUseCase(ctrl)

	e := echo.New()
	req := httptest.NewRequest(http.MethodDelete, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	tests := []struct {
		name string
		mock mockReturn

		id   string
		want want
	}{
		{
			name: "正常通过ID删除",
			mock: mockReturn{
				Error: nil,
			},
			id: "0",
			want: want{
				Error:      nil,
				JSON:       "{\"message\":\"No Content\"}\n",
				StatusCode: http.StatusNoContent,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c.SetPath("/articles/:id")
			c.SetParamNames("id")
			c.SetParamValues(tt.id)
			mockUseCase.EXPECT().Delete(gomock.Any()).Return(tt.mock.Error)
			s := service.NewService(mockUseCase)
			err := s.Delete(c)
			if assert.NoError(t, err) {
				assert.Equal(t, tt.want.StatusCode, rec.Code)
				assert.Equal(t, tt.want.JSON, rec.Body.String())
			}
		})
	}
}
