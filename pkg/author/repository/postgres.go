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
	stmt, err := r.db.Prepare("INSERT INTO public.authors(name) VALUES ($1) RETURNING id;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	var lastID int
	err = stmt.QueryRow(e.Name.String).Scan(&lastID)
	return lastID, err
}

func (r *pgRepository) Update(e Entity, id int) error {
	stmt, err := r.db.Prepare("UPDATE public.author SET(name) VALUES ($1) WHERE id=$2;")
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
		return errors.New("The number of rows affected is not 1")
	}
	return err
}

func (r *pgRepository) Delete(id int) error {
	// Don't delete in authors
	stmt, err := r.db.Prepare("DELETE FROM public.uthors WHERE id=$1;")
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
	stmt, err := r.db.Prepare("SELECT id,name FROM public.authors WHERE id=$1;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	err = stmt.QueryRow(id).Scan(&e.ID, &e.Name)
	if err != nil {
		return e, err
	}
	return e, err
}

func (r *pgRepository) FindByName(name string) (Entity, error) {
	var e Entity
	stmt, err := r.db.Prepare("SELECT id,name FROM public.authors WHERE name=$1;")
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	err = stmt.QueryRow(name).Scan(&e.ID, &e.Name)
	if err != nil {
		return e, err
	}
	return e, err
}

func (r *pgRepository) FindAll() ([]Entity, error) {
	var entities []Entity
	stmt, err := r.db.Prepare("SELECT id,name FROM public.authors")
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
		if err := rows.Scan(&e.ID, &e.Name); err != nil {
			log.Fatal(err)
		}
		entities = append(entities, e)
	}
	return entities, err
}
