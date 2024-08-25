import { describe, expect, it } from "bun:test";
import { convertPaginationDetail } from "./convert-pagination-detail";

describe("convertPaginationDetail", () => {
	it("should return correct pagination details with valid input", () => {
		const items = 100;
		const pagination = { limit: 10, offset: 20 };
		const result = convertPaginationDetail(items, pagination);
		expect(result).toEqual({
			current: 3,
			size: 10,
			items: 100,
			pages: 10,
		});
	});

	it("should return correct pagination details with zero items", () => {
		const items = 0;
		const pagination = { limit: 10, offset: 0 };
		const result = convertPaginationDetail(items, pagination);
		expect(result).toEqual({
			current: 1,
			size: 10,
			items: 0,
			pages: 0,
		});
	});

	it("should return correct pagination details with zero limit", () => {
		const items = 100;
		const pagination = { limit: 0, offset: 0 };
		const result = convertPaginationDetail(items, pagination);
		expect(result).toEqual({
			current: 1,
			size: 0,
			items: 100,
			pages: 1,
		});
	});

	it("should return correct pagination details with negative offset", () => {
		const items = 100;
		const pagination = { limit: 10, offset: -20 };
		const result = convertPaginationDetail(items, pagination);
		expect(result).toEqual({
			current: 1,
			size: 10,
			items: 100,
			pages: 10,
		});
	});

	it("should return correct pagination details with non-integer items", () => {
		const items = 100.5;
		const pagination = { limit: 10, offset: 0 };
		const result = convertPaginationDetail(items, pagination);
		expect(result).toEqual({
			current: 1,
			size: 10,
			items: 100.5,
			pages: 11,
		});
	});

	it("should return correct pagination details with non-integer limit", () => {
		const items = 100;
		const pagination = { limit: 10.5, offset: 0 };
		const result = convertPaginationDetail(items, pagination);
		expect(result).toEqual({
			current: 1,
			size: 10.5,
			items: 100,
			pages: 10,
		});
	});
});
