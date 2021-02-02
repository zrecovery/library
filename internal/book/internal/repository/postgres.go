// Package repository 存储仓库
package repository

import (
	"database/sql"
	"errors"
	"log"

	// Postgres驱动.
	_ "github.com/lib/pq"
	"github.com/zrecovery/library/internal/book/pkg/book"
)

// PostgresRepository Postgres存储仓库.
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

// Save 保存.
func (r *PostgresRepository) Save(b *book.Book) (int, error) {
	e := new(entity)
	e.modelToEntity(b)

	var lastID int

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
		log.Print(err)
		return lastID, err
	}
	defer stmt.Close()

	err = stmt.QueryRow(e.Author.String, e.Title.String).Scan(&lastID)
	if err != nil {
		log.Print(err)
		return lastID, err
	}

	if txErr := tx.Commit(); txErr != nil {
		log.Print(txErr)
		return lastID, txErr
	}

	return lastID, err
}

// Update 升级数据.
func (r *PostgresRepository) Update(b *book.Book, id int) error {
	e := new(entity)
	e.modelToEntity(b)

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
		log.Print(err)
		return err
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
		return errors.New("expected 1 rows affected")
	}

	if txErr := tx.Commit(); txErr != nil {
		log.Print(txErr)
		return txErr
	}

	return err
}

// Delete 删除数据.
func (r *PostgresRepository) Delete(id int) error {
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
		log.Print(err)
		return err
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
		return errors.New("expected 1 rows affected")
	}

	if txErr := tx.Commit(); txErr != nil {
		log.Print(txErr)
		return txErr
	}

	return err
}

// FindByID 通过ID寻找数据.
func (r *PostgresRepository) FindByID(id int) (*book.Book, error) {
	b := new(book.Book)

	var e entity

	tx, err := r.db.Begin()
	if err != nil {
		log.Fatal(err)
	}

	defer func() {
		if errRollback := tx.Rollback(); err != nil {
			log.Fatal(errRollback)
		}
	}()

	stmt, err := tx.Prepare("SELECT book_id,book, author, title,article_id,section_serial FROM public.library_view WHERE book_id=$1;")
	if err != nil {
		log.Print(err)
		return b, err
	}
	defer stmt.Close()

	rows, err := stmt.Query(id)
	if err != nil {
		log.Print(err)
		return b, err
	}
	if rows.Err() != nil {
		log.Print(err)
		return b, err
	}

	defer rows.Close()
	for rows.Next() {
		var a articleDeclarationEntity
		if err = rows.Scan(&e.ID, &e.Title, &e.Author, &a.Title, &a.ID, &a.Serial); err != nil {
			log.Print(err)
			return b, err
		}

		e.Articles = append(e.Articles, a)
	}

	if txErr := tx.Commit(); txErr != nil {
		log.Print(txErr)
		return b, txErr
	}

	b = e.entityToBook()

	return b, err
}

// FindByAuthor 通过作者查找.
func (r *PostgresRepository) FindByAuthor(author string) ([]*book.Book, error) {
	var books []*book.Book

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
		return books, err
	}

	if rows.Err() != nil {
		log.Print(err)
		return books, err
	}

	for rows.Next() {
		var e entity
		if err = rows.Scan(&e.ID, &e.Author, &e.Title); err != nil {
			log.Print(err)
			return books, err
		}

		books = append(books, e.entityToBook())
	}

	if err = tx.Commit(); err != nil {
		log.Print(err)
		return books, err
	}

	return books, err
}

// FindAll 寻找全部数据.
func (r *PostgresRepository) FindAll() ([]*book.Book, error) {
	var books []*book.Book

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
		log.Print(err)
		return books, err
	}

	defer stmt.Close()
	rows, err := stmt.Query()

	if err != nil {
		log.Print(err)
		return books, err
	}

	if err = rows.Err(); err != nil {
		log.Print(err)
		return books, err
	}

	for rows.Next() {
		var e entity
		if err = rows.Scan(&e.ID, &e.Author, &e.Title); err != nil {
			log.Print(err)
			return books, err
		}

		books = append(books, e.entityToBook())
	}

	if err = tx.Commit(); err != nil {
		log.Print(err)
		return books, err
	}

	return books, err
}

// Search 通过关键词搜索有关书籍.
func (r *PostgresRepository) Search(keyword string) ([]*book.Book, error) {
	var books []*book.Book

	stmt, err := r.db.Prepare("SELECT DISTINCT book_id,book, author FROM library_view WHERE library_view.content &@ $1 ORDER BY book,author")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	rows, err := stmt.Query(keyword)

	if err != nil {
		return books, err
	}

	if rows.Err() != nil {
		return books, err
	}

	for rows.Next() {
		var e entity
		if rowsErr := rows.Scan(&e.ID, &e.Title, &e.Author); err != nil {
			return books, rowsErr
		}

		books = append(books, e.entityToBook())
	}

	return books, err
}
