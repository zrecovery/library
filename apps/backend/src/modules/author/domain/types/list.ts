import { Type, type Static } from "@sinclair/typebox";

import { IdSchema, PaginationQuerySchema, PaginationResponse } from "src/model";
import { AuthorSchema } from "src/model/author";

export const AuthorQuerySchema = Type.Composite([PaginationQuerySchema]);

export type AuthorQuery = Static<typeof AuthorQuerySchema>;

export const AuthorListResponseSchema = Type.Object({
  detail: Type.Array(Type.Composite([IdSchema, AuthorSchema])),
  pagination: PaginationResponse,
});

export type AuthorListResponse = Static<typeof AuthorListResponseSchema>;
