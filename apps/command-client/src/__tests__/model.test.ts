import { describe, expect, test } from "bun:test";
import { FileFormat, format } from "../model";

describe("format", () => {
  test("should format raw data with chapter", () => {
    const raw = {
      filename: "test.txt",
      title: "Test Title",
      body: "Test Body",
      author: "Test Author",
      author_id: "123",
      series: "Test Series",
      order: "1"
    };

    const result = format(raw);

    expect(result).toEqual({
      filename: "test.txt",
      title: "Test Title",
      body: "Test Body",
      author: {
        name: "Test Author",
        author_id: 123
      },
      chapter: {
        title: "Test Series",
        order: 1
      }
    });
  });

  test("should format raw data without chapter", () => {
    const raw = {
      filename: "test.txt",
      title: "Test Title",
      body: "Test Body",
      author: "Test Author",
      author_id: "123",
      order: "1"
    };

    const result = format(raw);

    expect(result).toEqual({
      filename: "test.txt",
      title: "Test Title",
      body: "Test Body",
      author: {
        name: "Test Author",
        author_id: 123
      },
      chapter: undefined
    });
  });
});