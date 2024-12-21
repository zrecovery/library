import { Type } from "@sinclair/typebox";

export const IdSchema = Type.Object({
  id: Type.Number(),
});
export type Id = number;
export type Pagination = { page: number; size: number };

export const PaginationQuerySchema = Type.Object({
  page: Type.Number({ minimum: 0 }),
  size: Type.Number({ minimum: 0 }),
});

export const PaginationResponse = Type.Object({
  pages: Type.Integer({ minimum: 0 }),
  items: Type.Integer({ minimum: 0 }),
  current: Type.Integer({ minimum: 0 }),
  size: Type.Integer({ minimum: 0 }),
});
