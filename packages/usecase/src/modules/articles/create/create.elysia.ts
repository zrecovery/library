import { Elysia, status, t } from "elysia";
import type { CreateArticleUseCase } from "./create-article.usecase";
import { ArticleCreateErrorEnum, ArticleCreatePort } from "./port/type/create";

export const createArticleHttpService = (
  articleCreate: CreateArticleUseCase,
) => {
  return new Elysia().post(
    "/",
    async ({ body }) => {
      try {
        const result = await articleCreate.execute(body);
        const mappedResult = result.match({
          ok: (id) => status(201),
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
        return mappedResult;
      } catch (e) {
        console.error(e);
        return status(500, "未知错误");
      }
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
