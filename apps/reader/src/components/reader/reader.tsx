import { type Component, createMemo, createSignal } from "solid-js";

import ReaderPagination from "@/components/reader/pagination";
import ReaderSlider from "@/components/reader/ReaderSlider";

import ArticleRender from "@/components/reader/article";

const Reader: Component<{ article: string }> = (props) => {
	const [getCurrentPage, setCurrentPage] = createSignal(1);
	const [getCache, setCache] = createSignal([{ page: 1, start: 0 }]);
	const getTotalPage = createMemo(() => {
		return getCache().length;
	});

	return (
		<div>
			<ArticleRender
				article={props.article}
				current={getCurrentPage()}
				getCache={getCache}
				setCache={setCache}
			/>

			<ReaderPagination
				count={getTotalPage}
				setCount={setCurrentPage}
				current={getCurrentPage}
			/>
			<ReaderSlider
				value={getCurrentPage}
				max={getTotalPage}
				change={setCurrentPage}
			/>
		</div>
	);
};

export default Reader;
