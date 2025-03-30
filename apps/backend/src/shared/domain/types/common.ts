import { Type } from "@sinclair/typebox";

export const IdSchema = Type.Object({
  id: Type.Integer({ minimum: 0 }),
});
export type Id = number;
export type Pagination = { page: number; size: number };

export const PaginationQuerySchema = Type.Object({
  page: Type.Integer({ minimum: 0, default: 1 }),
  size: Type.Integer({ minimum: 0, default: 10 }),
});

export const PaginationResponse = Type.Object({
  pages: Type.Integer({ minimum: 0 }),
  items: Type.Integer({ minimum: 0 }),
  current: Type.Integer({ minimum: 0 }),
  size: Type.Integer({ minimum: 0 }),
});
