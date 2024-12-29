import type { Updater } from "@articles/domain/interfaces/store";
import type { ArticleUpdate } from "@articles/domain/types/update";
import type { Logger } from "@shared/domain/interfaces/logger";
import type { Id } from "@shared/domain/types/common";

export const edit =
  (logger: Logger, store: Updater) =>
  async (id: Id, data: ArticleUpdate): Promise<void> => {
    logger.debug({ id, data }, "Updating article");
    try {
      await store.update(id, data);
      logger.info({ id }, "Article updated");
    } catch (error) {
      logger.error({ error, id, data }, "Failed to update article");
      throw error;
    }
  };
