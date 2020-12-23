package usecase

import (
	"github.com/zrecovery/library/internal/book/pkg/book"
)

type Repository interface {
	Save(*book.Book) (int, error)
	Update(*book.Book, int) error
	Delete(id int) error
	FindByID(id int) (*book.Book, error)
	FindByAuthor(author string) ([]*book.Book, error)
	FindAll() ([]*book.Book, error)
}

type UseCase struct {
	repository Repository
}

func NewUseCase(repository Repository) *UseCase {
	return &UseCase{repository: repository}
}

func (u *UseCase) Save(b *book.Book) (int, error) {
	id, err := u.repository.Save(b)
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (u *UseCase) Update(b *book.Book, id int) error {
	err := u.repository.Update(b, id)
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

func (u *UseCase) GetByID(id int) (*book.Book, error) {
	b, err := u.repository.FindByID(id)
	if err != nil {
		return b, err
	}

	return b, err
}

func (u *UseCase) GetByAuthor(author string) ([]*book.Book, error) {
	books, err := u.repository.FindByAuthor(author)
	if err != nil {
		return books, err
	}

	return books, err
}

func (u *UseCase) GetAll() ([]*book.Book, error) {
	books, err := u.repository.FindAll()
	if err != nil {
		return books, err
	}

	return books, err
}
