import { describe, expect, test } from "bun:test";
import { createChapterController } from "./chapters.controller";

describe("Chapters Controller", () => {
  test("should have createChapterController function", () => {
    expect(typeof createChapterController).toBe("function");
  });
});
