import ArticleService from "./core/article/article.service";
import { AuthorService } from "./core/author/author.service";
import BookService from "./core/book/book.service";
import { ArticleController } from "./infrastructure/controllers/article.controller";
import { AuthorController } from "./infrastructure/controllers/author.controller";
import { BookController } from "./infrastructure/controllers/book.contoller";
import { ArticlePrismaRepository } from "./infrastructure/prisma/articles.repository";
import { AuthorPrismaRepository } from "./infrastructure/prisma/author.repository";
import { BookPrismaRepository } from "./infrastructure/prisma/books.repository";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { PrismaClient } from "@prisma/client";
import { Elysia } from "elysia";

const app = new Elysia();
const client = new PrismaClient();



const articleRepository = new ArticlePrismaRepository(client);
const articleService = new ArticleService(articleRepository);
const articleController = new ArticleController(articleService);

app.group("/articles", app =>
    app.get("/", articleController.list)
        .get("/:id", articleController.getById)
        .post("/", articleController.create)
        .patch("/:id", articleController.update)
        .delete("/:id", articleController.delete)
);

const bookRepository = new BookPrismaRepository(client);
const bookService = new BookService(bookRepository);
const bookController = new BookController(bookService);
app.group("/books", app =>
    app.get("/", bookController.list)
        .get("/:id", bookController.getById)
);

const authorRepository = new AuthorPrismaRepository(client);
const authorService = new AuthorService(authorRepository);
const authorController = new AuthorController(authorService);
app.group("/authors", app =>
    app.get("/", authorController.list)
        .get("/:id", bookController.getByAuthorId)
);

app.use(swagger());

app.use(cors({ origin: true }));

app.listen(3001);
