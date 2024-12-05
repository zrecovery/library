import { create } from "@article/domain/services/create";
import { update } from "@article/domain/services/edit";
import { find } from "@article/domain/services/find";
import { findMany } from "@article/domain/services/find-many";
import { remove } from "@article/domain/services/remove";
import { createArticleStore } from "@article/infrastructure/store";
import { createContextLogger} from "@utils/logger";
import { connectDb } from "src/article/infrastructure/store/connect";

export const createArticleService = () => {

    const uri = process.env.DATABASE_URI;
    if (uri === undefined) {
        throw new Error("No database uri provided");
    }

    const db = connectDb(uri);
    const store = createArticleStore(db);

    const logger = createContextLogger("ArticleService");

    const articleCreateService = create(logger,store);

    const articleUpdateService = update(logger,store);

    const articleFindService = find(logger,store);

    const articleFindManyService = findMany(logger,store);

    const articleRemoveService = remove(logger,store);

    const articleService = {
        create: articleCreateService,
        update: articleUpdateService,
        find: articleFindService,
        findMany: articleFindManyService,
        remove: articleRemoveService,
    };

    return articleService;
};