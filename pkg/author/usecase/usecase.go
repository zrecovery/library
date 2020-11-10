package usecase

import (
	"github.com/zrecovery/library/pkg/author"
	"github.com/zrecovery/library/pkg/author/repository"
)

type Repository interface {
	Insert(repository.Entity) (int, error)
	Update(repository.Entity, int) error
	Delete(id int) error
	FindByID(id int) (repository.Entity, error)
	FindByName(name string) (repository.Entity, error)
	FindAll() ([]repository.Entity, error)
}

type useCase struct {
	repository Repository
}

func NewUseCase(repository Repository) *useCase {
	return &useCase{repository: repository}
}

func (u *useCase) Save(e repository.Entity) (int, error) {
	id, err := u.repository.Insert(e)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (u *useCase) Update(e repository.Entity, id int) error {
	err := u.repository.Update(e, id)
	if err != nil {
		return err
	}
	return err
}

func (u *useCase) Delete(id int) error {
	err := u.repository.Delete(id)
	if err != nil {
		return err
	}
	return err
}

func (u *useCase) GetByID(id int) (author.Author, error) {
	entity, err := u.repository.FindByID(id)
	art := author.EntityToAuthor(entity)
	if err != nil {
		return art, err
	}
	return art, err
}

func (u *useCase) GetByName(name string) (author.Author, error) {
	entity, err := u.repository.FindByName(name)
	art := author.EntityToAuthor(entity)
	if err != nil {
		return art, err
	}
	return art, err
}

func (u *useCase) GetAll() ([]author.Author, error) {
	entities, err := u.repository.FindAll()

	var articles []author.Author

	for _, entity := range entities {
		articles = append(articles, author.EntityToAuthor(entity))
	}
	if err != nil {
		return articles, err
	}

	return articles, err
}
