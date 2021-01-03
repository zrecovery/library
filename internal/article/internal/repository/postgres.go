// Package repository 存储仓库
package repository

import (
	"context"
	"database/sql"
	"log"

	// PostgreSQL driver.
	_ "github.com/lib/pq"
	"github.com/zrecovery/library/internal/article/pkg/article"
	errRow "github.com/zrecovery/library/pkg/error"
)

// PostgresRepository Postgres数据库.
type PostgresRepository struct {
	db *sql.DB
}

// NewRepository 创建一个存储仓库.
func NewRepository(connStr string) *PostgresRepository {
	// 硬编码，默认使用Postgres
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	return &PostgresRepository{db: db}
}

// Insert 添加数据.
func (r *PostgresRepository) Insert(ctx context.Context, a *article.Article) (int, error) {
	var e entity
	var lastID int

	e.modelToEntity(a)

	// lib/pq不支持Result.LastInsertId()，通过SQL中RETURNING id处理
	stmt, err := r.db.PrepareContext(ctx,
		"INSERT INTO public.articles(book, title, section_serial, content) VALUES ($1,$2,$3,$4) RETURNING id;")
	if err != nil {
		log.Print(err)
		return lastID, err
	}
	defer stmt.Close()

	err = stmt.QueryRowContext(ctx, e.Book.String, e.Title.String, e.Serial.Float64, e.Article.String).Scan(&lastID)

	return lastID, err
}

// Update 升级数据.
func (r *PostgresRepository) Update(ctx context.Context, a *article.Article, id int) error {
	var e entity

	e.modelToEntity(a)

	stmt, err := r.db.PrepareContext(ctx, "UPDATE articles SET book=$1,title=$2, section_serial=$3, content=$4 WHERE id=$5;")
	if err != nil {
		log.Print(err)
		return err
	}
	defer stmt.Close()
	res, err := stmt.ExecContext(ctx, e.Book.String, e.Title.String, e.Serial.Float64, e.Article.String, e.ID.Int64)

	if err != nil {
		log.Print(err)
		return err
	}

	num, err := res.RowsAffected()
	if err != nil {
		log.Print(err)
		return err
	}

	if num != 1 {
		return errRow.ErrRowsNumberNotOne
	}

	return err
}

// Delete 删除数据.
func (r *PostgresRepository) Delete(ctx context.Context, id int) error {
	// Don't delete in articles_view
	stmt, err := r.db.PrepareContext(ctx, "DELETE FROM articles WHERE id=$1;")
	if err != nil {
		log.Print(err)
		return err
	}
	defer stmt.Close()
	res, err := stmt.ExecContext(ctx, id)

	if err != nil {
		log.Print(err)
		return err
	}

	num, err := res.RowsAffected()
	if err != nil {
		log.Print(err)
		return err
	}

	if num != 1 {
		log.Print(errRow.ErrRowsNumberNotOne)
		return errRow.ErrRowsNumberNotOne
	}

	return err
}

// FindByID 通过ID寻找数据.
func (r *PostgresRepository) FindByID(ctx context.Context, id int) (*article.Article, error) {
	e := new(entity)

	var a *article.Article

	stmt, err := r.db.PrepareContext(ctx, "SELECT id,book, author, title, section_serial, content FROM articles_view WHERE id=$1;")
	if err != nil {
		log.Print(err)
		return a, err
	}
	defer stmt.Close()
	err = stmt.QueryRowContext(ctx, id).Scan(&e.ID, &e.Book, &e.Author, &e.Title, &e.Serial, &e.Article)

	if err != nil {
		log.Println(err)
		return a, err
	}

	a = e.entityToArticle()

	return a, err
}

// FindAll 寻找全部数据.
func (r *PostgresRepository) FindAll(ctx context.Context) ([]*article.Article, error) {
	var articles []*article.Article

	const offset = 0
	stmt, err := r.db.PrepareContext(ctx, "SELECT id,book, author, title FROM articles_view LIMIT ALL OFFSET $1")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	rows, err := stmt.QueryContext(ctx, offset)

	if err != nil {
		return articles, err
	}

	if rows.Err() != nil {
		return articles, err
	}

	for rows.Next() {
		var e entity
		if rowsErr := rows.Scan(&e.ID, &e.Book, &e.Author, &e.Title); err != nil {
			return articles, rowsErr
		}

		articles = append(articles, e.entityToArticle())
	}

	return articles, err
}

// Search 搜索
func (r *PostgresRepository) Search(ctx context.Context, keyword string) ([]*article.Article, error) {
	var articles []*article.Article

	stmt, err := r.db.PrepareContext(ctx, "SELECT id,book, author, title FROM articles_view WHERE articles_view.article &@ $1")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	rows, err := stmt.QueryContext(ctx, keyword)

	if err != nil {
		return articles, err
	}

	if rows.Err() != nil {
		return articles, err
	}

	for rows.Next() {
		var e entity
		if rowsErr := rows.Scan(&e.ID, &e.Book, &e.Author, &e.Title); err != nil {
			return articles, rowsErr
		}

		articles = append(articles, e.entityToArticle())
	}

	return articles, err
}
