import { For, JSX } from "solid-js";

export default function GridList<T>(props: {
	list: Array<T>;
	children: (item: T, index: number) => JSX.Element;
}) {
	return (
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
			<For each={props.list}>
				{(item, index) => {
					return props.children(item, index());
				}}
			</For>
		</div>
	);
}
