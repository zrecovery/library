package repository

import (
	"database/sql"
	"errors"
	"log"

	_ "github.com/lib/pq"
)

type pgRepository struct {
	db *sql.DB
}

func NewRepository(d *sql.DB) *pgRepository {
	return &pgRepository{db: d}
}

func (r *pgRepository) Insert(e Entity) (int, error) {
	// lib/pq不支持Result.LastInsertId()，通过SQL中RETURNING id处理
	stmt, err := r.db.Prepare("INSERT INTO public.articles(book, author, title, serial_sections, article) VALUES ($1,$2,$3,$4,$5) RETURNING id;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()

	var lastID int
	err = stmt.QueryRow(e.Book.String, e.Author.String, e.Title.String, e.Serial.Float64, e.Article.String).Scan(&lastID)
	return lastID, err
}

func (r *pgRepository) Update(e Entity, id int) error {
	stmt, err := r.db.Prepare("UPDATE articles SET(book,title, serial_sections, article) VALUES ($1,$2,$3,$4) WHERE id=$5;")
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
		return errors.New("The number of rows affected is not 1")
	}
	return err
}

func (r *pgRepository) Delete(id int) error {
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
		return errors.New("The number of rows affected is not 1")
	}
	return err
}

func (r *pgRepository) FindByID(id int) (Entity, error) {
	var e Entity
	stmt, err := r.db.Prepare("SELECT id,book, author, title, serial_sections, article FROM articles_view WHERE id=$1;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	err = stmt.QueryRow(id).Scan(&e.ID, &e.Book, &e.Author, &e.Title, &e.Serial, &e.Article)
	if err != nil {
		return e, err
	}
	return e, err
}

func (r *pgRepository) FindAll() ([]Entity, error) {
	var entities []Entity
	stmt, err := r.db.Prepare("SELECT id,book, author, title FROM articles_view")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	rows, err := stmt.Query()
	if err != nil {
		return entities, err
	}

	for rows.Next() {
		var e Entity
		if err := rows.Scan(&e.ID, &e.Book, &e.Author, &e.Title); err != nil {
			log.Fatal(err)
		}
		entities = append(entities, e)
	}
	return entities, err
}
