package usecase_test

import (
	"testing"

	"github.com/zrecovery/library/internal/author/internal/usecase"
	"github.com/zrecovery/library/internal/author/pkg/author"
	mock_usecase "github.com/zrecovery/library/test/mocks/author/usecase"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestSave(t *testing.T) {
	tests := []struct {
		name            string
		author          *author.Author
		mockReturnID    int
		mockReturnError error
		expected        int
	}{
		{
			name:            "正常保存",
			author:          &author.Author{},
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
		mockRepository.EXPECT().Insert(gomock.Any()).Return(testcase.mockReturnID, testcase.mockReturnError)
		testUseCase := usecase.NewUseCase(mockRepository)
		t.Run(testcase.name, func(t *testing.T) {
			result, err := testUseCase.Save(testcase.author)
			assert.NoError(t, err)
			assert.Equal(t, testcase.expected, result)
		})
	}
}

func TestUpdate(t *testing.T) {
	tests := []struct {
		name            string
		id              int
		author          *author.Author
		mockReturnError error
		expected        error
	}{
		{
			name:            "正常升级",
			id:              0,
			author:          &author.Author{},
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
			err := testUseCase.Update(testcase.author, testcase.id)
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
		name             string
		id               int
		mockReturnAuthor *author.Author
		mockReturnError  error
		expected         *author.Author
	}{
		{
			name:             "通过ID查找作者",
			id:               0,
			mockReturnAuthor: &author.Author{},
			mockReturnError:  nil,
			expected:         &author.Author{},
		},
	}
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		testcase := test
		t.Run(testcase.name, func(t *testing.T) {
			mockRepository.EXPECT().FindByID(gomock.Any()).Return(testcase.mockReturnAuthor, testcase.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			result, err := testUseCase.GetByID(testcase.id)
			assert.NoError(t, err)
			assert.Equal(t, testcase.expected, result)
		})
	}
}

func TestGetAll(t *testing.T) {
	tests := []struct {
		name              string
		mockReturnAuthors []*author.Author
		mockReturnError   error
		expected          []*author.Author
	}{
		{
			name:              "获取所有作者",
			mockReturnAuthors: []*author.Author{{}},
			mockReturnError:   nil,
			expected:          []*author.Author{{}},
		},
	}
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		testcase := test
		t.Run(testcase.name, func(t *testing.T) {
			mockRepository.EXPECT().FindAll().Return(testcase.mockReturnAuthors, testcase.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			result, err := testUseCase.GetAll()
			assert.NoError(t, err)
			assert.Equal(t, testcase.expected, result)
		})
	}
}
