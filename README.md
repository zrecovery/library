# backend

Library电子书管理系统后端，基于Bun.js和Elysia.js.

开发中，文档待补充。

# 安装依赖
```bash
bun install
```

## 创建数据库结构
因Prisma不支持SQLite的FTS5虚拟表，所以需要手动创建数据库结构。
```bash
prisma db push
sqlite3 prisma/dev.db < sql/index.sql
```

# 运行开发:

```bash
bun run dev
```
