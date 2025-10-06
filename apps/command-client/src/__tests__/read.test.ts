import { describe, expect, test } from "bun:test";
import { FileFormat } from "../model";

describe("readArticle", () => {
  test("should have readArticle function", () => {
    // Basic test to ensure the module can be imported
    const readModule = require("../read");
    expect(typeof readModule.readArticle).toBe("function");
  });
});
