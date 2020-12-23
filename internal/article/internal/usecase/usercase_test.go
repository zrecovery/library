package usecase_test

import (
	"testing"

	"github.com/zrecovery/library/internal/article/internal/usecase"
	"github.com/zrecovery/library/internal/article/pkg/article"
	mock_usecase "github.com/zrecovery/library/test/mocks/article/usecase"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestSave(t *testing.T) {
	tests := []struct {
		name            string
		article         article.Article
		mockReturnID    int
		mockReturnError error
		expected        int
	}{
		{
			name:            "正常保存",
			article:         article.Article{},
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

		t.Run(test.name, func(t *testing.T) {
			result, err := testUseCase.Save(&testcase.article)
			assert.NoError(t, err)
			assert.Equal(t, testcase.expected, result)
		})
	}
}

func TestUpdate(t *testing.T) {
	tests := []struct {
		name            string
		id              int
		article         article.Article
		mockReturnError error
		expected        error
	}{
		{
			name:            "正常升级",
			id:              0,
			article:         article.Article{},
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
			err := testUseCase.Update(&testcase.article, testcase.id)
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
		t.Run(test.name, func(t *testing.T) {
			mockRepository.EXPECT().Delete(gomock.Any()).Return(testcase.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			err := testUseCase.Delete(testcase.id)
			assert.NoError(t, err)
		})
	}
}

func TestGetByID(t *testing.T) {
	tests := []struct {
		name              string
		id                int
		mockReturnArticle *article.Article
		mockReturnError   error
		expected          *article.Article
	}{
		{
			name:              "通过ID查找文章",
			id:                0,
			mockReturnArticle: &article.Article{},
			mockReturnError:   nil,
			expected:          &article.Article{},
		},
	}
	ctrl := gomock.NewController(t)

	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		testcase := test
		t.Run(test.name, func(t *testing.T) {
			mockRepository.EXPECT().FindByID(gomock.Any()).Return(testcase.mockReturnArticle, testcase.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			result, err := testUseCase.GetByID(testcase.id)
			assert.NoError(t, err)
			assert.Equal(t, testcase.expected, result)
		})
	}
}

func TestGetAll(t *testing.T) {
	tests := []struct {
		name               string
		mockReturnArticles []*article.Article
		mockReturnError    error
		expected           []*article.Article
	}{
		{
			name:               "获取所有文章",
			mockReturnArticles: []*article.Article{{}},
			mockReturnError:    nil,
			expected:           []*article.Article{{}},
		},
	}
	ctrl := gomock.NewController(t)

	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		testcase := test
		t.Run(test.name, func(t *testing.T) {
			mockRepository.EXPECT().FindAll().Return(testcase.mockReturnArticles, testcase.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			result, err := testUseCase.GetAll()
			assert.NoError(t, err)
			assert.Equal(t, testcase.expected, result)
		})
	}
}
