// Package repository 存储仓库
package repository

import (
	"database/sql"

	"github.com/zrecovery/library/internal/author/pkg/author"
	"github.com/zrecovery/library/pkg/nulltype"
)

type entity struct {
	ID   sql.NullInt64
	Name sql.NullString
}

func (e *entity) modelToEntity(a *author.Author) {
	e.ID = nulltype.ToNullInt64(a.ID)
	e.Name = nulltype.ToNullString(a.Name)
}

func (e *entity) entityToAuthor() *author.Author {
	return &author.Author{
		ID:   nulltype.NullToInt64(e.ID),
		Name: nulltype.NullToString(e.Name),
	}
}
