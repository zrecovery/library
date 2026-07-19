import { DOMElement } from "solid-js/jsx-runtime";

const getNextLine = (text: string, start_cursor: number): number => {
    console.log(`start_cursor: ${start_cursor}`)
    const result = text.indexOf("\n", start_cursor)
    console.log(`Result: ${result}`)
    console.log(`txt:${text.length}`)
    if (result === -1) {
        return text.length
    }
    return result + 1;
}

export const render = (text: string, container: DOMElement, start_cursor = 0) => {
    const findLastSafeLine = (start: number) => {
        const next = getNextLine(text, start);
        container.textContent = text.substring(start_cursor, next);
        console.log(`clientHeight: ${container.clientHeight}`)
        console.log(`scrollHeight: ${container.scrollHeight}`)
        if (container.clientHeight < container.scrollHeight) {
            return { start: start, end: next }; // 溢出，返回当前行
        }
        if (next === text.length) {
            return { start: start, end: next }; // 文本结束
        }

        return findLastSafeLine(next);
    };
    const lineRange = findLastSafeLine(start_cursor);
    // 二分查找精确位置（尾递归）
    const binarySearch = (low: number, high: number) => {
        if (high - low <= 1) {
            // 精度足够，返回 low（可渲染的最大位置）
            return low;
        }
        const mid = Math.floor((low + high) / 2);
        container.textContent = text.substring(start_cursor, mid);
        if (container.clientHeight < container.scrollHeight) {
            // 溢出，缩小上界
            return binarySearch(low, mid);
        } else {
            // 未溢出，提高下界
            return binarySearch(mid, high);
        }
    };
    const finalEnd = binarySearch(lineRange.start, lineRange.end);
    container.textContent = text.substring(start_cursor, finalEnd);
    return finalEnd;
};
