import { describe, expect, it } from "bun:test";
import { convertPageToOffset } from "./convert-page-to-offset";

describe("pagination", () => {
	it("应该能正常分页", () => {
		const input: { size: number; page: number } = {
			page: 1,
			size: 10,
		};
		const result = convertPageToOffset(input);
		expect(result).toEqual({
			limit: 10,
			offset: 0,
		});
	});
});
