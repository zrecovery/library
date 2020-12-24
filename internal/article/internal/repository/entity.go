// Package repository 存储仓库
package repository

import (
	"database/sql"

	"github.com/zrecovery/library/internal/article/pkg/article"
	"github.com/zrecovery/library/pkg/nulltype"
)

type entity struct {
	ID      sql.NullInt64
	Author  sql.NullString
	Book    sql.NullString
	Title   sql.NullString
	Article sql.NullString
	Serial  sql.NullFloat64
}

func (e *entity) modelToEntity(a *article.Article) {
	e.ID = nulltype.ToNullInt64(a.ID)
	e.Author = nulltype.ToNullString(a.Author)
	e.Book = nulltype.ToNullString(a.Book)
	e.Title = nulltype.ToNullString(a.Title)
	e.Article = nulltype.ToNullString(a.Article)
	e.Serial = nulltype.ToNullFloat64(a.Serial)
}

func (e *entity) entityToArticle() *article.Article {
	return &article.Article{
		ID:      nulltype.NullToInt64(e.ID),
		Author:  nulltype.NullToString(e.Author),
		Book:    nulltype.NullToString(e.Book),
		Title:   nulltype.NullToString(e.Title),
		Article: nulltype.NullToString(e.Article),
		Serial:  nulltype.NullToFloat64(e.Serial),
	}
}
