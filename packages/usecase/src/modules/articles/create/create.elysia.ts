import { Elysia, status, t } from "elysia";
import { CreateArticleUseCase } from "./create-article.usecase";
import { ArticleCreatePort } from "./port/type/create";
import { Id } from "@library/domain/common";

export const createArticleHttpService = (
  articleCreate: CreateArticleUseCase,
) => {
  return new Elysia().post(
    "/",
    async ({ body }) => {
      const result = await articleCreate.execute(body);
      if (result.isOk()) {
        return result.unwrap();
      } else {
        result.unwrapErr();
        return status(500, "未知错误");
      }
    },
    {
      body: ArticleCreatePort,
      response: {
        200: Id,
        500: t.String(),
      },
    },
  );
};
