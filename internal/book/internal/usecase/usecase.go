// Package usecase 业务逻辑
package usecase

import (
	"log"

	"github.com/zrecovery/library/internal/book/pkg/book"
)

// Repository 存储仓库.
type Repository interface {
	Save(*book.Book) (int, error)
	Update(*book.Book, int) error
	Delete(id int) error
	FindByID(id int) (*book.Book, error)
	FindByAuthor(author string) ([]*book.Book, error)
	FindAll() ([]*book.Book, error)
	Search(string) ([]*book.Book, error)
}

// UseCase 业务逻辑.
type UseCase struct {
	repository Repository
}

// NewUseCase 新建业务逻辑模块.
func NewUseCase(repository Repository) *UseCase {
	return &UseCase{repository: repository}
}

// Save 保存.
func (u *UseCase) Save(b *book.Book) (int, error) {
	id, err := u.repository.Save(b)
	if err != nil {
		return 0, err
	}

	return id, nil
}

// Update 升级.
func (u *UseCase) Update(b *book.Book, id int) error {
	err := u.repository.Update(b, id)
	if err != nil {
		return err
	}

	return err
}

// Delete 删除.
func (u *UseCase) Delete(id int) error {
	err := u.repository.Delete(id)
	if err != nil {
		return err
	}

	return err
}

// GetByID 通过ID获取数据.
func (u *UseCase) GetByID(id int) (*book.Book, error) {
	b, err := u.repository.FindByID(id)
	if err != nil {
		return b, err
	}

	return b, err
}

// GetByAuthor 通过作者获取数据.
func (u *UseCase) GetByAuthor(author string) ([]*book.Book, error) {
	books, err := u.repository.FindByAuthor(author)
	if err != nil {
		return books, err
	}

	return books, err
}

// GetAll 获取全部数据.
func (u *UseCase) GetAll() ([]*book.Book, error) {
	books, err := u.repository.FindAll()
	if err != nil {
		return books, err
	}

	return books, err
}

// Search 搜索包含关键词内容的书籍.
func (u *UseCase) Search(keyword string) ([]*book.Book, error) {
	books, err := u.repository.Search(keyword)

	if err != nil {
		log.Print(err)
		return books, err
	}

	return books, err
}
