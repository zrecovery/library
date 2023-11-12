import { articleFactory } from "./application/factory/article.factory";
import { AuthorFactory } from "./application/factory/author.factory";
import { bookFactory } from "./application/factory/book.factory";

import { Elysia } from "elysia";
import { clientFactory } from "./application/factory/client.factory";

const app = new Elysia();

const client = clientFactory();

const articleController = articleFactory(client);

app.group("/articles", (app) =>
  app
    .get("/", articleController.list)
    .get("/:id", articleController.getById)
    .post("/", articleController.create)
    .put("/:id", articleController.update)
    .delete("/:id", articleController.delete),
);

const bookController = bookFactory(client);

app.group("/books", (app) =>
  app.get("/", bookController.list).get("/:id", bookController.getById),
);

const authorController = AuthorFactory(client);

app.group("/authors", (app) =>
  app.get("/", authorController.list).get("/:id", bookController.getByAuthorId),
);

app.listen(3001);
