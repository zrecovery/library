import { Elysia, status, t } from "elysia";
import type { FindArticleListUseCase } from "./list.usecase";
import {
  ArticleListErrorEnum,
  ArticleListResultPort,
} from "./port/type/findList";

export const createArticleListHttpService = (
  articleListUseCase: FindArticleListUseCase,
) => {
  return new Elysia().get(
    "/",
    async ({ query }) => {
      const { size, page, keywords } = query;

      const result = await articleListUseCase.execute({
        pagination: { size: size ?? 10, page: page ?? 1 },
        keyword: keywords,
      });
      const mapResult = result.match({
        ok: (r) => r,
        err: (e) => {
          switch (e.tag) {
            case ArticleListErrorEnum.InvalidInput:
              console.error(e);
              return status(400, "请求异常");

            default:
              console.log(e);
              return status(500, "未知异常");
          }
        },
      });
      return mapResult;
    },
    {
      query: t.Object({
        size: t.Optional(t.Numeric({ minimum: 1, default: 10 })),
        page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
        keywords: t.Optional(t.String()),
      }),
      response: {
        200: ArticleListResultPort,
        400: t.String(),
        500: t.String(),
      },
    },
  );
};
