// Package repository 存储仓库
package repository

import (
	"context"
	"database/sql"
	"reflect"
	"testing"

	_ "github.com/lib/pq"
	"github.com/zrecovery/library/internal/article/pkg/article"
)

func TestPostgresRepository_Search(t *testing.T) {
	type fields struct {
		db *sql.DB
	}
	type args struct {
		ctx     context.Context
		keyword string
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    []*article.Article
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			r := &PostgresRepository{
				db: testcase.fields.db,
			}
			got, err := r.Search(testcase.args.ctx, testcase.args.keyword)
			if (err != nil) != testcase.wantErr {
				t.Errorf("PostgresRepository.Search() error = %v, wantErr %v", err, testcase.wantErr)
				return
			}
			if !reflect.DeepEqual(got, testcase.want) {
				t.Errorf("PostgresRepository.Search() = %v, want %v", got, testcase.want)
			}
		})
	}
}
