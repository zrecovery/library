// Package config 提供设置服务.
package config_test

import (
	"log"
	"os"
	"reflect"
	"strconv"
	"testing"

	"github.com/zrecovery/library/pkg/config"
)

func TestMain(m *testing.M) {
	const TEST_JSON_DATA = `{
		"data_uri":"postgres://postgres:mysecretpassword@127.0.0.1/library_test?sslmode=disable",
		"port":1323,
		"host":"127.0.0.1"
	}`

	if err := os.Mkdir("./testdata", os.FileMode(0775)); err != nil {
		log.Fatalf("未能创建测试文件夹，原因：%s", err)
	}
	file, err := os.Create("./testdata/config_test.json")
	if err != nil {
		log.Fatal(err)
	}
	num, err := file.Write([]byte(TEST_JSON_DATA))
	if err != nil {
		log.Printf("仅写入%s", strconv.Itoa(num))
		log.Fatalf("未能写入测试文件，原因:%s", err)
	}

	r := m.Run()

	if err := os.Remove("./testdata/config_test.json"); err != nil {
		log.Fatalf("未能删除测试文件，原因：%s", err)
	}
	if err := os.Remove("./testdata"); err != nil {
		log.Fatalf("未能删除测试文件夹，原因：%s", err)
	}

	os.Exit(r)
}

func TestNewSeriviceErr(t *testing.T) {
	type args struct {
		path string
	}
	tests := []struct {
		name    string
		args    args
		want    *config.Config
		wantErr bool
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
			wantErr: false,
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
			wantErr: false,
		},
		{
			name: "错误路径",
			args: args{
				path: "./testdat/config_test.json",
			},
			want:    &config.Config{},
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := config.NewSerivice(tt.args.path)
			if (err != nil) != tt.wantErr {
				t.Errorf("NewSerivice() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("NewSerivice() = %v, want %v", got, tt.want)
			}
		})
	}
}
