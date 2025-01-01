import type { Remover } from "@articles/domain/interfaces/store";
import type { Logger } from "@shared/domain/interfaces/logger";
import type { Id } from "@shared/domain/types";

export const remove =
  (logger: Logger, store: Remover) =>
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
