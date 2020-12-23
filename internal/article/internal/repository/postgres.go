package repository

import (
	"database/sql"
	"errors"
	"log"

	// PostgreSQL driver
	_ "github.com/lib/pq"
	"github.com/zrecovery/library/internal/article/pkg/article"
)

type PostgresRepository struct {
	db *sql.DB
}

func NewRepository(connStr string) *PostgresRepository {
	// 硬编码，默认使用Postgres
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) Insert(a *article.Article) (int, error) {
	var entity Entity
	entity.ModelToEntity(a)
	// lib/pq不支持Result.LastInsertId()，通过SQL中RETURNING id处理
	stmt, err := r.db.Prepare("INSERT INTO public.articles(book, title, serial_sections, article) VALUES ($1,$2,$3,$4) RETURNING id;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()

	var lastID int
	err = stmt.QueryRow(entity.Book.String, entity.Title.String, entity.Serial.Float64, entity.Article.String).Scan(&lastID)
	return lastID, err
}

func (r *PostgresRepository) Update(a *article.Article, id int) error {
	var e Entity
	e.ModelToEntity(a)

	stmt, err := r.db.Prepare("UPDATE articles SET book=$1,title=$2, serial_sections=$3, article=$4 WHERE id=$5;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	res, err := stmt.Exec(e.Book.String, e.Title.String, e.Serial.Float64, e.Article.String, e.ID.Int64)
	if err != nil {
		return err
	}
	num, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if num != 1 {
		return errors.New("the number of rows affected is not 1")
	}
	return err
}

func (r *PostgresRepository) Delete(id int) error {
	// Don't delete in articles_view
	stmt, err := r.db.Prepare("DELETE FROM articles WHERE id=$1;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	res, err := stmt.Exec(id)
	if err != nil {
		return err
	}
	num, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if num != 1 {
		return errors.New("the number of rows affected is not 1")
	}
	return err
}

func (r *PostgresRepository) FindByID(id int) (*article.Article, error) {
	var e *Entity
	var a *article.Article
	stmt, err := r.db.Prepare("SELECT id,book, author, title, serial_sections, article FROM articles_view WHERE id=$1;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	err = stmt.QueryRow(id).Scan(e.ID, e.Book, e.Author, e.Title, e.Serial, e.Article)
	if err != nil {
		return a, err
	}
	a = e.EntityToArticle()
	return a, err
}

func (r *PostgresRepository) FindAll() ([]*article.Article, error) {
	var articles []*article.Article
	stmt, err := r.db.Prepare("SELECT id,book, author, title FROM articles_view")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	rows, err := stmt.Query()
	if err != nil {
		return articles, err
	}
	if rows.Err() != nil {
		return articles, err
	}

	for rows.Next() {
		var e Entity
		if rowsErr := rows.Scan(&e.ID, &e.Book, &e.Author, &e.Title); err != nil {
			return articles, rowsErr
		}
		articles = append(articles, e.EntityToArticle())
	}
	return articles, err
}
