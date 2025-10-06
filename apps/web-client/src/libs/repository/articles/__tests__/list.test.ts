import { describe, expect, test } from "bun:test";
import { list } from "../list";

describe("Article Repository - List", () => {
  test("should have list function", () => {
    expect(typeof list).toBe("function");
  });
});
