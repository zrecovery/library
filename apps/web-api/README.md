# core
必要依赖
- PostgreSQL with PGroonga(PGroonga用于g中文全文搜索)

## 开发

### 前期准备
- 配置好环境变量
```
    # .env.test 用于测试
    #.env 用于开发
    # 数据库
    DATABASE_URL="postgresql://user:password@localhost:5432/postgres?schema=public"
```
- 依赖安装
```
    bun install
```

### 本地启动
```
    bun run dev
```

## 部署

### 前期准备
- 构建
```
    bun run build
```

- 构建后的文件以及script/create.sql上传至服务器

-

- 在服务器配置好环境变量
```
    #.env
    # 数据库
    DATABASE_URL="postgresql://user:password@localhost:5432/postgres?schema=public"
```


### 本地启动
```
    chmod +x library
    ./library
```
