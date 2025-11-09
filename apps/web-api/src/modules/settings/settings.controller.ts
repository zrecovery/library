import {
  type DomainError,
  DomainErrorTag,
  type SettingQuery,
  type SettingUpdate,
  createSettingStore,
  get,
  getSetting,
  list,
  remove,
  set,
  update,
} from "core";
import Elysia, { status, t } from "elysia";

const SettingModel = new Elysia().model({
  "setting.request": t.Object({
    key: t.String({ minLength: 1 }),
    value: t.Union([
      t.String(),
      t.Number(),
      t.Boolean(),
      t.Record(t.String(), t.Unknown()),
    ]),
    type: t.Optional(
      t.Union([
        t.Literal("string"),
        t.Literal("number"),
        t.Literal("boolean"),
        t.Literal("json"),
      ]),
    ),
    description: t.Optional(t.String()),
  }),
  "setting.update.request": t.Object({
    key: t.String({ minLength: 1 }),
    value: t.Union([
      t.String(),
      t.Number(),
      t.Boolean(),
      t.Record(t.String(), t.Unknown()),
    ]),
  }),
  "setting.query": t.Object({
    userId: t.Optional(t.Union([t.Number(), t.Null()])),
    keys: t.Optional(t.Array(t.String())),
  }),
  "setting.response": t.Object({
    id: t.Number(),
    userId: t.Union([t.Number(), t.Null()]),
    key: t.String(),
    value: t.Union([
      t.String(),
      t.Number(),
      t.Boolean(),
      t.Record(t.String(), t.Unknown()),
    ]),
    type: t.Union([
      t.Literal("string"),
      t.Literal("number"),
      t.Literal("boolean"),
      t.Literal("json"),
    ]),
    description: t.Optional(t.String()),
    createdAt: t.String(),
    updatedAt: t.String(),
  }),
  "setting.list.response": t.Array(t.Ref("setting.response")),
});

export const createSettingController = (db: any) => {
  // Create store instance for direct access if needed
  const store = createSettingStore(db);

  return new Elysia({ prefix: "/settings" })
    .use(SettingModel)
    .get(
      "/",
      async ({ query }) => {
        // Parse query parameters
        const settingQuery: SettingQuery = {};

        if (query.userId !== undefined) {
          settingQuery.userId =
            query.userId === "null" ? null : Number(query.userId);
        }

        if (query.keys) {
          settingQuery.keys = Array.isArray(query.keys)
            ? query.keys
            : [query.keys];
        }

        const result = await list(store)({
          userId: settingQuery.userId,
          keys: settingQuery.keys,
        });

        const handleError = (err: DomainError) => {
          switch (err._tag) {
            case DomainErrorTag.NotFound:
              return status(404, "Not Found");
            case DomainErrorTag.Invalidation:
              return status(400, "Bad Request");
            default:
              console.error("Settings list error:", err);
              return status(500, "Internal Server Error");
          }
        };

        return result.match({
          ok: (val) => {
            // Format dates for JSON serialization
            return val.map((setting: any) => ({
              ...setting,
              createdAt: setting.createdAt.toISOString(),
              updatedAt: setting.updatedAt.toISOString(),
            }));
          },
          err: (e: DomainError) => handleError(e),
        });
      },
      {
        query: t.Object({
          userId: t.Optional(t.Union([t.String(), t.Number()])), // String to handle 'null'
          keys: t.Optional(t.Union([t.String(), t.Array(t.String())])), // String for single, Array for multiple
        }),
        response: {
          200: "setting.list.response",
          400: t.String(),
          404: t.String(),
          500: t.String(),
        },
      },
    )
    .get(
      "/:id",
      async ({ params: { id } }) => {
        const result = await get(store)(Number(id));
        const handleError = (err: DomainError) => {
          switch (err._tag) {
            case DomainErrorTag.NotFound:
              return status(404, "Not Found");
            default:
              console.error("Setting detail error:", err);
              return status(500, "Internal Server Error");
          }
        };
        return result.match({
          ok: (val: any) => {
            return {
              ...val,
              createdAt: val.createdAt.toISOString(),
              updatedAt: val.updatedAt.toISOString(),
            };
          },
          err: (e: DomainError) => handleError(e),
        });
      },
      {
        params: t.Object({ id: t.Numeric() }),
        response: {
          200: "setting.response",
          404: t.String(),
          500: t.String(),
        },
      },
    )
    .get(
      "/key/:userId/:key",
      async ({ params }) => {
        const { userId, key } = params;
        const userIdNum = userId === "null" ? null : Number(userId);

        const result = await getSetting(store)(userIdNum, key);
        const handleError = (err: DomainError) => {
          switch (err._tag) {
            case DomainErrorTag.NotFound:
              return status(404, "Not Found");
            default:
              console.error("Setting by key error:", err);
              return status(500, "Internal Server Error");
          }
        };
        return result.match({
          ok: (val: any) => {
            if (!val) {
              return status(404, "Setting not found");
            }
            return {
              ...val,
              createdAt: val.createdAt.toISOString(),
              updatedAt: val.updatedAt.toISOString(),
            };
          },
          err: (e: DomainError) => handleError(e),
        });
      },
      {
        params: t.Object({
          userId: t.Union([t.String(), t.Number()]), // String to handle 'null'
          key: t.String({ minLength: 1 }),
        }),
        response: {
          200: "setting.response",
          404: t.String(),
          500: t.String(),
        },
      },
    )
    .post(
      "/",
      async ({ body, set: setContext }) => {
        const result = await set(store)(null, body.key, body.value);
        const handleError = (err: DomainError) => {
          switch (err._tag) {
            case DomainErrorTag.Invalidation:
              return status(400, "Bad Request");
            default:
              console.error("Setting create error:", err);
              return status(500, "Internal Server Error");
          }
        };
        return result.match({
          ok: (val: any) => {
            setContext.status = "Created";
            return {
              ...val,
              createdAt: val.createdAt.toISOString(),
              updatedAt: val.updatedAt.toISOString(),
            };
          },
          err: (e: DomainError) => handleError(e),
        });
      },
      {
        body: "setting.request",
        response: {
          201: "setting.response",
          400: t.String(),
          500: t.String(),
        },
      },
    )
    .put(
      "/:id",
      async ({ body, params: { id }, set: setContext }) => {
        const updateData: SettingUpdate = {
          key: body.key,
          value: body.value,
        };

        const result = await update(store)(Number(id), updateData);
        const handleError = (err: DomainError) => {
          switch (err._tag) {
            case DomainErrorTag.NotFound:
              return status(404, "Not Found");
            case DomainErrorTag.Invalidation:
              return status(400, "Bad Request");
            default:
              console.error("Setting update error:", err);
              return status(500, "Internal Server Error");
          }
        };
        return result.match({
          ok: (val: any) => {
            setContext.status = "OK";
            return {
              ...val,
              createdAt: val.createdAt.toISOString(),
              updatedAt: val.updatedAt.toISOString(),
            };
          },
          err: (e: DomainError) => handleError(e),
        });
      },
      {
        params: t.Object({ id: t.Numeric() }),
        body: "setting.update.request",
        response: {
          200: "setting.response",
          400: t.String(),
          404: t.String(),
          500: t.String(),
        },
      },
    )
    .delete(
      "/:id",
      async ({ params: { id }, set: setContext }) => {
        const result = await remove(store)(Number(id));
        const handleError = (err: DomainError) => {
          switch (err._tag) {
            case DomainErrorTag.NotFound:
              return status(404, "Not Found");
            default:
              console.error("Setting delete error:", err);
              return status(500, "Internal Server Error");
          }
        };
        return result.match({
          ok: () => {
            setContext.status = "No Content";
            return "";
          },
          err: (e: DomainError) => handleError(e),
        });
      },
      {
        params: t.Object({ id: t.Numeric() }),
        response: {
          204: t.String(),
          404: t.String(),
          500: t.String(),
        },
      },
    );
};
