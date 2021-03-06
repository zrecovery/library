package restful_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/golang/mock/gomock"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	rest "github.com/zrecovery/library/internal/book/internal/rest"
	"github.com/zrecovery/library/internal/book/pkg/book"
	mock_rest "github.com/zrecovery/library/test/testdata/mocks/book/rest"
)

type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	return cv.validator.Struct(i)
}

func TestAPI_GetByID(t *testing.T) {
	type mockReturn struct {
		Book  *book.Book
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
			name: "正常通过ID获取书籍",
			mock: mockReturn{
				Book:  &book.Book{},
				Error: nil,
			},
			id: "0",
			want: want{
				Error:      nil,
				JSON:       "{\"data\":{\"author\":\"\",\"title\":\"\"},\"message\":\"OK\"}\n",
				StatusCode: http.StatusOK,
			},
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			c.SetPath("/books/:id")
			c.SetParamNames("id")
			c.SetParamValues(testcase.id)
			mockUseCase.EXPECT().GetByID(gomock.Any()).Return(testcase.mock.Book, testcase.mock.Error)
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
		Books []*book.Book
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
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	tests := []struct {
		name string
		mock mockReturn

		want want
	}{
		{
			name: "正常获取全部书籍",
			mock: mockReturn{
				Books: []*book.Book{{}},
				Error: nil,
			},
			want: want{
				Error:      nil,
				JSON:       "{\"data\":[{\"author\":\"\",\"title\":\"\"}],\"message\":\"OK\"}\n",
				StatusCode: http.StatusOK,
			},
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			c.SetPath("/api/books")

			mockUseCase.EXPECT().GetAll().Return(testcase.mock.Books, testcase.mock.Error)
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

	tests := []struct {
		name     string
		postJSON string
		// useMock避免出现在mock函数前返回而导致的无意义测试失败
		useMock bool
		mock    mockReturn
		want    want
	}{
		{
			name:     "正常提交用户",
			postJSON: "{\"title\":\"test title\",\"author\":\"test author\"}",
			useMock:  true,
			mock: mockReturn{
				ID:    0,
				Error: nil,
			},
			want: want{
				Error:      nil,
				JSON:       "{\"data\":0,\"message\":\"Created\"}\n",
				StatusCode: http.StatusCreated,
			},
		}, {
			name:     "发送不合格数据",
			postJSON: `{"nm":"test name"}`,
			useMock:  false,
			mock: mockReturn{
				ID:    0,
				Error: nil,
			},
			want: want{
				Error:      nil,
				JSON:       "{\"message\":\"Bad Request\"}\n",
				StatusCode: http.StatusBadRequest,
			},
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			e := echo.New()
			e.Validator = &CustomValidator{validator: validator.New()}

			rec := httptest.NewRecorder()
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(testcase.postJSON))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			c := e.NewContext(req, rec)
			c.SetPath("/api/books")

			mockUseCase := mock_rest.NewMockuseCase(ctrl)
			if testcase.useMock {
				mockUseCase.EXPECT().Create(gomock.Any()).Return(testcase.mock.ID, testcase.mock.Error)
			}
			s := rest.NewRESTful(mockUseCase)
			err := s.Post(c)

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
	e.Validator = &CustomValidator{validator: validator.New()}
	rec := httptest.NewRecorder()

	tests := []struct {
		name     string
		postJSON string
		mock     mockReturn

		id   string
		want want
	}{
		{
			name:     "正常修改用户",
			postJSON: `{"id":0,"author":"test new author","title":"test new title"}`,
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
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPut, "/", strings.NewReader(testcase.postJSON))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			c := e.NewContext(req, rec)
			c.SetPath("/books/:id")
			c.SetParamNames("id")
			c.SetParamValues(testcase.id)

			mockUseCase.EXPECT().Update(gomock.Any(), gomock.Any()).Return(testcase.mock.Error)
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
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			c.SetPath("/books/:id")
			c.SetParamNames("id")
			c.SetParamValues(testcase.id)
			mockUseCase.EXPECT().Delete(gomock.Any()).Return(testcase.mock.Error)
			s := rest.NewRESTful(mockUseCase)
			err := s.Delete(c)
			if assert.NoError(t, err) {
				assert.Equal(t, testcase.want.StatusCode, rec.Code)
				assert.Equal(t, testcase.want.JSON, rec.Body.String())
			}
		})
	}
}
