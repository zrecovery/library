package author

import (
	"encoding/json"
)

type Author struct {
	ID   int64  `json:"id" `
	Name string `json:"name" validate:"required"`
}

func (a Author) JSON() string {
	jsons, err := json.Marshal(a)
	if err != nil {
		panic(err)
	}
	return string(jsons)
}
