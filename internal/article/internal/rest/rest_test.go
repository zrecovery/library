package restful_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	rest "github.com/zrecovery/library/internal/article/internal/rest"
	"github.com/zrecovery/library/internal/article/pkg/article"
	mock_rest "github.com/zrecovery/library/test/mocks/article/rest"

	"github.com/golang/mock/gomock"
)

func TestAPI_GetByID(t *testing.T) {
	type mockReturn struct {
		Article *article.Article
		Error   error
	}

	type want struct {
		Error      error
		JSON       string
		StatusCode int
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_rest.NewMockuseCase(ctrl)

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
				Article: &article.Article{},
				Error:   nil,
			},
			id: "0",
			want: want{
				Error:      nil,
				JSON:       "{\"data\":{\"author\":\"\",\"book\":\"\",\"title\":\"\",\"content\":\"\",\"serial\":0},\"message\":\"OK\"}\n",
				StatusCode: http.StatusOK,
			},
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			c.SetPath("/articles/:id")
			c.SetParamNames("id")
			c.SetParamValues(testcase.id)
			mockUseCase.EXPECT().GetByID(gomock.Any(), gomock.Any()).Return(testcase.mock.Article, testcase.mock.Error)
			s := rest.NewRESTful(mockUseCase)
			err := s.GetByID(c)
			if assert.NoError(t, err) {
				assert.Equal(t, testcase.want.StatusCode, rec.Code)
				assert.Equal(t, testcase.want.JSON, rec.Body.String())
			}
		})
	}
}

func TestAPI_GetAll(t *testing.T) {
	type mockReturn struct {
		Articles []*article.Article
		Error    error
	}

	type want struct {
		Error      error
		JSON       string
		StatusCode int
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUseCase := mock_rest.NewMockuseCase(ctrl)

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
				Articles: []*article.Article{{}},
				Error:    nil,
			},
			want: want{
				Error:      nil,
				JSON:       "{\"data\":[{\"author\":\"\",\"book\":\"\",\"title\":\"\",\"content\":\"\",\"serial\":0}],\"message\":\"OK\"}\n",
				StatusCode: http.StatusOK,
			},
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			c.SetPath("/articles")

			mockUseCase.EXPECT().GetAll(gomock.Any()).Return(testcase.mock.Articles, testcase.mock.Error)
			s := rest.NewRESTful(mockUseCase)

			err := s.Gets(c)
			if assert.NoError(t, err) {
				assert.Equal(t, testcase.want.StatusCode, rec.Code)
				assert.Equal(t, testcase.want.JSON, rec.Body.String())
			}
		})
	}
}

func TestAPI_Post(t *testing.T) {
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

	mockUseCase := mock_rest.NewMockuseCase(ctrl)

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
			postJSON: `{"book":"test book","author":"test author","serial":1.0,"title":"test title","content":"test article"}`,
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
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(testcase.postJSON))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			c := e.NewContext(req, rec)
			c.SetPath("/articles")
			mockUseCase.EXPECT().Save(gomock.Any(), gomock.Any()).Return(testcase.mock.ID, testcase.mock.Error)
			a := rest.NewRESTful(mockUseCase)
			err := a.Post(c)
			if assert.NoError(t, err) {
				assert.Equal(t, testcase.want.StatusCode, rec.Code)
				assert.Equal(t, testcase.want.JSON, rec.Body.String())
			}
		})
	}
}

func TestAPI_Put(t *testing.T) {
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

	mockUseCase := mock_rest.NewMockuseCase(ctrl)

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
			postJSON: `{"id":0,"book":"test book","author":"test author","serial":1,"title":""test title","content":"test article"}`,
			mock: mockReturn{
				Error: nil,
			},
			id: "0",
			want: want{
				Error:      nil,
				JSON:       "",
				StatusCode: http.StatusNoContent,
			},
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPut, "/", strings.NewReader(testcase.postJSON))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
			c := e.NewContext(req, rec)
			c.SetPath("/articles/:id")
			c.SetParamNames("id")
			c.SetParamValues(testcase.id)

			mockUseCase.EXPECT().Update(gomock.Any(), gomock.Any(), gomock.Any()).Return(testcase.mock.Error)
			s := rest.NewRESTful(mockUseCase)
			err := s.Put(c)
			if assert.NoError(t, err) {
				assert.Equal(t, testcase.want.StatusCode, rec.Code)
				assert.Equal(t, testcase.want.JSON, rec.Body.String())
			}
		})
	}
}

func TestAPI_Delete(t *testing.T) {
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

	mockUseCase := mock_rest.NewMockuseCase(ctrl)

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
			name: "通过合法ID删除文章",
			mock: mockReturn{
				Error: nil,
			},
			id: "0",
			want: want{
				Error:      nil,
				JSON:       "",
				StatusCode: http.StatusNoContent,
			},
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			c.SetPath("/articles/:id")
			c.SetParamNames("id")
			c.SetParamValues(testcase.id)
			mockUseCase.EXPECT().Delete(gomock.Any(), gomock.Any()).Return(testcase.mock.Error)
			s := rest.NewRESTful(mockUseCase)
			err := s.Delete(c)
			if assert.NoError(t, err) {
				assert.Equal(t, testcase.want.StatusCode, rec.Code)
				assert.Equal(t, testcase.want.JSON, rec.Body.String())
			}
		})
	}
}
