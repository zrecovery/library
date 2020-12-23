package repository

import (
	"database/sql"

	"github.com/zrecovery/library/internal/book/pkg/book"
	"github.com/zrecovery/library/pkg/nulltype"
)

type Entity struct {
	ID      sql.NullInt64
	Author  sql.NullString
	Book    sql.NullString
	Title   sql.NullString
	Article sql.NullString
	Serial  sql.NullFloat64
}

func (e *Entity) ModelToEntity(b *book.Book) {
	e.ID = nulltype.ToNullInt64(b.ID)
	e.Author = nulltype.ToNullString(b.Author)
	e.Title = nulltype.ToNullString(b.Title)
}
func (e *Entity) EntityToBook() *book.Book {
	return &book.Book{
		ID:     nulltype.NullToInt64(e.ID),
		Author: nulltype.NullToString(e.Author),
		Title:  nulltype.NullToString(e.Title),
	}
}
