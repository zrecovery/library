import { describe, expect, test } from "bun:test";
import { createArticlesController } from "../articles.controller";

describe("Articles Controller", () => {
  test("should have createArticlesController function", () => {
    expect(typeof createArticlesController).toBe("function");
  });
});