package author

import (
	"encoding/json"

	"github.com/zrecovery/library/internal/author/repository"
	"github.com/zrecovery/library/pkg/nulltype"
)

type Author struct {
	ID   int64  `json:"id" `
	Name string `json:"name" validate:"required"`
}

func (a Author) Entity() repository.Entity {
	return repository.Entity{
		ID:   nulltype.ToNullInt64(a.ID),
		Name: nulltype.ToNullString(a.Name),
	}
}

func (a Author) JSON() string {
	jsons, err := json.Marshal(a)
	if err != nil {
		panic(err)
	}
	return string(jsons)

}

func EntityToAuthor(a repository.Entity) Author {
	return Author{
		ID:   nulltype.NullToInt64(a.ID),
		Name: nulltype.NullToString(a.Name),
	}
}
