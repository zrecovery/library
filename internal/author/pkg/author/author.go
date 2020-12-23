package author

// Author 文章作者，包含ID和作者名字（Name）.
type Author struct {
	ID   int64  `json:"id" `
	Name string `json:"name" validate:"required"`
}
