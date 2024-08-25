import { A } from "@solidjs/router";

export default function Card(props: {
	identity: number;
	title: string;
	author: string;
}) {
	return (
		<div class="group flex flex-col items-start gap-2 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/50">
			<A href={`/articles/${props.identity}`}>
				<div class="text-sm font-medium group-hover:underline">
					{props.title}
				</div>
			</A>
			<div class="text-xs text-muted-foreground">{props.author}</div>
		</div>
	);
}
