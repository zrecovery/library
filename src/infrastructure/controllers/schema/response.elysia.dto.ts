import { t, type TSchema } from "elysia";

export const ResponseDto = <M extends TSchema>(M: M) => {
  return t.Object({
    type: t.String(),
    title: t.String(),
    data: M,
  });
}

export const PaginatedResponseDto = <M extends TSchema>(M: M) => {
  return t.Object({
    type: t.String(),
    title: t.String(),
    data: t.Object({
      paging: t.Optional(
        t.Object({
          total: t.Number(),
          size: t.Number(),
          page: t.Number(),
        }),
      ),
      detail: M,
    }),
  });
}
