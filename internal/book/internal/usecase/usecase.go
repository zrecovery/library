// Package usecase Book模块业务逻辑
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

// NewUseCase 新建Book业务逻辑模块.
func NewUseCase(repository Repository) *UseCase {
	return &UseCase{repository: repository}
}

// Save 新建数据.
func (u *UseCase) Create(b *book.Book) (int, error) {
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

// Delete 通过ID删除指定book.
func (u *UseCase) Delete(id int) error {
	err := u.repository.Delete(id)
	if err != nil {
		return err
	}

	return err
}

// GetByID 通过ID获取book数据.
func (u *UseCase) GetByID(id int) (*book.Book, error) {
	b, err := u.repository.FindByID(id)
	if err != nil {
		return b, err
	}

	return b, err
}

// GetByAuthor 通过作者获取book数据.
func (u *UseCase) GetByAuthor(author string) ([]*book.Book, error) {
	books, err := u.repository.FindByAuthor(author)
	if err != nil {
		return books, err
	}

	return books, err
}

// GetAll 获取全部book数据，提供书籍目录，不需要详细书籍章节信息.
func (u *UseCase) GetAll() ([]*book.Book, error) {
	books, err := u.repository.FindAll()
	if err != nil {
		return books, err
	}

	return books, err
}

// Search 搜索包含关键词内容文章的所有书籍.
func (u *UseCase) Search(keyword string) ([]*book.Book, error) {
	books, err := u.repository.Search(keyword)

	if err != nil {
		log.Print(err)
		return books, err
	}

	return books, err
}
