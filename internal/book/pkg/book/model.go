// Package book 书籍模块
package book

// Book 书籍.
type Book struct {
	ID     int64  `json:"id,omitempty"`
	Author string `json:"author" validate:"required"`
	Title  string `json:"title" validate:"required"`
}
