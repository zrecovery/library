# Library
个人图书文章管理

# 运行依赖
## 数据库

PostgreSQL 13

理论上PostgreSQL官方仍在维护的各版本亦可运行，其他数据库如MySQL等目前均未适配。

# 运行前准备
## 配置数据库
```
psql -U postgres -f scripts/init.sql
```
命令中的postgres为数据库用户名，按实际情况替换。

# 构建
本项目构建工具可以使用Berkeley make或GNU make。
## 编译
```
make build
```
或
```
go mod download
go build cmd/library/*.go
```
## 编译并运行
```
make run
```
或
```
go mod download
go run cmd/library/*.go
```

# 开发依赖
## 工具依赖
### Golang
Go版本大于1.15
### C编译器
Clang或GNU Compiler Collection(GCC)，任选其一。
### 构建工具
Berkeley make(bsdmake)或GNU make(gmake)，任选其一。

## 外部包依赖
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
