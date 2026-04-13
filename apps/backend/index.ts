import { Elysia } from "elysia";
import { articleHttpService } from "@library/usecase";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { env } from "bun";
import { cors } from "@elysiajs/cors";

const uri = env.DATABASE_URI;
const db = new Database(uri, { create: true });
const client = drizzle(db, {
  logger: true,
});

const app = new Elysia({ prefix: "/api" })
  .use(cors())
  .use(articleHttpService(client))
  .listen(3001);
export type App = typeof app;
