package usecase

import (
	"github.com/zrecovery/library/internal/article/pkg/article"
)

type Repository interface {
	Insert(*article.Article) (int, error)
	Update(*article.Article, int) error
	Delete(id int) error
	FindByID(id int) (*article.Article, error)
	FindAll() ([]*article.Article, error)
}

type UseCase struct {
	repository Repository
}

func NewUseCase(repository Repository) *UseCase {
	return &UseCase{repository: repository}
}

func (u *UseCase) Save(a *article.Article) (int, error) {
	id, err := u.repository.Insert(a)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (u *UseCase) Update(a *article.Article, id int) error {
	err := u.repository.Update(a, id)
	if err != nil {
		return err
	}
	return err
}

func (u *UseCase) Delete(id int) error {
	err := u.repository.Delete(id)
	if err != nil {
		return err
	}
	return err
}

func (u *UseCase) GetByID(id int) (*article.Article, error) {
	a, err := u.repository.FindByID(id)
	if err != nil {
		return a, err
	}
	return a, err
}

func (u *UseCase) GetAll() ([]*article.Article, error) {
	articles, err := u.repository.FindAll()

	if err != nil {
		return articles, err
	}

	return articles, err
}
