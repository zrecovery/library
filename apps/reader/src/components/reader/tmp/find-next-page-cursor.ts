import type { Book, Cursor } from "@/components/reader/tmp/schema";
const MAX_CURSOR_ADJUSTMENT = 4;
const getNextLine = (text: string, start_cursor: number): number => {
	const result = text.indexOf("\n", start_cursor);
	if (result === -1) {
		return text.length;
	}
	return result + 1;
};
const adjustEmojiCursor = (text: string, end: number): number => {
	if (end >= text.length) {
		return end;
	}

	const segmenter = new Intl.Segmenter(undefined, {
		granularity: "grapheme",
	});

	for (const segment of segmenter.segment(text)) {
		const segmentStart = segment.index;
		const segmentEnd = segmentStart + segment.segment.length;

		// end 落在这个 grapheme 内部
		if (segmentStart < end && end < segmentEnd) {
			return segmentEnd;
		}

		// 已经到 end 后面，不需要继续查
		if (segmentStart >= end) {
			break;
		}
	}

	return end;
};
export const findNextPageCursor = (
	container: HTMLElement,
	book: Book,
	start: number,
): Cursor => {
	const findFirstOverflowLine = (start: number) => {
		const next = getNextLine(book.content, start);

		const p = document.createElement("p");
		p.textContent = book.content.substring(start, next);
		container.appendChild(p);
		if (container.clientHeight < container.scrollHeight) {
			p.remove();
			return { start: start, end: next }; // 溢出，返回当前行
		}
		if (next === book.content.length) {
			return { start: start, end: next }; // 文本结束
		}

		return findFirstOverflowLine(next);
	};
	const lineRange = findFirstOverflowLine(start);
	if (lineRange.end === book.content.length) {
		return book.content.length;
	}
	const last_p = document.createElement("p");
	container.appendChild(last_p);
	// 二分查找精确位置（尾递归）
	const binarySearch = (low: number, high: number) => {
		// 应对单行长过单页情况
		if (low === start) {
			const codePoint = book.content.codePointAt(start);

			if (codePoint === undefined) {
				return start;
			}

			// 应对emoji字符
			const next = start + 1;

			last_p.textContent = book.content.substring(start, next);

			return next;
		}
		if (high - low <= 1) {
			// 精度足够，返回 low（可渲染的最大位置）
			return low;
		}
		const mid = Math.floor((low + high) / 2);
		last_p.textContent = book.content.substring(start, mid);
		if (container.clientHeight < container.scrollHeight) {
			// 溢出，缩小上界
			return binarySearch(low, mid);
		} else {
			// 未溢出，提高下界
			return binarySearch(mid, high);
		}
	};

	const last = binarySearch(lineRange.start, lineRange.end);

	return adjustEmojiCursor(book.content, last);
};
