import { onCleanup, onMount } from "solid-js";

export function useResize(callback: () => void) {
	let frame = 0;

	const handler = () => {
		console.log(`resize`);
		cancelAnimationFrame(frame);

		frame = requestAnimationFrame(() => {
			callback();
		});
	};

	onMount(() => {
		callback();
		window.addEventListener("resize", handler);
	});

	onCleanup(() => {
		window.removeEventListener("resize", handler);
		cancelAnimationFrame(frame);
	});
}
