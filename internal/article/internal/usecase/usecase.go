// Package usecase 业务逻辑
package usecase

import (
	"context"
	"log"

	"github.com/zrecovery/library/internal/article/pkg/article"
)

// Repository 存储仓库.
type Repository interface {
	Insert(context.Context, *article.Article) (int, error)
	Update(context.Context, *article.Article, int) error
	Delete(ctx context.Context, id int) error
	FindByID(ctx context.Context, id int) (*article.Article, error)
	FindAll(context.Context) ([]*article.Article, error)
	Search(context.Context, string) ([]*article.Article, error)
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
func (u *UseCase) Save(ctx context.Context, a *article.Article) (int, error) {
	id, err := u.repository.Insert(ctx, a)
	if err != nil {
		log.Print(err)
		return -1, err
	}

	return id, nil
}

// Update 升级.
func (u *UseCase) Update(ctx context.Context, a *article.Article, id int) error {
	err := u.repository.Update(ctx, a, id)
	if err != nil {
		log.Print(err)
		return err
	}

	return err
}

// Delete 删除.
func (u *UseCase) Delete(ctx context.Context, id int) error {
	err := u.repository.Delete(ctx, id)
	if err != nil {
		log.Print(err)
		return err
	}

	return err
}

// GetByID 通过ID获取数据.
func (u *UseCase) GetByID(ctx context.Context, id int) (*article.Article, error) {
	a, err := u.repository.FindByID(ctx, id)
	if err != nil {
		log.Print(err)
		return a, err
	}

	return a, err
}

// GetAll 获取全部数据.
func (u *UseCase) GetAll(ctx context.Context) ([]*article.Article, error) {
	articles, err := u.repository.FindAll(ctx)

	if err != nil {
		log.Print(err)
		return articles, err
	}

	return articles, err
}

// Search 搜索文章数据.
func (u *UseCase) Search(ctx context.Context, keyword string) ([]*article.Article, error) {
	articles, err := u.repository.Search(ctx, keyword)

	if err != nil {
		log.Print(err)
		return articles, err
	}

	return articles, err
}
