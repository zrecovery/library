package repository

import "database/sql"

type Entity struct {
	ID   sql.NullInt64
	Name sql.NullString
}
