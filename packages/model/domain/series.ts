import type { Timestamp } from "./timestamp";

export interface Series extends Timestamp {
	id?: number;
	title: string;
}
