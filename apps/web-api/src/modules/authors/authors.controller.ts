import Elysia from "elysia";

export const authorController = new Elysia({ prefix: "/authors" }).get(
  "/",
  () => {
    return "author";
  },
);
