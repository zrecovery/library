package usecase

import (
	"github.com/zrecovery/library/internal/book"
	"github.com/zrecovery/library/internal/book/repository"
)

type Repository interface {
	Save(repository.Entity) (int, error)
	Update(repository.Entity, int) error
	Delete(id int) error
	FindByID(id int) (repository.Entity, error)
	FindByAuthor(author string) ([]repository.Entity, error)
	FindAll() ([]repository.Entity, error)
}

type useCase struct {
	repository Repository
}

func NewUseCase(repository Repository) *useCase {
	return &useCase{repository: repository}
}

func (u *useCase) Save(e repository.Entity) (int, error) {
	id, err := u.repository.Save(e)
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

func (u *useCase) GetByID(id int) (book.Book, error) {
	entity, err := u.repository.FindByID(id)
	art := book.EntityToBook(entity)
	if err != nil {
		return art, err
	}
	return art, err
}

func (u *useCase) GetByAuthor(author string) ([]book.Book, error) {
	entities, err := u.repository.FindByAuthor(author)

	var books []book.Book

	for _, entity := range entities {
		books = append(books, book.EntityToBook(entity))
	}
	if err != nil {
		return books, err
	}

	return books, err
}

func (u *useCase) GetAll() ([]book.Book, error) {
	entities, err := u.repository.FindAll()

	var books []book.Book

	for _, entity := range entities {
		books = append(books, book.EntityToBook(entity))
	}
	if err != nil {
		return books, err
	}

	return books, err
}
