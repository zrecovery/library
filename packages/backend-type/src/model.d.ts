export interface Timestamp {
	created_at?: Date;
	updated_at?: Date;
}
export interface Article extends Timestamp {
	id?: number;
	title: string;
	body: string;
}
export interface Author extends Timestamp {
	id?: number;
	name: string;
}
export interface Series extends Timestamp {
	id?: number;
	title: string;
}
export interface Chapter extends Timestamp {
	id?: number;
	article_id: number;
	series_id: number;
	order: number;
}
export interface ArticleAuthorRelationship extends Timestamp {
	id?: number;
	author_id: number;
	article_id: number;
}
