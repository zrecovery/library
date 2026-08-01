import { createSignal, onMount, onCleanup } from "solid-js";

export function useViewport() {
	const [width, setWidth] = createSignal(window.innerWidth);
	const [height, setHeight] = createSignal(window.innerHeight);

	const update = () => {
		setWidth(window.innerWidth);
		setHeight(window.innerHeight);
	};

	onMount(() => {
		window.addEventListener("resize", update);
	});

	onCleanup(() => {
		window.removeEventListener("resize", update);
	});

	return {
		width,
		height,
	};
}
