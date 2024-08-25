import { useParams } from "@solidjs/router";
import { createMemo, createResource, Show } from "solid-js";
import { ArticleCardRow } from "~/components/ArticleCardRow";
import GridList from "~/components/GridList";
import { getSeriesDetail } from "~/libs/repositroy/web";

export default function ArticleDetail() {
	const params = useParams();
	const id = Number(params.id);
	const [series] = createResource(async () => {
		const response = await getSeriesDetail(id).get();
		return response.data;
	});
	const articles = createMemo(() =>
		series()?.articles.map((a) => {
			return {
				...a,
				book: series()?.title,
				authors: series()?.authors,
			};
		}),
	);
	return (
		<Show when={articles()}>
			<GridList list={articles()!}>{ArticleCardRow}</GridList>
		</Show>
	);
}
