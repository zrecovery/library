export declare const created_at: Date;
export declare const updated_at: Date;
export declare const articlesMock: {
	id: number;
	title: string;
	body: string;
	created_at: Date;
	updated_at: Date;
}[];
export declare const authorsMock: {
	id: number;
	name: string;
	created_at: Date;
	updated_at: Date;
}[];
export declare const seriesMock: {
	id: number;
	title: string;
	created_at: Date;
	updated_at: Date;
}[];
export declare const chaptersMock: {
	id: number;
	article_id: number;
	series_id: number;
	order: number;
	created_at: Date;
	updated_at: Date;
}[];
export declare const articleAuthorRelationshipsMock: {
	id: number;
	author_id: number;
	article_id: number;
	created_at: Date;
	updated_at: Date;
}[];
