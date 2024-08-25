import { type PrismaClient } from "@prisma/client";
import type {
	IArticleCreateInput,
	IArticleUpdateInput,
} from "@src/interfaces/article.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { Article } from "@src/model";
import type { ArticleRepository } from "@src/services/repository.port";
export declare class ArticlePrismaRepository implements ArticleRepository {
	#private;
	constructor(client: PrismaClient);
	getById: (id: number) => Promise<Required<Article>>;
	create: (created: IArticleCreateInput) => Promise<Required<Article>>;
	update: (
		id: number,
		updated: IArticleUpdateInput,
	) => Promise<Required<Article>>;
	delete: (id: number) => Promise<void>;
	list: (query: Query) => Promise<PaginatedResponse<Required<Article>[]>>;
}
