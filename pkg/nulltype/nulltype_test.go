package nulltype

import (
	"database/sql"
	"reflect"
	"testing"
)

func TestToNullString(t *testing.T) {
	type args struct {
		str string
	}
	tests := []struct {
		name string
		args args
		want sql.NullString
	}{
		{
			name: "一般转NullString",
			args: args{
				str: "test string",
			},
			want: sql.NullString{String: "test string", Valid: true},
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			if got := ToNullString(testcase.args.str); !reflect.DeepEqual(got, testcase.want) {
				t.Errorf("ToNullString() = %v, want %v", got, testcase.want)
			}
		})
	}
}

func TestToNullInt64(t *testing.T) {
	type args struct {
		i int64
	}
	tests := []struct {
		name string
		args args
		want sql.NullInt64
	}{
		{
			name: "一般Int转Int64",
			args: args{
				i: 1,
			},
			want: sql.NullInt64{Int64: 1, Valid: true},
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			if got := ToNullInt64(testcase.args.i); !reflect.DeepEqual(got, testcase.want) {
				t.Errorf("ToNullInt64() = %v, want %v", got, testcase.want)
			}
		})
	}
}

func TestToNullFloat64(t *testing.T) {
	type args struct {
		f float64
	}
	tests := []struct {
		name string
		args args
		want sql.NullFloat64
	}{
		{
			name: "一般Float转Float64",
			args: args{
				f: 1.0,
			},
			want: sql.NullFloat64{Float64: 1.0, Valid: true},
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			if got := ToNullFloat64(testcase.args.f); !reflect.DeepEqual(got, testcase.want) {
				t.Errorf("ToNullFloat64() = %v, want %v", got, testcase.want)
			}
		})
	}
}

func TestNullToString(t *testing.T) {
	type args struct {
		nullStr sql.NullString
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "一般NullString转String",
			args: args{
				nullStr: sql.NullString{String: "test null string", Valid: true},
			},
			want: "test null string",
		},
		{
			name: "一般空NullString转String",
			args: args{
				nullStr: sql.NullString{String: "test null string", Valid: false},
			},
			want: "",
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			if got := NullToString(testcase.args.nullStr); got != testcase.want {
				t.Errorf("NullToString() = %v, want %v", got, testcase.want)
			}
		})
	}
}

func TestNullToInt64(t *testing.T) {
	type args struct {
		nullInt64 sql.NullInt64
	}
	tests := []struct {
		name string
		args args
		want int64
	}{
		{
			name: "一般NullInt64转Int64",
			args: args{
				nullInt64: sql.NullInt64{Int64: 1, Valid: true},
			},
			want: 1,
		},
		{
			name: "一般NullInt64转Int64",
			args: args{
				nullInt64: sql.NullInt64{Int64: 1, Valid: false},
			},
			want: 0,
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			if got := NullToInt64(testcase.args.nullInt64); got != testcase.want {
				t.Errorf("NullToInt64() = %v, want %v", got, testcase.want)
			}
		})
	}
}

func TestNullToFloat64(t *testing.T) {
	type args struct {
		nullFloat64 sql.NullFloat64
	}
	tests := []struct {
		name string
		args args
		want float64
	}{
		{
			name: "一般NullFloat64转Float64",
			args: args{
				nullFloat64: sql.NullFloat64{Float64: 1.0, Valid: true},
			},
			want: 1.0,
		},
		{
			name: "一般空NullFloat64转Float64",
			args: args{
				nullFloat64: sql.NullFloat64{Float64: 1.0, Valid: false},
			},
			want: 0,
		},
	}
	for _, tt := range tests {
		testcase := tt
		t.Run(testcase.name, func(t *testing.T) {
			if got := NullToFloat64(testcase.args.nullFloat64); got != testcase.want {
				t.Errorf("NullToFloat64() = %v, want %v", got, testcase.want)
			}
		})
	}
}
