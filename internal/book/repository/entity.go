package repository

import "database/sql"

type Entity struct {
	ID      sql.NullInt64
	Author  sql.NullString
	Book    sql.NullString
	Title   sql.NullString
	Article sql.NullString
	Serial  sql.NullFloat64
}
