package article

import (
	"testing"

	"github.com/zrecovery/library/internal/article/pkg/article"
)

func TestArticle_JSON(t *testing.T) {
	type fields struct {
		ID      int64
		Author  string
		Book    string
		Title   string
		Article string
		Serial  float64
	}
	tests := []struct {
		name   string
		fields fields
		want   string
	}{
		{
			name: "生成用JSON",
			fields: fields{
				ID:      1,
				Author:  "test model's author",
				Book:    "test model's book",
				Title:   "test model's title",
				Article: "test model's article",
				Serial:  1.0,
			},
			want: `{"id":1,"author":"test model's author","book":"test model's book","title":"test model's title","article":"test model's article","serial":1}`,
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			a := article.Article{
				ID:      testcase.fields.ID,
				Author:  testcase.fields.Author,
				Book:    testcase.fields.Book,
				Title:   testcase.fields.Title,
				Article: testcase.fields.Article,
				Serial:  testcase.fields.Serial,
			}
			if got := a.JSON(); got != testcase.want {
				t.Errorf("Article.JSON() = %v, want %v", got, testcase.want)
			}
		})
	}
}
