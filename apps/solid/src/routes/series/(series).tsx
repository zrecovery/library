import { createResource, Show } from "solid-js";
import GridList from "~/components/GridList";
import { SeriesCardRow } from "~/components/SeriesCardRow";
import { getSeries } from "~/libs/repositroy/web";

export default function SeriesList() {
	const [seriesList] = createResource(async () => {
		const response = await getSeries({});
		return response.data;
	});

	return (
		<Show when={seriesList()}>
			<GridList list={seriesList()!.detail}>{SeriesCardRow}</GridList>
		</Show>
	);
}
