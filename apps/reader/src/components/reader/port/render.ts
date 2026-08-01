import { DOMElement } from "solid-js/jsx-runtime";

export type Render = (
	text: string,
	container: DOMElement,
	start_cursor?: number,
) => number;
