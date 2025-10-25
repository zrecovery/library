import { type ChapterService, DomainErrorTag, type Logger } from "backend";
import Elysia, { status, t } from "elysia";

const ChapterModel = new Elysia().model({});

export const createChapterController = (
  service: ChapterService,
  logger?: Logger,
) => {
  return new Elysia({ prefix: "/chapters" }).use(ChapterModel).get(
    "/:id",
    async ({ params: { id } }) => {
      const result = await service.detail(Number(id));
      return result.match({
        ok: (val: any) => {
          return val;
        },
        err: (err: any) => {
          switch (err._tag) {
            case DomainErrorTag.NotFound:
              return status(404, "Not Found");

            default:
              logger?.error(`Chapter detail error: ${JSON.stringify(err)}`);
              return status(500, "Internal Server Error");
          }
        },
      });
    },
    {
      params: t.Object({ id: t.Numeric() }),
      response: {
        200: t.Any(),
        404: t.String(),
        500: t.String(),
      },
    },
  );
};
