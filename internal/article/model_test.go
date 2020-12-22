package article

import (
	"database/sql"
	"reflect"
	"testing"

	"github.com/zrecovery/library/internal/article/repository"
)

func TestArticle_Entity(t *testing.T) {
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
		want   repository.Entity
	}{
		{
			name: "生成用于数据库的模型",
			fields: fields{
				ID:      1,
				Author:  "test model's author",
				Book:    "test model's book",
				Title:   "test model's title",
				Article: "test model's article",
				Serial:  1.0,
			},
			want: repository.Entity{
				ID:      sql.NullInt64{Int64: 1, Valid: true},
				Author:  sql.NullString{String: "test model's author", Valid: true},
				Book:    sql.NullString{String: "test model's book", Valid: true},
				Title:   sql.NullString{String: "test model's title", Valid: true},
				Article: sql.NullString{String: "test model's article", Valid: true},
				Serial:  sql.NullFloat64{Float64: 1.0, Valid: true},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			a := Article{
				ID:      tt.fields.ID,
				Author:  tt.fields.Author,
				Book:    tt.fields.Book,
				Title:   tt.fields.Title,
				Article: tt.fields.Article,
				Serial:  tt.fields.Serial,
			}
			if got := a.Entity(); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("Article.Entity() = %v, want %v", got, tt.want)
			}
		})
	}
}

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
		t.Run(tt.name, func(t *testing.T) {
			a := Article{
				ID:      tt.fields.ID,
				Author:  tt.fields.Author,
				Book:    tt.fields.Book,
				Title:   tt.fields.Title,
				Article: tt.fields.Article,
				Serial:  tt.fields.Serial,
			}
			if got := a.JSON(); got != tt.want {
				t.Errorf("Article.JSON() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestEntityToArticle(t *testing.T) {
	type args struct {
		a repository.Entity
	}
	tests := []struct {
		name string
		args args
		want Article
	}{
		{
			name: "生成业务模型",
			args: args{
				repository.Entity{
					ID:      sql.NullInt64{Int64: 1, Valid: true},
					Author:  sql.NullString{String: "test model's author", Valid: true},
					Book:    sql.NullString{String: "test model's book", Valid: true},
					Title:   sql.NullString{String: "test model's title", Valid: true},
					Article: sql.NullString{String: "test model's article", Valid: true},
					Serial:  sql.NullFloat64{Float64: 1.0, Valid: true},
				},
			},
			want: Article{
				ID:      1,
				Author:  "test model's author",
				Book:    "test model's book",
				Title:   "test model's title",
				Article: "test model's article",
				Serial:  1.0,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := EntityToArticle(tt.args.a); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("EntityToArticle() = %v, want %v", got, tt.want)
			}
		})
	}
}
