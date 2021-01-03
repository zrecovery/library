// Package article 文章模块.
package article

// Article 文章模型.
type Article struct {
	ID      int64  `json:"id,omitempty"`
	Author  string `json:"author"`
	Book    string `json:"book"`
	Title   string `json:"title"`
	Content string `json:"content"`
	// Serial章节排序序号.
	Serial float64 `json:"serial"`
}
