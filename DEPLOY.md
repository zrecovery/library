# 部署指南

## 环境要求

- Bun >= 1.0

## 部署步骤

### 1. 安装依赖

```bash
make install
```

### 2. 构建发布版本

```bash
make build
```

构建产物输出到 `release/` 目录：

```
release/
├── .env              # 环境变量
├── data/             # SQLite 数据库
├── library           # 后端可执行文件 (单文件)
└── public/           # 前端静态资源
    ├── index.html
    ├── assets/
    └── favicon.ico
```

### 3. 配置环境变量

根据需要编辑 `release/.env` 中的配置。

### 4. 启动服务

```bash
make prod
```

服务将在 http://localhost:3001 启动

数据库文件 `release/data/library.db` 会在首次运行时自动创建。

## 命令

| 命令 | 说明 |
|------|------|
| `make install` | 安装依赖 |
| `make build` | 构建发布版本 |
| `make prod` | 启动服务 |
| `make dev` | 开发模式 |
| `make lint` | 代码检查 |
| `make test` | 运行测试 |
| `make clean` | 清理构建产物 |
