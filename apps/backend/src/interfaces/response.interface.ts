import type { Article, Author, Chapter, Series } from "@src/model";

export interface IPagination {
	pages: number;
	items: number;
	size: number;
	current: number;
}

export interface Response<T> {
	detail: T;
}

export interface PaginatedResponse<T> {
	pagination: IPagination;
	detail: T;
}

export interface IArticleDetail {
	id: number;
	title: string;
	body: string;
	created_at: Date;
	updated_at: Date;
	authors?: Required<Author>[];
	series?: Required<Series>;
	order?: number;
}

export interface IArticleResponse extends Response<IArticleDetail> {}
export type IArticlesResponse = PaginatedResponse<IArticleDetail[]>;

export interface IAuthorDetail {
	id: number;
	name: string;
	created_at: Date;
	updated_at: Date;
	articles?: PaginatedResponse<Article[]>;
	series?: PaginatedResponse<Series[]>;
}

export type IAuthorResponse = Response<IAuthorDetail>;
export type IAuthorsResponse = PaginatedResponse<Required<Author>[]>;

export interface ISeriesDetail {
	id: number;
	title: string;
	created_at: Date;
	updated_at: Date;
	articles: IArticleDetail[];
	authors: Required<Author>[];
}

export interface ISeriesResponse {
	id: number;
	title: string;
	created_at: Date;
	updated_at: Date;
	chapters?: IArticleResponse[];
}

export interface ISeriesResponse {
	series: ISeriesResponse[];
	pagination: IPagination;
}

export interface IChapterDetail extends Required<Chapter> {
	series: Required<Series>;
}

export interface IChaptersResponse {
	detail: IChapterDetail[];
	pagination: IPagination;
}
