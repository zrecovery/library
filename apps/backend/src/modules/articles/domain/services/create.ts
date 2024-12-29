import type { Saver } from "@articles/domain/interfaces/store";
import type { ArticleCreate } from "@articles/domain/types/create";
import type { Logger } from "@shared/domain/interfaces/logger";

export const create =
  (logger: Logger, store: Saver) =>
  async (data: ArticleCreate): Promise<void> => {
    logger.debug({ data }, "Creating article");
    try {
      await store.save(data);
      logger.info({ title: data.title }, "Article created");
    } catch (error) {
      logger.error({ error, data }, "Failed to create article");
      throw error;
    }
  };
