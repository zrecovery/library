package usecase

import (
	"github.com/zrecovery/library/internal/author/pkg/author"
)

type Repository interface {
	Insert(*author.Author) (int, error)
	Update(*author.Author, int) error
	Delete(id int) error
	FindByID(id int) (*author.Author, error)
	FindByName(name string) (*author.Author, error)
	FindAll() ([]*author.Author, error)
}

type UseCase struct {
	repository Repository
}

func NewUseCase(repository Repository) *UseCase {
	return &UseCase{repository: repository}
}

func (u *UseCase) Save(a *author.Author) (int, error) {
	id, err := u.repository.Insert(a)
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (u *UseCase) Update(a *author.Author, id int) error {
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

func (u *UseCase) GetByID(id int) (*author.Author, error) {
	a, err := u.repository.FindByID(id)
	if err != nil {
		return a, err
	}

	return a, err
}

func (u *UseCase) GetByName(name string) (*author.Author, error) {
	a, err := u.repository.FindByName(name)
	if err != nil {
		return a, err
	}

	return a, err
}

func (u *UseCase) GetAll() ([]*author.Author, error) {
	authors, err := u.repository.FindAll()

	if err != nil {
		return authors, err
	}

	return authors, err
}
