import type { Timestamp } from "./timestamp";

export interface Person extends Timestamp {
	id?: number;
	name: string;
}

export interface Author extends Timestamp {
	id?: number;
	person_id: number;
	article_id: number;
}
