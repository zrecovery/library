package article

import (
	"encoding/json"

	"github.com/zrecovery/library/pkg/article/repository"
	"github.com/zrecovery/library/pkg/nulltype"
)

type Article struct {
	ID      int64   `json:"id,omitempty"`
	Author  string  `json:"author,omitempty"`
	Book    string  `json:"book,omitempty"`
	Title   string  `json:"title,omitempty"`
	Article string  `json:"article,omitempty"`
	Serial  float64 `json:"serial,omitempty"`
}

func (a Article) Entity() repository.Entity {
	return repository.Entity{
		ID:      nulltype.ToNullInt64(a.ID),
		Author:  nulltype.ToNullString(a.Author),
		Book:    nulltype.ToNullString(a.Book),
		Title:   nulltype.ToNullString(a.Title),
		Article: nulltype.ToNullString(a.Article),
		Serial:  nulltype.ToNullFloat64(a.Serial),
	}
}

func (a Article) JSON() string {
	jsons, err := json.Marshal(a)
	if err != nil {
		panic(err)
	}
	return string(jsons)

}

func EntityToArticle(a repository.Entity) Article {
	return Article{
		ID:      nulltype.NullToInt64(a.ID),
		Author:  nulltype.NullToString(a.Author),
		Book:    nulltype.NullToString(a.Book),
		Title:   nulltype.NullToString(a.Title),
		Article: nulltype.NullToString(a.Article),
		Serial:  nulltype.NullToFloat64(a.Serial),
	}
}
