// Package repository 数据库测试
package repository

// 考虑到实际SQL语句执行，该测试不采用sqlmock而实际依赖真实PostgreSQL

import (
	"context"
	"database/sql"
	"log"
	"testing"

	_ "github.com/lib/pq"
	"github.com/zrecovery/library/internal/article/pkg/article"
)

//
func newTestPostgresql() *sql.DB {
	db, err := sql.Open("postgres", "postgres://postgres:postgresd@localhost/library_test?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
	return db
}

//
func TestPostgresRepository_saveBook(t *testing.T) {
	type fields struct {
		DB *sql.DB
	}
	type args struct {
		ctx    context.Context
		book   string
		author string
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := &PostgresRepository{
				DB: tt.fields.DB,
			}
			if err := r.saveBook(tt.args.ctx, tt.args.book, tt.args.author); (err != nil) != tt.wantErr {
				t.Errorf("PostgresRepository.saveBook() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestPostgresRepository_Insert(t *testing.T) {
	type fields struct {
		DB *sql.DB
	}
	type args struct {
		ctx context.Context
		a   *article.Article
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    int
		wantErr bool
	}{
		{
			name: "已在Book表中有记录的合法插入",
			fields: fields{
				DB: newTestPostgresql(),
			},
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
				DB: tt.fields.DB,
			}
			got, err := r.Insert(tt.args.ctx, tt.args.a)
			if (err != nil) != tt.wantErr {
				t.Errorf("PostgresRepository.Insert() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("PostgresRepository.Insert() = %v, want %v", got, tt.want)
			}
		})
	}
}
