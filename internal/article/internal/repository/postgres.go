// Package repository 存储仓库
package repository

import (
	"context"
	"database/sql"
	"errors"
	"log"

	// PostgreSQL driver.
	"github.com/lib/pq"
	"github.com/zrecovery/library/internal/article/pkg/article"
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
	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				switch e.Code.Name() {
				case "transaction_rollback":
					log.Print("transaction_rollback")
				}
			} else {
				if errRollback.Error() != "sql: transaction has already been committed or rolled back" {
					log.Fatal(errRollback)
				}
			}
		}
	}()

	// lib/pq不支持Result.LastInsertId()，通过SQL中RETURNING id处理
	stmt, err := tx.PrepareContext(ctx,
		"INSERT INTO public.articles(book, author, title, section_serial, content) VALUES ($1,$2,$3,$4,$5) RETURNING id;")
	if err != nil {
		if e, ok := err.(*pq.Error); ok {
			switch e.Code.Name() {
			case "duplicate_prepared_statement":
				log.Print(e)
				return lastID, e
			case "invalid_prepared_statement_definition":
				log.Print(e)
				// 为了防止错误状态下信息泄露，强制设置无效信息，如-1
				return -1, e
			}
		} else {
			log.Fatal(err)
		}
	}

	defer stmt.Close()

	err = stmt.QueryRowContext(ctx, e.Book.String, e.Author.String, e.Title.String, e.Serial.Float64, e.Article.String).Scan(&lastID)
	if err != nil {
		if e, ok := err.(*pq.Error); ok {
			switch e.Code.Name() {
			case "not_null_violation":
				log.Print(e)
				return -1, e
			}
		} else {
			log.Fatal(err)
		}
	}
	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return lastID, err
}

// Update 升级数据.
func (r *PostgresRepository) Update(ctx context.Context, a *article.Article, id int) error {
	var e entity
	e.modelToEntity(a)

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				switch e.Code.Name() {
				case "transaction_rollback":
					log.Print("transaction_rollback")
				}
			} else {
				if errRollback.Error() != "sql: transaction has already been committed or rolled back" {
					log.Fatal(errRollback)
				}
			}
		}
	}()

	stmt, err := tx.PrepareContext(ctx, "UPDATE articles SET book=$1,title=$2, section_serial=$3, content=$4, author=$5 WHERE id=$6;")
	if err != nil {
		if e, ok := err.(*pq.Error); ok {
			switch e.Code.Name() {
			case "duplicate_prepared_statement":
				log.Print(e)
				return e
			case "invalid_prepared_statement_definition":
				log.Print(e)
				return e
			}
		} else {
			log.Fatal(err)
		}
	}
	defer stmt.Close()
	res, err := stmt.ExecContext(ctx, e.Book.String, e.Title.String, e.Serial.Float64, e.Article.String, e.Author.String, e.ID.Int64)

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
		log.Print("expected 1 rows affected")
		return errors.New("expected 1 rows affected")
	}

	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}

	return err
}

// Delete 删除数据.
func (r *PostgresRepository) Delete(ctx context.Context, id int) error {

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				switch e.Code.Name() {
				case "transaction_rollback":
					log.Print("transaction_rollback")
				}
			} else {
				if errRollback.Error() != "sql: transaction has already been committed or rolled back" {
					log.Fatal(errRollback)
				}
			}
		}
	}()

	stmt, err := tx.PrepareContext(ctx, "DELETE FROM articles WHERE id=$1;")
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
		log.Printf("expected 1 rows affected, not %d", num)
		return errors.New("expected 1 rows affected")
	}

	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return err
}

// FindByID 通过ID寻找数据.
func (r *PostgresRepository) FindByID(ctx context.Context, id int) (*article.Article, error) {
	e := new(entity)

	var a *article.Article

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				switch e.Code.Name() {
				case "transaction_rollback":
					log.Print("transaction_rollback")
				}
			} else {
				if errRollback.Error() != "sql: transaction has already been committed or rolled back" {
					log.Fatal(errRollback)
				}
			}
		}
	}()

	stmt, err := r.db.PrepareContext(ctx, "SELECT id,book, author, title, section_serial, content FROM articles WHERE id=$1;")
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

	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return a, err
}

// FindAll 寻找全部数据.
func (r *PostgresRepository) FindAll(ctx context.Context) ([]*article.Article, error) {
	var articles []*article.Article

	const offset = 0

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				switch e.Code.Name() {
				case "transaction_rollback":
					log.Print("transaction_rollback")
				}
			} else {
				if errRollback.Error() != "sql: transaction has already been committed or rolled back" {
					log.Fatal(errRollback)
				}
			}
		}
	}()

	stmt, err := r.db.PrepareContext(ctx, "SELECT id,book, author, title FROM articles ORDER BY author,book,section_serial  LIMIT ALL OFFSET $1")
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

	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}

	return articles, err
}

// Search 搜索
func (r *PostgresRepository) Search(ctx context.Context, keyword string) ([]*article.Article, error) {
	var articles []*article.Article

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				switch e.Code.Name() {
				case "transaction_rollback":
					log.Print("transaction_rollback")
				}
			} else {
				if errRollback.Error() != "sql: transaction has already been committed or rolled back" {
					log.Fatal(errRollback)
				}
			}
		}
	}()

	stmt, err := r.db.PrepareContext(ctx, "SELECT id,book, author, title FROM articles WHERE articles.content &@ $1")
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

	if err := tx.Commit(); err != nil {
		log.Fatal(err)
	}
	return articles, err
}
