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

func NewRepository(connStr string) *pgRepository {
	// 硬编码，默认使用Postgres
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	return &pgRepository{db: db}
}

func (r *pgRepository) Save(e Entity) (int, error) {
	// 开启事物并预编译进行参数化（查询）处理，在不使用ORM情况下防止SQL注入攻击。
	tx, err := r.db.Begin()
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if errRollback := tx.Rollback(); err != nil {
			log.Fatal(errRollback)
		}
	}()

	stmt, err := tx.Prepare("INSERT INTO public.books(author, title) VALUES ($1,$2) RETURNING id;")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	var lastID int
	err = stmt.QueryRow(e.Author.String, e.Title.String).Scan(&lastID)
	if err != nil {
		log.Print(err)
		return lastID, err
	}

	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return lastID, err
}

func (r *pgRepository) Update(e Entity, id int) error {
	tx, err := r.db.Begin()
	if err != nil {
		log.Fatal(err)
	}

	defer func() {
		if errRollback := tx.Rollback(); err != nil {
			log.Fatal(errRollback)
		}
	}()

	stmt, err := tx.Prepare("UPDATE public.books SET title = $1, author = $2 WHERE id=$3;")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	res, err := stmt.Exec(e.Title.String, e.Author.String, e.ID.Int64)
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
		return errors.New("The number of rows affected is not 1")
	}

	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return err
}

func (r *pgRepository) Delete(id int) error {
	tx, err := r.db.Begin()
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if errRollback := tx.Rollback(); err != nil {
			log.Fatal(errRollback)
		}
	}()

	stmt, err := tx.Prepare("DELETE FROM public.books WHERE id=$1;")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	res, err := stmt.Exec(id)
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
		return errors.New("The number of rows affected is not 1")
	}

	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return err
}

func (r *pgRepository) FindByID(id int) (Entity, error) {
	var e Entity
	tx, err := r.db.Begin()
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if errRollback := tx.Rollback(); err != nil {
			log.Fatal(errRollback)
		}
	}()

	stmt, err := tx.Prepare("SELECT id, author, title FROM public.books WHERE id=$1;")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	err = stmt.QueryRow(id).Scan(&e.ID, &e.Author, &e.Title)
	if err != nil {
		log.Print(err)
		return e, err
	}
	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return e, err
}

func (r *pgRepository) FindByAuthor(author string) ([]Entity, error) {
	var entities []Entity

	tx, err := r.db.Begin()
	if err != nil {
		log.Fatal(err)
	}
	stmt, err := tx.Prepare("SELECT id, author, title FROM public.books WHERE author=$1")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	rows, err := stmt.Query(author)
	if err != nil {
		log.Print(err)
		return entities, err
	}

	for rows.Next() {
		var e Entity
		if err := rows.Scan(&e.ID, &e.Author, &e.Title); err != nil {
			log.Print(err)
			return entities, err
		}
		entities = append(entities, e)
	}

	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return entities, err
}

func (r *pgRepository) FindAll() ([]Entity, error) {
	var entities []Entity

	tx, err := r.db.Begin()
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if errRollback := tx.Rollback(); err != nil {
			log.Fatal(errRollback)
		}
	}()

	stmt, err := tx.Prepare("SELECT id, author, title FROM public.books")
	if err != nil {
		log.Fatal(err)
	}

	defer stmt.Close()
	rows, err := stmt.Query()
	if err != nil {
		log.Print(err)
		return entities, err
	}

	for rows.Next() {
		var e Entity
		if err := rows.Scan(&e.ID, &e.Author, &e.Title); err != nil {
			log.Print(err)
			return entities, err
		}
		entities = append(entities, e)
	}

	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return entities, err
}
