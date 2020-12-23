package book

import (
	"encoding/json"
)

type Book struct {
	ID     int64  `json:"id,omitempty"`
	Author string `json:"author" validate:"required"`
	Title  string `json:"title" validate:"required"`
}

func (b Book) JSON() string {
	jsons, err := json.Marshal(b)
	if err != nil {
		panic(err)
	}
	return string(jsons)
}
