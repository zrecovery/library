/*
    用于计算分页并缓存分页结果
 */
import { PaginationCursor, ReaderStore } from "@/components/reader/cache";
import { Render } from "@/components/reader/port/render";
import { Size } from "@/components/reader/schema";
import Value from "typebox/value";

export const computeCache = async (
	text: string,
	container: HTMLElement,
	paginationCursor: PaginationCursor,
	store: ReaderStore,
	render: Render,
	measuringContainer?: HTMLElement,
): Promise<PaginationCursor[]> => {
	console.log(`height: ${measuringContainer?.clientHeight}`);
	const size = Value.Parse(Size, {
		height: measuringContainer?.clientHeight,
		width: measuringContainer?.clientWidth,
	});

	const cache = await store.getPagination(1, size);
	if (cache) {
		return cache;
	}
	let result: PaginationCursor[] = [{ page: 1, start: 0 }];

	let { start, page } = paginationCursor;
	while (start < text.length - 1) {
		start = render(text, container, start);
		page = page + 1;
		result.push({ page, start });
	}
	await store.setPagination(1, size, result);

	return result;
};
