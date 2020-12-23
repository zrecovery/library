package article

import (
	"encoding/json"
)

type Article struct {
	ID      int64  `json:"id,omitempty"`
	Author  string `json:"author"`
	Book    string `json:"book"`
	Title   string `json:"title"`
	Article string `json:"article"`
	// Serial章节排序序号
	Serial float64 `json:"serial"`
}

func (a *Article) JSON() string {
	jsons, err := json.Marshal(a)
	if err != nil {
		panic(err)
	}
	return string(jsons)
}
