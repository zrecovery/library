// Package config 提供设置服务.
package config

import (
	"encoding/json"
	"io/ioutil"
	"log"
)

// Casbin Casbin设置
type Casbin struct {
	Model     string `json:"model,omitempty"`
	DataURI   string `json:"data_uri,omitempty"`
	TableName string `json:"table_name,omitempty"`
}

// Config 总设置.
type Config struct {
	DataURI string `json:"data_uri,omitempty"`
	Port    int    `json:"port,omitempty"`
	Casbin  Casbin `json:"casbin,omitempty"`
}

// NewSerivice 创建设置服务
func NewSerivice(path string) *Config {
	fileData, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	c := new(Config)
	err = json.Unmarshal(fileData, c)

	if err != nil {
		log.Fatal(err)
	}
	return c
}
