package usecase_test

import (
	"testing"

	"github.com/zrecovery/library/internal/book/internal/usecase"
	"github.com/zrecovery/library/internal/book/pkg/book"
	mock_usecase "github.com/zrecovery/library/test/mocks/book/usecase"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestSave(t *testing.T) {
	tests := []struct {
		name            string
		book            *book.Book
		mockReturnID    int
		mockReturnError error
		expected        int
	}{
		{
			name:            "正常保存",
			book:            &book.Book{},
			mockReturnID:    0,
			mockReturnError: nil,
			expected:        0,
		},
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		testcase := test
		mockRepository.EXPECT().Save(gomock.Any()).Return(testcase.mockReturnID, testcase.mockReturnError)
		testUseCase := usecase.NewUseCase(mockRepository)

		t.Run(testcase.name, func(t *testing.T) {
			result, err := testUseCase.Create(testcase.book)
			assert.NoError(t, err)
			assert.Equal(t, testcase.expected, result)
		})
	}
}

func TestUpdate(t *testing.T) {
	tests := []struct {
		name            string
		id              int
		book            *book.Book
		mockReturnError error
		expected        error
	}{
		{
			name:            "正常升级",
			id:              0,
			book:            &book.Book{},
			mockReturnError: nil,
			expected:        nil,
		},
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		testcase := test
		t.Run(testcase.name, func(t *testing.T) {
			mockRepository.EXPECT().Update(gomock.Any(), gomock.Any()).Return(testcase.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			err := testUseCase.Update(testcase.book, testcase.id)
			assert.NoError(t, err)
		})
	}
}

func TestDelete(t *testing.T) {
	tests := []struct {
		name            string
		id              int
		mockReturnError error
		expected        error
	}{
		{
			name:            "正常删除",
			id:              1,
			mockReturnError: nil,
			expected:        nil,
		},
	}
	ctrl := gomock.NewController(t)

	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		testcase := test
		t.Run(testcase.name, func(t *testing.T) {
			mockRepository.EXPECT().Delete(gomock.Any()).Return(testcase.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			err := testUseCase.Delete(testcase.id)
			assert.NoError(t, err)
		})
	}
}

func TestGetByID(t *testing.T) {
	tests := []struct {
		name            string
		id              int
		mockReturnBook  *book.Book
		mockReturnError error
		expected        *book.Book
	}{
		{
			name:            "通过ID查找书籍",
			id:              0,
			mockReturnBook:  &book.Book{},
			mockReturnError: nil,
			expected:        &book.Book{},
		},
	}
	ctrl := gomock.NewController(t)

	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		testcase := test
		t.Run(testcase.name, func(t *testing.T) {
			mockRepository.EXPECT().FindByID(gomock.Any()).Return(testcase.mockReturnBook, testcase.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			result, err := testUseCase.GetByID(testcase.id)
			assert.NoError(t, err)
			assert.Equal(t, testcase.expected, result)
		})
	}
}

func TestGetAll(t *testing.T) {
	tests := []struct {
		name            string
		mockReturnBooks []*book.Book
		mockReturnError error
		expected        []*book.Book
	}{
		{
			name:            "获取所有书籍",
			mockReturnBooks: []*book.Book{{}},
			mockReturnError: nil,
			expected:        []*book.Book{{}},
		},
	}
	ctrl := gomock.NewController(t)

	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		testcase := test
		t.Run(testcase.name, func(t *testing.T) {
			mockRepository.EXPECT().FindAll().Return(testcase.mockReturnBooks, testcase.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			result, err := testUseCase.GetAll()
			assert.NoError(t, err)
			assert.Equal(t, testcase.expected, result)
		})
	}
}
