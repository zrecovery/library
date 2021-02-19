// Package repository 数据库测试
package repository

// 考虑到实际SQL语句执行，该测试不采用sqlmock而实际依赖真实PostgreSQL

import (
	"context"
	"database/sql"
	"log"
	"os"
	"testing"

	_ "github.com/lib/pq"
	"github.com/zrecovery/library/internal/article/pkg/article"
)

// 测试数据库
var field struct {
	DB *sql.DB
}

func TestMain(m *testing.M) {
	db, err := sql.Open("postgres", "postgres://postgres:postgresd@localhost/library_test?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
	field.DB = db
	r := m.Run()
	field.DB.Close()
	os.Exit(r)
}

func TestPostgresRepository_saveBook(t *testing.T) {
	// 避免在单元测试中运行
	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	type args struct {
		ctx    context.Context
		book   string
		author string
	}
	tests := []struct {
		name    string
		db      *sql.DB
		args    args
		wantErr bool
	}{
		{
			name: "文章模块中保存书籍",
			db:   field.DB,
			args: args{
				ctx:    context.Background(),
				book:   "test book",
				author: "test author",
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := &PostgresRepository{
				DB: tt.db,
			}
			if err := r.saveBook(tt.args.ctx, tt.args.book, tt.args.author); (err != nil) != tt.wantErr {
				t.Errorf("PostgresRepository.saveBook() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestPostgresRepository_Insert(t *testing.T) {
	// 避免在单元测试中运行
	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	type args struct {
		ctx context.Context
		a   *article.Article
	}
	tests := []struct {
		name    string
		db      *sql.DB
		args    args
		want    int
		wantErr bool
	}{
		{
			name: "已在Book表中有记录的合法插入",
			db:   field.DB,
			args: args{
				ctx: context.Background(),
				a:   &article.Article{},
			},
			want:    1,
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := &PostgresRepository{
				DB: tt.db,
			}
			got, err := r.Insert(tt.args.ctx, tt.args.a)
			if (err != nil) != tt.wantErr {
				t.Errorf("PostgresRepository.Insert() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got < tt.want {
				t.Errorf("PostgresRepository.Insert() = %v, want %v", got, tt.want)
			}
		})
	}
}
