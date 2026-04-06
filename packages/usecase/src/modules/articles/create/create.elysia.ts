import { Elysia, status, t } from "elysia";
import type { CreateArticleUseCase } from "./create-article.usecase";
import { ArticleCreateErrorEnum, ArticleCreatePort } from "./port/type/create";
import { Id } from "@library/domain";

export const createArticleHttpService = (
  articleCreate: CreateArticleUseCase,
) => {
  return new Elysia().post(
    "/",
    async ({ body }) => {
      try {
        const result = await articleCreate.execute(body);
        console.log(result);
        const mappedResult = result.match({
          ok: (id) => id,
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
        200: Id,
        400: t.String(),
        500: t.String(),
      },
    },
  );
};
