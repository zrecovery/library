// Package book 书籍模块
package book

// ArticleDeclaration 文章基本信息.
type ArticleDeclaration struct {
	ID    int64  `json:"id,omitempty"`
	Title string `json:"title,omitempty"`
	// Serial 章节顺序序号
	Serial float64 `json:"serial,omitempty"`
}

// Book 书籍.
type Book struct {
	ID       int64                `json:"id,omitempty"`
	Author   string               `json:"author" validate:"required"`
	Title    string               `json:"title" validate:"required"`
	Articles []ArticleDeclaration `json:"articles,omitempty"`
}
