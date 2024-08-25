import { createResource, Show } from "solid-js";
import { ArticleCardRow } from "~/components/ArticleCardRow";
import GridList from "~/components/GridList";
import { getArticles } from "~/libs/repositroy/web";
export default function ArticleList() {
	const [articles] = createResource(async () => {
		const response = await getArticles({});
		return response.data;
	});

	return (
		<Show when={articles()}>
			<GridList list={articles()!.detail}>{ArticleCardRow}</GridList>
		</Show>
	);
}
