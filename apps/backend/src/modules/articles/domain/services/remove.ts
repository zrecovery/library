import type { Logger } from "src/interface/logger";
import type { Id } from "src/model";
import type { Remove } from "@article/domain/interfaces/store";

export const remove =
  (logger: Logger, store: Remove) =>
  async (id: Id): Promise<void> => {
    logger.debug({ id }, "Removing article");
    try {
      await store.remove(id);
      logger.info({ id }, "Article removed");
    } catch (error) {
      logger.error({ error, id }, "Failed to remove article");
      throw error;
    }
  };
