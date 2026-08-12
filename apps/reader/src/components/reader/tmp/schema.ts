import Type, { Static } from "typebox";

export const Id = Type.Integer({ minimum: 0 });
export type Id = Static<typeof Id>;

export const Cursor = Type.Integer({ minimum: 1 });
export type Cursor = Static<typeof Cursor>;

export const ChapterFormat = Type.Array(
	Type.Object({
		level: Type.Integer({ minimum: 1 }),
		format: Type.String(),
	}),
);
export type ChapterFormat = Static<typeof ChapterFormat>;

export const ChapterCursor = Type.Object({
	cursor: Type.Number({ minimum: 1 }),
	chapter: Type.String(),
	level: Type.Integer({ minimum: 1 }),
});
export type ChapterCursor = Static<typeof ChapterCursor>;

export type Book = {
	title: string;
	author: string;
	content: string;
	chapter: ChapterCursor[];
};

type Pagination = {
	page: number;
	cursor: number;
}[];
