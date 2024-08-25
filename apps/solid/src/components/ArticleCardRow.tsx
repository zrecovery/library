import { Show } from "solid-js";
import Card from "./Card";

export function ArticleCardRow(item: {
	id: number;
	title: string;
	authors?: Array<{ id: number; name: string }>;
}) {
	return (
		<Show when={item.authors && item.authors[0]}>
			<Card
				identity={item.id}
				title={item.title}
				author={item.authors![0].name}
			/>
		</Show>
	);
}
