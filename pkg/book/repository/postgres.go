package repository

import (
	"database/sql"
	"errors"

	_ "github.com/lib/pq"
)

type pgRepository struct {
	db *sql.DB
}

func NewRepository(d *sql.DB) *pgRepository {

	return &pgRepository{db: d}
}

func (r *pgRepository) Insert(e Entity) (int, error) {
	stmt, err := r.db.Prepare("INSERT INTO public.books(author, title) VALUES ($1,$2) RETURNING id;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	var lastID int
	err = stmt.QueryRow(e.Author.String, e.Title.String).Scan(&lastID)
	return lastID, err
}

func (r *pgRepository) Update(e Entity, id int) error {
	stmt, err := r.db.Prepare("UPDATE public.books SET(title, author) VALUES ($1,$2) WHERE id=$3;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	res, err := stmt.Exec(e.Title.String, e.Author.String, e.ID.Int64)
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
	// Don't delete in books
	stmt, err := r.db.Prepare("DELETE FROM public.books WHERE id=$1;")
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
	stmt, err := r.db.Prepare("SELECT id, author, title FROM public.books WHERE id=$1;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	err = stmt.QueryRow(id).Scan(&e.ID, &e.Author, &e.Title)
	if err != nil {
		return e, err
	}
	return e, err
}

func (r *pgRepository) FindAll() ([]Entity, error) {
	var entities []Entity
	stmt, err := r.db.Prepare("SELECT id, author, title FROM public.books")
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
		if err := rows.Scan(&e.ID, &e.Author, &e.Title); err != nil {
			return entities, err
		}
		entities = append(entities, e)
	}
	return entities, err
}
