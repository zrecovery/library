// Package repository 存储仓库
package repository

import (
	"database/sql"

	"github.com/zrecovery/library/internal/book/pkg/book"
	"github.com/zrecovery/library/pkg/nulltype"
)

type articleDeclarationEntity struct {
	ID     sql.NullInt64
	Title  sql.NullString
	Serial sql.NullFloat64
}

type entity struct {
	ID       sql.NullInt64
	Author   sql.NullString
	Title    sql.NullString
	Articles []articleDeclarationEntity
}

func (e *entity) modelToEntity(b *book.Book) {
	e.ID = nulltype.ToNullInt64(b.ID)
	e.Author = nulltype.ToNullString(b.Author)
	e.Title = nulltype.ToNullString(b.Title)
	for _, value := range b.Articles {
		e.Articles = append(e.Articles, articleDeclarationEntity{
			ID:     nulltype.ToNullInt64(value.ID),
			Title:  nulltype.ToNullString(value.Title),
			Serial: nulltype.ToNullFloat64(value.Serial),
		})
	}
}

func (e *entity) entityToBook() *book.Book {
	b := new(book.Book)
	b.ID = nulltype.NullToInt64(e.ID)
	b.Author = nulltype.NullToString(e.Author)
	b.Title = nulltype.NullToString(e.Title)

	// 不需要index
	for _, value := range e.Articles {
		b.Articles = append(b.Articles, book.ArticleDeclaration{
			ID:     nulltype.NullToInt64(value.ID),
			Title:  nulltype.NullToString(value.Title),
			Serial: nulltype.NullToFloat64(value.Serial),
		})
	}

	return b
}
