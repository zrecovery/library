// 创建测量容器的辅助函数
export const createMeasuringContainer = (
	targetContainer: HTMLElement | null,
) => {
	const styles = window.getComputedStyle(targetContainer || document.body);
	const measuringContainer = document.createElement("div");

	// 复制关键样式
	measuringContainer.style.width = styles.width || "100%";
	measuringContainer.style.height = styles.height || "100%";

	measuringContainer.style.fontSize = styles.fontSize;
	measuringContainer.style.fontFamily = styles.fontFamily;
	measuringContainer.style.lineHeight = styles.lineHeight;
	measuringContainer.style.wordBreak = styles.wordBreak;
	measuringContainer.style.padding = styles.padding;
	measuringContainer.style.boxSizing = styles.boxSizing;
	measuringContainer.style.whiteSpace = styles.whiteSpace;

	// 隐藏测量容器
	measuringContainer.style.position = "absolute";
	measuringContainer.style.left = "-9999px";
	measuringContainer.style.top = "0";
	measuringContainer.style.visibility = "hidden";
	measuringContainer.style.pointerEvents = "none";

	document.body.appendChild(measuringContainer);
	return measuringContainer;
};
