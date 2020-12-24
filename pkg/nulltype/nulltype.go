// Package nulltype 类型转化.
package nulltype

import (
	"database/sql"
)

// ToNullString 转为可空.
func ToNullString(str string) sql.NullString {
	return sql.NullString{String: str, Valid: true}
}

// ToNullInt64 转为可空.
func ToNullInt64(i int64) sql.NullInt64 {
	return sql.NullInt64{Int64: i, Valid: true}
}

// ToNullFloat64 转为可空.
func ToNullFloat64(f float64) sql.NullFloat64 {
	return sql.NullFloat64{Float64: f, Valid: true}
}

// NullToString 转为不可空.
func NullToString(nullStr sql.NullString) string {
	if !nullStr.Valid {
		return ""
	}

	return nullStr.String
}

// NullToInt64 转为不可空.
func NullToInt64(nullInt64 sql.NullInt64) int64 {
	if !nullInt64.Valid {
		return 0
	}

	return nullInt64.Int64
}

// NullToFloat64 转为不可空.
func NullToFloat64(nullFloat64 sql.NullFloat64) float64 {
	if !nullFloat64.Valid {
		return 0
	}

	return nullFloat64.Float64
}
