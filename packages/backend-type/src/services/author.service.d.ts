import type { PageQuery, Query } from "@src/interfaces/query";
import type {
	IAuthorResponse,
	IAuthorsResponse,
} from "@src/interfaces/response.interface";
import type { ArticleRepository } from "@src/repositories/article.repository.port";
import type {
	ArticleAuthorRelationshipRepository,
	AuthorRepository,
} from "@src/repositories/author.repository.port";
import type {
	ChapterRepository,
	SeriesRepository,
} from "@src/repositories/series.repository.port";
export declare class AuthorSerivce {
	#private;
	constructor(
		authorRepository: AuthorRepository,
		articleRepository: ArticleRepository,
		seriesRepository: SeriesRepository,
		authorArticleRepository: ArticleAuthorRelationshipRepository,
		chapterRepository: ChapterRepository,
	);
	getById: (id: number, query: PageQuery) => Promise<IAuthorResponse>;
	list: (query: Query) => Promise<IAuthorsResponse>;
	delete: (id: number) => Promise<void>;
}
