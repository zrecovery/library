import { Accessor, Setter } from "solid-js";
import { PaginationCursor } from "@/components/reader/schema";
import { Render } from "@/components/reader/port/render";
import { ReaderStore } from "@/components/reader/cache";
import { computeCache } from "@/components/reader/compute";
import { displayText } from "@/components/reader/display-text";

export const displayWithCache = async (
	article: Accessor<string>,
	setCache: Setter<PaginationCursor[]>,
	render: Render,
	container: HTMLElement,
	store: ReaderStore,
	displayContainer?: HTMLElement,
	measuringContainer?: HTMLElement,
) => {
	const cache = await computeCache(
		article(),
		container,
		{ start: 0, page: 1 },
		store,
		render,
		measuringContainer,
	);
	setCache(cache);

	const pageText = article().slice(0, cache[1].start);
	displayText(pageText, displayContainer);
};
