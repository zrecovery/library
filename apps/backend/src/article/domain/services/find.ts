import type { Id} from "src/model";
import type { Logger } from "src/interface/logger";
import type { Find } from "../interfaces/store";
import type { ArticleDetail } from "../schema/detail";

export const find = (logger: Logger, store: Find) =>  async (id: Id): Promise<ArticleDetail | null> => {
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
  }

