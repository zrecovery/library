import type {
	Article,
	Person,
	ArticleDetail,
	Author,
	Chapter,
	Series,
} from "model/domain";
import type { Creatable, Updatable } from "model/protocol";
import type { Query, PaginatedResponse, Pagination } from "model/schema";
import type { ArticleDetailEntity } from "../base/article/article.entity";

export interface BaseRepositories {
	article: ArticleBaseRepository;
	author: PersonBaseRepository;
	authorRelation: AuthorBaseRepository;
	series: SeriesBaseRepository;
	chapter: ChapterBaseRepository;
}

abstract class BaseRepository<T> {
	abstract find(query: Partial<T>): Promise<Required<T> | null>;
	abstract create(data: Creatable<T>): Promise<Required<T>>;
	abstract update(id: number, data: Updatable<T>): Promise<Required<T>>;
	abstract remove(id: number): Promise<void>;
	abstract findMany(query?: Query): Promise<PaginatedResponse<Required<T>[]>>;
}

export abstract class ArticleBaseRepository extends BaseRepository<Article> {}

export abstract class PersonBaseRepository extends BaseRepository<Person> {}

export abstract class AuthorBaseRepository extends BaseRepository<Author> {}

export abstract class SeriesBaseRepository extends BaseRepository<Series> {}

export abstract class ChapterBaseRepository extends BaseRepository<Chapter> {}

export abstract class DetailBaseRepository {
	abstract find(query: Partial<ArticleDetail>): Promise<ArticleDetail | null>;
	abstract findMany(
		query?: Query & Partial<ArticleDetailEntity>,
	): Promise<PaginatedResponse<ArticleDetail[]>>;
}
