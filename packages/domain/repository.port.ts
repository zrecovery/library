import type {
	Article,
	ArticleCreated,
	ArticleDetail,
	ArticleUpdated,
	Series,
} from "model/domain";
import type { Query, PaginatedResponse } from "model/schema";

export interface Repositories {
	article: ArticleRepository;
	author: AuthorRepository;
	chapter: ChapterRepository;
}

export abstract class ArticleRepository {
	abstract find(query: Partial<Article>): Promise<ArticleDetail>;
	abstract findMany(query?: Query): Promise<PaginatedResponse<ArticleDetail[]>>;
	abstract update(id: number, data: ArticleUpdated): Promise<void>;
	abstract create(data: ArticleCreated): Promise<Required<Article>>;
	abstract delete(id: number): Promise<void>;
}

export abstract class AuthorRepository {}

export abstract class ChapterRepository {
	abstract findMany(query: Query): Promise<PaginatedResponse<Series[]>>;
	abstract find(
		query: Query & { id: number },
	): Promise<PaginatedResponse<Series & { articles: ArticleDetail[] }>>;
}
