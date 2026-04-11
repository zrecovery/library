import { Elysia, status, t } from "elysia";
import type { FindArticleDetailUseCase } from "./find-detail.usecase";
import {
  ArticleDetailErrorEnum,
  ArticleDetailResultPort,
} from "./port/type/findDetail";

export const createArticleDetailHttpService = (
  articleDetailUseCase: FindArticleDetailUseCase,
) => {
  return new Elysia().get(
    "/:id",
    async ({ params }) => {
      const { id } = params;
      const result = await articleDetailUseCase.execute(id);
      const mapResult = result.match({
        ok: (r) => r,
        err: (e) => {
          switch (e.tag) {
            case ArticleDetailErrorEnum.InvalidInput:
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
      params: t.Object({
        id: t.Integer({ minimum: 0 }),
      }),
      response: {
        200: ArticleDetailResultPort,
        400: t.String(),
        500: t.String(),
      },
    },
  );
};
