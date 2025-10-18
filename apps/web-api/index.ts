import { cors } from "@elysiajs/cors";
import {
  createArticleService,
  createAuthorService,
  createChapterService,
  getDatabaseManager,
  readConfig,
} from "backend";
import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { createArticlesController } from "./src/modules/articles/articles.controller";
import { createAuthorController } from "./src/modules/authors/authors.controller";
import { createChapterController } from "./src/modules/chapters/chapters.controller";

const config = readConfig();

// Initialize database manager and create services within an async context
async function initializeApp() {
  // Initialize database manager before creating services
  const dbManager = getDatabaseManager(config);
  await dbManager.initialize();

  const articleService = createArticleService(config);
  const articleController = createArticlesController(articleService);

  const authorService = createAuthorService(config);
  const authorController = createAuthorController(authorService);

  const chapterService = createChapterService(config);
  const chapterController = createChapterController(chapterService);

  // Add shutdown hook to gracefully close database connections
  process.on("SIGINT", async () => {
    console.info("Shutting down gracefully...");
    await dbManager.shutdown();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.info("Shutting down gracefully...");
    await dbManager.shutdown();
    process.exit(0);
  });

  const app = new Elysia()
    .use(cors())
    .use(staticPlugin({ prefix: "/" }))
    .group("/api", (api) =>
      api.use(articleController).use(authorController).use(chapterController),
    )
    .listen(3001);

  return app;
}

// Execute the initialization
export const app = await initializeApp();
export type Server = typeof app;
