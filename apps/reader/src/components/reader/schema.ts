import Type, { Static } from "typebox";

export const Size = Type.Object({
	height: Type.Number(),
	width: Type.Number(),
});
export type Size = Static<typeof Size>;

export const PaginationCursor = Type.Object({
	page: Type.Integer({ minimum: 1 }),
	start: Type.Integer({ minimum: 0 }),
});
export type PaginationCursor = Static<typeof PaginationCursor>;
