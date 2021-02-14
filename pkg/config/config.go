// Package config 提供设置服务.
package config

import (
	"encoding/json"
	// Note: ioutil将与Go1.16废弃
	"io/ioutil"
)

// Config 总设置.
type Config struct {
	// 数据库连接地址，例如"postgres://postgres:mysecretpassword@10.0.0.47/library?sslmode=disable"
	DataURI string `json:"data_uri"`
	// APP监听端口
	Port int `json:"port"`
	// 监听IP
	Host string `json:"host"`
}

// NewSerivice 创建设置服务
func NewSerivice(path string) (*Config, error) {
	c := new(Config)

	if path == "" {
		c.DataURI = "postgres://postgres:postgres@localhost/library?sslmode=disable"
		c.Port = 1323
		c.Host = "127.0.0.1"
		return c, nil
	}
	// Note: ioutil将与Go1.16废弃
	fileData, err := ioutil.ReadFile(path)
	if err != nil {
		return c, err
	}

	err = json.Unmarshal(fileData, c)

	if err != nil {
		return c, nil
	}
	return c, nil
}
