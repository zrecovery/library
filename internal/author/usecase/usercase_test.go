package usecase_test

import (
	"testing"

	"github.com/zrecovery/library/internal/author"
	"github.com/zrecovery/library/internal/author/repository"
	"github.com/zrecovery/library/internal/author/usecase"
	mock_usecase "github.com/zrecovery/library/test/mocks/author/usecase"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestSave(t *testing.T) {
	tests := []struct {
		name            string
		author          author.Author
		mockReturnID    int
		mockReturnError error
		expected        int
	}{
		{
			name:            "正常保存",
			author:          author.Author{},
			mockReturnID:    0,
			mockReturnError: nil,
			expected:        0,
		},
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		mockRepository.EXPECT().Insert(gomock.Any()).Return(test.mockReturnID, test.mockReturnError)
		testUseCase := usecase.NewUseCase(mockRepository)
		t.Run(test.name, func(t *testing.T) {
			result, err := testUseCase.Save(test.author.Entity())
			assert.NoError(t, err)
			assert.Equal(t, test.expected, result)
		})
	}
}

func TestUpdate(t *testing.T) {
	tests := []struct {
		name            string
		id              int
		author          author.Author
		mockReturnError error
		expected        error
	}{
		{
			name:            "正常升级",
			id:              0,
			author:          author.Author{},
			mockReturnError: nil,
			expected:        nil,
		},
	}

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			mockRepository.EXPECT().Update(gomock.Any(), gomock.Any()).Return(test.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			err := testUseCase.Update(test.author.Entity(), test.id)
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
		t.Run(test.name, func(t *testing.T) {
			mockRepository.EXPECT().Delete(gomock.Any()).Return(test.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			err := testUseCase.Delete(test.id)
			assert.NoError(t, err)
		})
	}
}

func TestGetByID(t *testing.T) {
	tests := []struct {
		name             string
		id               int
		mockReturnEntity repository.Entity
		mockReturnError  error
		expected         author.Author
	}{
		{
			name:             "通过ID查找作者",
			id:               0,
			mockReturnEntity: repository.Entity{},
			mockReturnError:  nil,
			expected:         author.Author{},
		},
	}
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			mockRepository.EXPECT().FindByID(gomock.Any()).Return(test.mockReturnEntity, test.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			result, err := testUseCase.GetByID(test.id)
			assert.NoError(t, err)
			assert.Equal(t, test.expected, result)
		})
	}
}

func TestGetAll(t *testing.T) {
	tests := []struct {
		name               string
		mockReturnEntities []repository.Entity
		mockReturnError    error
		expected           []author.Author
	}{
		{
			name:               "获取所有作者",
			mockReturnEntities: []repository.Entity{{}},
			mockReturnError:    nil,
			expected:           []author.Author{{}},
		},
	}
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepository := mock_usecase.NewMockRepository(ctrl)

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			mockRepository.EXPECT().FindAll().Return(test.mockReturnEntities, test.mockReturnError)
			testUseCase := usecase.NewUseCase(mockRepository)
			result, err := testUseCase.GetAll()
			assert.NoError(t, err)
			assert.Equal(t, test.expected, result)
		})
	}
}
