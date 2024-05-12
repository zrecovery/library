import { t, type TSchema } from "elysia";

export const ResponseSchema = <M extends TSchema>(M: M) => {
  return t.Object({
    detail: M,
  });
};

export const PaginatedResponseSchema = <M extends TSchema>(M: M) => {
  return t.Object({
    pagination: t.Object({
      items: t.Number(),
      pages: t.Number(),
      size: t.Number(),
      current: t.Number(),
    }),
    detail: M,
  });
};
