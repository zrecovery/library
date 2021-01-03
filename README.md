# Library
个人电子图书文章管理后端

# 背景
目前收集了一些电子文章，这些文章需要按系列以及作者整理，并且要方便在局域网中观看。

# 安装
## 数据库
需要PostgreSQL 13

理论上PostgreSQL官方仍在维护的各版本亦可运行，其他数据库如MySQL等目前均未适配。

### 配置数据库
```
psql -U postgres -f scripts/init.sql
```
命令中的postgres为数据库用户名，按实际情况替换。

## 构建前准备
本项目未提供二进制包，需自行编译。

本项目构建工具可以使用Berkeley make或GNU make。

修改数据库连接地址需要在config/config.json文件中修改data_uri变量

## 编译
```
make build
```
或
```
go mod download
go build cmd/library/*.go
```
# 使用说明
```
make run
```
或
```
go mod download
go run cmd/library/*.go
```

# 使用依赖
```
// 框架
github.com/labstack/echo/v4
// Postgres数据库驱动
github.com/lib/pq
// 数据校验
github.com/go-playground/validator/v10
````
## 测试依赖
```
github.com/stretchr/testify
github.com/golang/mock
```

# 许可证
BSD 2-Clause License
