import { useParams } from "@solidjs/router";
import { createResource, Show } from "solid-js";
import { getArticleDetail } from "~/libs/repositroy/web";

export default function ArticleDetail() {
	const params = useParams();
	const id = Number(params.id);
	const [article] = createResource(async () => {
		const response = await getArticleDetail(id).get();
		return response.data;
	});

	return (
		<div class="grid gap-6">
			<div class="grid gap-2">
				<div class="grid pa-4">
					<Show when={article()} fallback={<h1>loading...</h1>}>
						<article>
							<h1 class="title ">{article()?.detail.title}</h1>

							<div class="body break-all whitespace-nowrap">
								{article()?.detail.body}
							</div>
						</article>
					</Show>
				</div>
			</div>
		</div>
	);
}
