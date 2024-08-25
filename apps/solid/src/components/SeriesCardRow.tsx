import { A } from "@solidjs/router";

export function SeriesCard(props: { identity: number; title: string }) {
	return (
		<div class="group flex flex-col items-start gap-2 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/50">
			<A href={`/series/${props.identity}`}>
				<div class="text-sm font-medium group-hover:underline">
					{props.title}
				</div>
			</A>
		</div>
	);
}

export function SeriesCardRow(item: { id: number; title: string }) {
	return <SeriesCard identity={item.id} title={item.title} />;
}
