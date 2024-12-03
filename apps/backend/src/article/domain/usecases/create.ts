import type { Logger } from "src/interface/logger";
import type { ArticleCreate } from "../schema/create";
import type { Save } from "../interfaces/store";

export const create = (logger: Logger, store: Save) => async (data: ArticleCreate): Promise<void> => {
    logger.debug({ data }, "Creating article");
    try {
        await store.save(data);
        logger.info({ title: data.title }, "Article created");
    } catch (error) {
        logger.error({ error, data }, "Failed to create article");
        throw error;
    }
};
