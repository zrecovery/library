package service_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/golang/mock/gomock"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/zrecovery/library/pkg/book"
	"github.com/zrecovery/library/pkg/book/service"
	mock_service "github.com/zrecovery/library/test/mocks/book/service"
)

type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	return cv.validator.Struct(i)
}

func TestService_GetByID(t *testing.T) {
	type mockReturn struct {
		Book  book.Book
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
				Book:  book.Book{},
				Error: nil,
			},
			id: "0",
			want: want{
				Error:      nil,
				JSON:       "{\"book\":{\"author\":\"\",\"title\":\"\"},\"message\":\"OK\"}\n",
				StatusCode: http.StatusOK,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c.SetPath("/books/:id")
			c.SetParamNames("id")
			c.SetParamValues(tt.id)
			mockUseCase.EXPECT().GetByID(gomock.Any()).Return(tt.mock.Book, tt.mock.Error)
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
		Books []book.Book
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
				Books: []book.Book{{}},
				Error: nil,
			},
			want: want{
				Error:      nil,
				JSON:       "{\"books\":[{\"author\":\"\",\"title\":\"\"}],\"message\":\"OK\"}\n",
				StatusCode: http.StatusOK,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c.SetPath("/api/books")

			mockUseCase.EXPECT().GetAll().Return(tt.mock.Books, tt.mock.Error)
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
				JSON:       "{\"id\":0,\"message\":\"Created\"}\n",
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
		t.Run(tt.name, func(t *testing.T) {
			e := echo.New()
			e.Validator = &CustomValidator{validator: validator.New()}

			rec := httptest.NewRecorder()
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.postJSON))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			c := e.NewContext(req, rec)
			c.SetPath("/api/books")

			mockUseCase := mock_service.NewMockUseCase(ctrl)
			if tt.useMock {
				mockUseCase.EXPECT().Save(gomock.Any()).Return(tt.mock.ID, tt.mock.Error)
			}
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
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPut, "/", strings.NewReader(tt.postJSON))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			c := e.NewContext(req, rec)
			c.SetPath("/books/:id")
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
			c.SetPath("/books/:id")
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
