import { AuthorDetail, type AuthorService, DomainErrorTag } from "backend";
import Elysia, { error, t } from "elysia";

const AuthorModel = new Elysia().model({
  "detail.response": AuthorDetail,
});

export const createAuthorController = (service: AuthorService) => {
  return new Elysia({ prefix: "/authors" }).use(AuthorModel).get(
    "/:id",
    async ({ params: { id } }) => {
      const result = await service.detail(id);
      return result.match({
        ok: (val) => {
          return val;
        },
        err: (err) => {
          switch (err._tag) {
            case DomainErrorTag.NotFound:
              console.error(err);
              return error(404, "Not Found");

            default:
              console.error(err);
              return error(500, "Internal Server Error");
          }
        },
      });
    },
    {
      params: t.Object({ id: t.Numeric() }),
      response: {
        200: "detail.response",
        404: t.String(),
        500: t.String(),
      },
    },
  );
};
