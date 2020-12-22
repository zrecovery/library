package book

import (
	"encoding/json"

	"github.com/zrecovery/library/internal/book/repository"
	"github.com/zrecovery/library/pkg/nulltype"
)

type Book struct {
	ID     int64  `json:"id,omitempty"`
	Author string `json:"author" validate:"required"`
	Title  string `json:"title" validate:"required"`
}

func (b Book) Entity() repository.Entity {
	return repository.Entity{
		ID:     nulltype.ToNullInt64(b.ID),
		Author: nulltype.ToNullString(b.Author),
		Title:  nulltype.ToNullString(b.Title),
	}
}

func (b Book) JSON() string {
	jsons, err := json.Marshal(b)
	if err != nil {
		panic(err)
	}
	return string(jsons)

}

func EntityToBook(e repository.Entity) Book {
	return Book{
		ID:     nulltype.NullToInt64(e.ID),
		Author: nulltype.NullToString(e.Author),
		Title:  nulltype.NullToString(e.Title),
	}
}
