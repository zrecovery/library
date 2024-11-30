import type {
  ArticleCreate,
  ArticleDetail,
  ArticleList,
  ArticleQuery,
  ArticleUpdate,
  Id,
} from "../model";
import { createContextLogger } from "../../utils/logger";
import type { ArticleStore } from "./article-store.interface";

const logger = createContextLogger("ArticleService");

export const createArticleService = (store: ArticleStore) => ({
  async findMany(query: ArticleQuery): Promise<ArticleList> {
    logger.debug({ query }, "Finding articles");
    try {
      const result = await store.findMany(query);
      logger.debug(
        { count: result.data.length, pagination: result.pagination },
        "Articles found",
      );
      return result;
    } catch (error) {
      logger.error({ error, query }, "Failed to find articles");
      throw error;
    }
  },

  async find(id: Id): Promise<ArticleDetail | null> {
    logger.debug({ id }, "Finding article");
    try {
      const result = await store.find(id);
      if (result) {
        logger.debug({ id }, "Article found");
      } else {
        logger.debug({ id }, "Article not found");
      }
      return result;
    } catch (error) {
      logger.error({ error, id }, "Failed to find article");
      throw error;
    }
  },

  async create(data: ArticleCreate): Promise<void> {
    logger.debug({ data }, "Creating article");
    try {
      await store.create(data);
      logger.info({ title: data.title }, "Article created");
    } catch (error) {
      logger.error({ error, data }, "Failed to create article");
      throw error;
    }
  },

  async update(id: Id, data: ArticleUpdate): Promise<void> {
    logger.debug({ id, data }, "Updating article");
    try {
      await store.update(id, data);
      logger.info({ id }, "Article updated");
    } catch (error) {
      logger.error({ error, id, data }, "Failed to update article");
      throw error;
    }
  },

  async remove(id: Id): Promise<void> {
    logger.debug({ id }, "Removing article");
    try {
      await store.remove(id);
      logger.info({ id }, "Article removed");
    } catch (error) {
      logger.error({ error, id }, "Failed to remove article");
      throw error;
    }
  },
});
