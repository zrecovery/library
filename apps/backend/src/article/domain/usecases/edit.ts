import type { Logger } from "src/interface/logger";
import type {  Id } from "src/model";
import type { ArticleUpdate } from "../schema/update";
import type { Update } from "../interfaces/store";

export const update = (logger: Logger, store: Update) => async (id: Id, data: ArticleUpdate): Promise<void> => {
    logger.debug({ id, data }, "Updating article");
    try {
      await store.update(id, data);
      logger.info({ id }, "Article updated");
    } catch (error) {
      logger.error({ error, id, data }, "Failed to update article");
      throw error;
    }
  }