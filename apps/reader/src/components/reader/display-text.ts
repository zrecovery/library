export const displayText = (text: string, displayContainer?: HTMLElement) => {
	if (displayContainer) {
		displayContainer.textContent = text;
	}
};
