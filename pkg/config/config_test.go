// Package config 提供设置服务.
package config_test

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/zrecovery/library/pkg/config"
)

func TestNewSerivice(t *testing.T) {
	type args struct {
		path string
	}
	tests := []struct {
		name string
		args args
		want *config.Config
	}{
		{
			name: "正常输入",
			args: args{
				path: "./testdata/config_test.json",
			},
			want: &config.Config{
				DataURI: "postgres://postgres:mysecretpassword@127.0.0.1/library_test?sslmode=disable",
				Port:    1323,
				Host:    "127.0.0.1",
			},
		},
		{
			name: "未设定路径或路径为空",
			args: args{
				path: "",
			},
			want: &config.Config{
				DataURI: "postgres://postgres:postgres@localhost/library?sslmode=disable",
				Port:    1323,
				Host:    "127.0.0.1",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := config.NewSerivice(tt.args.path)
			if assert.NoError(t, err) {
				assert.Equal(t, got, tt.want)
			}
		})
	}
}

func TestNewSeriviceError(t *testing.T) {
	type args struct {
		path string
	}
	tests := []struct {
		name string
		args args
		want error
	}{
		{
			name: "输入错误路径",
			args: args{
				path: "../../cofig/cofig_test.json",
			},
			want: errors.New(""),
		},
		{
			name: "文件内容不合法",
			args: args{
				path: "../../cofig/cofig_test.json",
			},
			want: errors.New(""),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := config.NewSerivice(tt.args.path)
			assert.ErrorAs(t, err, tt.want)
		})
	}
}
