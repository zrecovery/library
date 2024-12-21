import type { Save } from "@article/domain/interfaces/store";
import type { ArticleCreate } from "@article/domain/types/create";
import type { Logger } from "src/interface/logger";

export const create =
  (logger: Logger, store: Save) =>
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
