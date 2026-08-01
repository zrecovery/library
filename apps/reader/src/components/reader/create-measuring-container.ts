import { createMeasuringContainer } from "@/components/reader/copy-container";

export const getMeasuringContainer = () => {
	return createMeasuringContainer(document.getElementById("display-area"));
};
