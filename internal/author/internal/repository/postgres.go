package repository

import (
	"database/sql"
	"errors"
	"log"

	// Postgres驱动
	_ "github.com/lib/pq"
	"github.com/zrecovery/library/internal/author/pkg/author"
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

func (r *PostgresRepository) Insert(a *author.Author) (int, error) {
	e := new(Entity)
	e.ModelToEntity(a)

	stmt, err := r.db.Prepare("INSERT INTO public.authors(name) VALUES ($1) RETURNING id;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	var lastID int
	err = stmt.QueryRow(e.Name.String).Scan(&lastID)
	return lastID, err
}

func (r *PostgresRepository) Update(a *author.Author, id int) error {
	e := new(Entity)
	e.ModelToEntity(a)

	stmt, err := r.db.Prepare("UPDATE public.author SET name= $1 WHERE id=$2;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	res, err := stmt.Exec(e.Name.String, e.ID.Int64)
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
	// Don't delete in authors
	stmt, err := r.db.Prepare("DELETE FROM public.authors WHERE id=$1;")
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

func (r *PostgresRepository) FindByID(id int) (*author.Author, error) {
	e := new(Entity)
	a := new(author.Author)
	stmt, err := r.db.Prepare("SELECT id,name FROM public.authors WHERE id=$1;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	err = stmt.QueryRow(id).Scan(e.ID, e.Name)
	if err != nil {
		return a, err
	}
	a = e.EntityToAuthor()
	return a, err
}

func (r *PostgresRepository) FindByName(name string) (*author.Author, error) {
	e := new(Entity)
	a := new(author.Author)

	stmt, err := r.db.Prepare("SELECT id,name FROM public.authors WHERE name=$1;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	err = stmt.QueryRow(name).Scan(&e.ID, &e.Name)
	if err != nil {
		return a, err
	}
	a = e.EntityToAuthor()
	return a, err
}

func (r *PostgresRepository) FindAll() ([]*author.Author, error) {
	var authors []*author.Author
	stmt, err := r.db.Prepare("SELECT id,name FROM public.authors")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	rows, err := stmt.Query()
	if err != nil {
		return authors, err
	}
	if rowsErr := rows.Err(); rowsErr != nil {
		return authors, rowsErr
	}

	for rows.Next() {
		e := new(Entity)
		if err = rows.Scan(&e.ID, &e.Name); err != nil {
			log.Print(err)
		}
		authors = append(authors, e.EntityToAuthor())
	}
	return authors, err
}
