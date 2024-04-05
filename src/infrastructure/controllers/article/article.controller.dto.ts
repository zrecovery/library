import { PaginatedResponseDto, ResponseDto } from "@src/infrastructure/controllers/schema/response.elysia.dto";
import { t } from "elysia";

export const ArticleCreatedRequestDto = t.Object({
  title: t.String(),
  body: t.String(),
  author: t.String(),
  book: t.String(),
});

export const ArticleEditRequestDto = t.Object({
  id: t.Number(),
  title: t.Optional(t.String()),
  body: t.Optional(t.String()),
  author: t.Optional(t.String()),
  book: t.Optional(t.String()),
  order: t.Optional(t.String())
});

export const ArticleDto = t.Object({
  id: t.Number(),
  title: t.String(),
  body: t.String(),
  author: t.String(),
  author_id: t.Number(),
  book: t.String(),
  book_id: t.Number(),
  love: t.Boolean(),
});

export const ArticlePaginatedHttpDto = PaginatedResponseDto(t.Array(ArticleDto));

export const ArticleHttpDto = ResponseDto(ArticleDto); 
