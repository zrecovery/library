import type { Timestamp } from "./timestamp";

export interface Chapter extends Timestamp {
	id?: number;
	article_id: number;
	series_id: number;
	order: number;
}
