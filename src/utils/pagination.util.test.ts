import { describe, expect, it } from "bun:test";
import { paginationToOffsetLimit } from "./pagination.util";
import { Pagination } from "@src/core/schema/pagination.schema";

describe("pagination", () => {
  it("应该能正常分页", () => {
    const input: { size: number; page: number } = {
      page: 1,
      size: 10,
    };
    const result = paginationToOffsetLimit(input);
    expect(result).toEqual({
      limit: 10,
      offset: 0,
    });
  });
});
