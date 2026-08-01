import {
	Accessor,
	type Component,
	createEffect,
	createMemo,
	Setter,
} from "solid-js";
import { PaginationCursor, readerStore } from "@/components/reader/cache";

import { render } from "@/components/reader/render";
import { useResize } from "@/components/reader/use-resize";
import { displayText } from "@/components/reader/display-text";
import { displayWithCache } from "@/components/reader/display-with-cache";
import { getMeasuringContainer } from "@/components/reader/create-measuring-container";

const ArticleRender: Component<{
	article: string;
	current: number;
	getCache: Accessor<PaginationCursor[]>;
	setCache: Setter<PaginationCursor[]>;
}> = (props) => {
	const article = () => props.article;
	const getCurrentPage = () => props.current;
	let displayContainer: HTMLElement | undefined;
	let measuringContainer: HTMLElement | undefined;
	const getTotalPage = createMemo(() => {
		return props.getCache().length;
	});

	createEffect(() => {
		if (props.getCache().length > 1) {
			const result = props
				.getCache()
				.filter((a) => a.page === getCurrentPage());

			const next =
				getCurrentPage() === getTotalPage()
					? article().length
					: props.getCache().filter((a) => a.page === getCurrentPage() + 1)[0]
							.start;
			const pageText = article().substring(result[0].start, next);
			displayText(pageText, displayContainer);
		}
	});

	useResize(async () => {
		const container = getMeasuringContainer();
		measuringContainer = container;
		await displayWithCache(
			article,
			props.setCache,
			render,
			container,
			readerStore,
			displayContainer,
			measuringContainer,
		);
	});

	return (
		<article
			id="display-area"
			ref={(el) => (displayContainer = el)}
			class="whitespace-pre-wrap"
			style={{
				width: "100%",
				height: "80vh",
				border: "1px solid #ccc",
				padding: "20px",
				overflow: "hidden",
				"font-size": "16px",
				"line-height": "1.8",
				"font-family": "serif",
				"white-space": "pre-wrap",
			}}
		/>
	);
};

export default ArticleRender;
