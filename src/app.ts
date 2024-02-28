import { articleFactory } from "./application/factory/article.factory";
import { AuthorFactory } from "./application/factory/author.factory";
import { bookFactory } from "./application/factory/book.factory";

import { Elysia } from "elysia";
import { clientFactory } from "./application/factory/client.factory";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

const app = new Elysia();

app.use(swagger());
app.use(
  cors({
    origin: /.*\/localhost:5173$/,
  }),
);


const client = clientFactory();

const articleController = articleFactory(client);

app.use(articleController.start());

app.listen(3001);
