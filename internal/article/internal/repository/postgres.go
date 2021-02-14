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

const (
	ErrTxCommitedOrRolledBack     = "sql: transaction has already been committed or rolled back"
	ErrTxRollback                 = "transaction_rollback"
	ErrInvalidPreparedDefinition  = "invalid_prepared_statement_definition"
	ErrDuplicatePreparedStatement = "duplicate_prepared_statement"
)

// PostgresRepository Postgres数据库.
type PostgresRepository struct {
	DB *sql.DB
}

// NewRepository 创建一个存储仓库.
func NewRepository(connStr string) *PostgresRepository {
	// 硬编码，默认使用Postgres
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	return &PostgresRepository{DB: db}
}

// Insert 添加数据.
func (r *PostgresRepository) Insert(ctx context.Context, a *article.Article) (int, error) {
	var entityBook entity
	var lastID int

	entityBook.modelToEntity(a)

	bookErr := r.saveBook(ctx, entityBook.Book.String, entityBook.Author.String)
	if bookErr != nil {
		return -1, bookErr
	}
	tx, err := r.DB.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				if e.Code.Name() == ErrTxRollback {
					log.Print(ErrTxRollback)
				}
			} else if errRollback.Error() != ErrTxCommitedOrRolledBack {
				log.Fatal(errRollback)
			}
		}
	}()

	// lib/pq不支持Result.LastInsertId()，通过SQL中RETURNING id处理
	stmt, err := tx.PrepareContext(ctx,
		"INSERT INTO public.articles(book, author, title, section_serial, content) VALUES ($1,$2,$3,$4,$5) RETURNING id;")
	if err != nil {
		if e, ok := err.(*pq.Error); ok {
			switch e.Code.Name() {
			case ErrDuplicatePreparedStatement:
				log.Print(e)
				return lastID, e
			case ErrInvalidPreparedDefinition:
				log.Print(e)
				// 为了防止错误状态下信息泄露，强制设置无效信息，如-1
				return -1, e
			default:
				log.Print(e)
				return -1, e
			}
		} else {
			log.Print(err)
			return -1, err
		}
	}

	defer stmt.Close()

	err = stmt.QueryRowContext(ctx, entityBook.Book.String, entityBook.Author.String, entityBook.Title.String, entityBook.Serial.Float64, entityBook.Article.String).Scan(&lastID)
	if err != nil {
		if e, ok := err.(*pq.Error); ok {
			switch e.Code.Name() {
			case "not_null_violation":
				log.Print(e)
				return -1, e
			case "foreign_key_violation":
				log.Print(e)
				return -1, e
			default:
				log.Print(e.Code.Name())
				return -1, e
			}
		} else {
			log.Print(err)
			return -1, err
		}
	}
	if txCommitErr := tx.Commit(); txCommitErr != nil {
		log.Print(txCommitErr)
		return -1, txCommitErr
	}
	return lastID, err
}

// Update 升级数据.
func (r *PostgresRepository) Update(ctx context.Context, a *article.Article, id int) error {
	var e entity
	e.modelToEntity(a)

	tx, err := r.DB.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				if e.Code.Name() == ErrTxRollback {
					log.Print(ErrTxRollback)
				}
			} else if errRollback.Error() != ErrTxCommitedOrRolledBack {
				log.Fatal(errRollback)
			}
		}
	}()

	stmt, err := tx.PrepareContext(ctx, "UPDATE articles SET book=$1,title=$2, section_serial=$3, content=$4, author=$5 WHERE id=$6;")
	if err != nil {
		if e, ok := err.(*pq.Error); ok {
			switch e.Code.Name() {
			case ErrDuplicatePreparedStatement:
				log.Print(e)
				return e
			case ErrInvalidPreparedDefinition:
				log.Print(e)
				return e
			}
		} else {
			log.Print(err)
			return err
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

	if txCommitErr := tx.Commit(); txCommitErr != nil {
		log.Print(txCommitErr)
		return txCommitErr
	}

	return err
}

// Delete 删除数据.
func (r *PostgresRepository) Delete(ctx context.Context, id int) error {
	tx, err := r.DB.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				if e.Code.Name() == ErrTxRollback {
					log.Print(ErrTxRollback)
				}
			} else if errRollback.Error() != ErrTxCommitedOrRolledBack {
				log.Fatal(errRollback)
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

	if txCommitErr := tx.Commit(); txCommitErr != nil {
		log.Print(txCommitErr)
		return txCommitErr
	}
	return err
}

// FindByID 通过ID寻找数据.
func (r *PostgresRepository) FindByID(ctx context.Context, id int) (*article.Article, error) {
	e := new(entity)

	var a *article.Article

	tx, err := r.DB.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				if e.Code.Name() == ErrTxRollback {
					log.Print(ErrTxRollback)
				}
			} else if errRollback.Error() != ErrTxCommitedOrRolledBack {
				log.Fatal(errRollback)
			}
		}
	}()

	stmt, err := r.DB.PrepareContext(ctx, "SELECT id,book, author, title, section_serial, content FROM articles WHERE id=$1;")
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

	if txCommitErr := tx.Commit(); txCommitErr != nil {
		log.Print(txCommitErr)
		return a, txCommitErr
	}
	return a, err
}

// FindAll 寻找全部数据.
func (r *PostgresRepository) FindAll(ctx context.Context) ([]*article.Article, error) {
	var articles []*article.Article

	const offset = 0

	tx, err := r.DB.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				if e.Code.Name() == ErrTxRollback {
					log.Print(ErrTxRollback)
				}
			} else if errRollback.Error() != ErrTxCommitedOrRolledBack {
				log.Fatal(errRollback)
			}
		}
	}()

	stmt, err := r.DB.PrepareContext(ctx,
		"SELECT id,book, author, title FROM articles ORDER BY author,book,section_serial  LIMIT ALL OFFSET $1")
	if err != nil {
		log.Print(err)
		return articles, err
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

	if txCommitErr := tx.Commit(); txCommitErr != nil {
		log.Print(txCommitErr)
		return articles, txCommitErr
	}

	return articles, err
}

// Search 搜索
func (r *PostgresRepository) Search(ctx context.Context, keyword string) ([]*article.Article, error) {
	var articles []*article.Article

	tx, err := r.DB.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		log.Fatal(err)
	}

	// 无法提交时需要回滚
	defer func() {
		if errRollback := tx.Rollback(); errRollback != nil {
			if e, ok := errRollback.(*pq.Error); ok {
				if e.Code.Name() == ErrTxRollback {
					log.Print(ErrTxRollback)
				}
			} else if errRollback.Error() != ErrTxCommitedOrRolledBack {
				log.Fatal(errRollback)
			}
		}
	}()

	stmt, err := r.DB.PrepareContext(ctx, "SELECT id,book, author, title FROM articles WHERE articles.content &@ $1")
	if err != nil {
		log.Print(err)
		return articles, err
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

	if txCommitErr := tx.Commit(); txCommitErr != nil {
		log.Print(txCommitErr)
		return articles, txCommitErr
	}
	return articles, err
}

func (r *PostgresRepository) saveBook(ctx context.Context, book string, author string) error {
	tx, txErr := r.DB.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if txErr != nil {
		log.Fatal(txErr)
	}

	// 创建Book
	bookStmt, bookStmtErr := tx.PrepareContext(ctx, "INSERT INTO public.books( author, title ) VALUES ($1,$2);")
	if bookStmtErr != nil {
		if e, ok := bookStmtErr.(*pq.Error); ok {
			switch e.Code.Name() {
			case ErrDuplicatePreparedStatement:
				log.Print(e)
				return e
			case ErrInvalidPreparedDefinition:
				log.Print(e)
				// 为了防止错误状态下信息泄露，强制设置无效信息，如-1
				return e
			default:
				log.Print(e.Code.Name())
				log.Print(e)
				return e
			}
		} else {
			log.Print(bookStmtErr)
			return bookStmtErr
		}
	}
	defer bookStmt.Close()

	_, resultErr := bookStmt.ExecContext(ctx, author, book)
	if resultErr != nil {
		if e, ok := bookStmtErr.(*pq.Error); ok {
			switch e.Code.Name() {
			case "unique":
				return e
			case "u":
				return e
			default:
				log.Print(e.Code.Name())
				return e
			}
		}
		log.Print(resultErr)
		return resultErr
	}

	// 事物提交
	if txCommitErr := tx.Commit(); txCommitErr != nil {
		log.Print(txCommitErr)
		return txCommitErr
	}
	return nil
}
