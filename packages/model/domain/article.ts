import type { Creatable, Updatable } from "../protocol/crud";
import type { Timestamp } from "./timestamp";

export interface Article extends Timestamp {
	id?: number;
	title: string;
	body: string;
}

export interface ArticleDetail extends Required<Article> {
	chapter?: {
		id: number;
		order: number;
		title: string;
	};
	author?: {
		id: number;
		name: string;
	};
}

export interface ArticleCreated extends Creatable<Article> {
	chapter?: {
		title: string;
		order: number;
	};
	author?: {
		name: string;
	};
}

export interface ArticleUpdated extends Updatable<Article> {
	author?: {
		name: string;
	};
	chapter?: {
		title?: string;
		order?: number;
	};
}
