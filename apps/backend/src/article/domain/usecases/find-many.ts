import type { Logger } from "src/interface/logger";
import type {  ArticleQuery } from "../schema/query";
import type { ArticleListResponse } from "../schema/list";
import type { FindMany } from "../interfaces/store";

export const findMany = (logger: Logger, store: FindMany) => async (query: ArticleQuery): Promise<ArticleListResponse> => {
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
}