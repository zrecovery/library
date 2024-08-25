import { createResource, Show } from "solid-js";
import { ArticleCardRow } from "~/components/ArticleCardRow";
import Card from "~/components/Card";
import GridList from "~/components/GridList";
import { getArticles } from "~/libs/repositroy/web";

export default function Index() {
	const [articles] = createResource(async () => {
		const response = await getArticles({ page: 1, size: 10 });
		return response.data;
	});
	return (
		<main class="flex-1 overflow-auto p-4 sm:p-6">
			<div class="grid gap-6">
				<div class="grid gap-2">
					<h2 class="text-2xl font-bold">文章</h2>
					<Show when={articles()}>
						<GridList list={articles()!.detail}>{ArticleCardRow}</GridList>
					</Show>
				</div>
				<div class="grid gap-2">
					<h2 class="text-2xl font-bold">系列</h2>
					<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
						<Card identity={5} title="The Witcher" author="Andrzej Sapkowski" />
						<Card
							identity={6}
							title="A Song of Ice and Fire"
							author="George R.R. Martin"
						/>
						<Card
							identity={7}
							title="The Lord of the Rings"
							author="J.R.R. Tolkien"
						/>
						<Card identity={8} title="Harry Potter" author="J.K. Rowling" />
					</div>
				</div>
			</div>
		</main>
	);
}
