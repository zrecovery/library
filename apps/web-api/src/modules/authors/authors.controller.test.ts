import { describe, expect, test } from "bun:test";
import { createAuthorController } from "./authors.controller";

describe("Authors Controller", () => {
  test("should have createAuthorController function", () => {
    expect(typeof createAuthorController).toBe("function");
  });
});
