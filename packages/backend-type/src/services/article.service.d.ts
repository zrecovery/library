import type {
	IArticleCreateInput,
	IArticleUpdateInput,
} from "@src/interfaces/article.interface";
import type {
	IAuthorCreateInput,
	IAuthorUpdateInput,
} from "@src/interfaces/author.interface";
import type { Query } from "@src/interfaces/query";
import type { IArticleResponse } from "@src/interfaces/response.interface";
import type { ISeriesCreateInput } from "@src/interfaces/series.interface";
import type { Article, Author, Chapter, Series } from "@src/model";
import type { ArticleRepository } from "@src/services/repository.port";
import type {
	ArticleAuthorRelationshipRepository,
	AuthorRepository,
} from "@src/repositories/author.repository.port";
import type {
	ChapterRepository,
	SeriesRepository,
} from "@src/repositories/series.repository.port";
interface Repositories {
	articleRepository: ArticleRepository;
	authorRepository: AuthorRepository;
	authorArticleRepository: ArticleAuthorRelationshipRepository;
	seriesRepository: SeriesRepository;
	chapterRepository: ChapterRepository;
}
export declare class ArticleService {
	#private;
	constructor(repositories: Repositories);
	getAuthorsByArticleId: (id: number) => Promise<Required<Author>[]>;
	getSeriesByArticleId: (
		id: number,
	) => Promise<[Required<Chapter>, Required<Series>] | undefined>;
	search: (query: Query) => Promise<{
		detail: {
			authors: Required<Author>[];
			series: Required<Series> | undefined;
			order: number | undefined;
			id: number;
			title: string;
			body: string;
			created_at: Date;
			updated_at: Date;
		}[];
		pagination: import("@src/interfaces/response.interface").IPagination;
	}>;
	delete: (id: number) => Promise<void>;
	findById: (id: number) => Promise<IArticleResponse>;
	getAuthorOrCreate: (author: IAuthorCreateInput) => Promise<Required<Author>>;
	createArticle: (
		article: IArticleCreateInput,
		authors?: IAuthorCreateInput[],
		chapter?: {
			series: ISeriesCreateInput;
			order: number;
		},
	) => Promise<Article>;
	updateArticle: (
		id: number,
		changes: {
			article?: IArticleUpdateInput;
			author?: IAuthorUpdateInput;
			chapter?: {
				series?: ISeriesCreateInput;
				order?: number;
			};
		},
	) => Promise<void>;
}
export {};
