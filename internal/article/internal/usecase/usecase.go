// Package usecase 业务逻辑
package usecase

import (
	"github.com/zrecovery/library/internal/article/pkg/article"
)

// Repository 存储仓库.
type Repository interface {
	Insert(*article.Article) (int, error)
	Update(*article.Article, int) error
	Delete(id int) error
	FindByID(id int) (*article.Article, error)
	FindAll() ([]*article.Article, error)
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
func (u *UseCase) Save(a *article.Article) (int, error) {
	id, err := u.repository.Insert(a)
	if err != nil {
		return 0, err
	}

	return id, nil
}

// Update 升级.
func (u *UseCase) Update(a *article.Article, id int) error {
	err := u.repository.Update(a, id)
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
func (u *UseCase) GetByID(id int) (*article.Article, error) {
	a, err := u.repository.FindByID(id)
	if err != nil {
		return a, err
	}

	return a, err
}

// GetAll 获取全部数据.
func (u *UseCase) GetAll() ([]*article.Article, error) {
	articles, err := u.repository.FindAll()

	if err != nil {
		return articles, err
	}

	return articles, err
}
