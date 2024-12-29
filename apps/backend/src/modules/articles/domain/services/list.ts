import type { Lister } from "@articles/domain/interfaces/store";
import type { ArticleListResponse } from "@articles/domain/types/list";
import type { ArticleQuery } from "@articles/domain/types/query";
import type { Logger } from "@shared/domain/interfaces/logger";

export const findMany =
  (logger: Logger, store: Lister) =>
  async (query: ArticleQuery): Promise<ArticleListResponse> => {
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
  };
