import { Elysia, status, t } from "elysia";
import type { CreateArticleUseCase } from "./create-article.usecase";
import { ArticleCreateErrorEnum, ArticleCreatePort } from "./port/type/create";

/**
 * 将 CreateArticleUseCase 暴露为 HTTP POST / 端点。
 *
 * usecase.execute() 始终返回 Result（不会 throw），因此
 * match 的 ok/err 分支已经覆盖所有情况，无需外层 try/catch。
 */
export const createArticleHttpService = (
  articleCreate: CreateArticleUseCase,
) => {
  return new Elysia().post(
    "/",
    async ({ body }) => {
      const result = await articleCreate.execute(body);

      return result.match({
        ok: (_id) => status(201),
        err: (e) => {
          switch (e.tag) {
            case ArticleCreateErrorEnum.InvalidInput:
              return status(400, e.message);
            default:
              console.error(e);
              return status(500, "未知错误");
          }
        },
      });
    },
    {
      body: ArticleCreatePort,
      response: {
        201: t.String(),
        400: t.String(),
        500: t.String(),
      },
    },
  );
};
