package nulltype

import "database/sql"

func ToNullString(str string) sql.NullString {
	return sql.NullString{String: str, Valid: true}
}

func ToNullInt64(i int64) sql.NullInt64 {
	return sql.NullInt64{Int64: i, Valid: true}
}

func ToNullFloat64(f float64) sql.NullFloat64 {
	return sql.NullFloat64{Float64: f, Valid: true}
}

func NullToString(nullStr sql.NullString) string {
	if !nullStr.Valid {
		return ""
	}
	return nullStr.String
}

func NullToInt64(nullInt64 sql.NullInt64) int64 {
	if !nullInt64.Valid {
		return 0
	}
	return nullInt64.Int64
}

func NullToFloat64(nullFloat64 sql.NullFloat64) float64 {
	if !nullFloat64.Valid {
		return 0
	}
	return nullFloat64.Float64
}
