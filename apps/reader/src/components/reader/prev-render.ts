"use strict";
import { DOMElement } from "solid-js/jsx-runtime";

const getPrevLineStart = (text: string, end_cursor: number): number => {
    const idx = text.lastIndexOf("\n", end_cursor - 1);
    console.log(`idx: ${idx}`);
    return idx === -1 ? 0 : idx;
};

export const prevRender = (
    text: string,
    container: DOMElement,
    currentStart: number,
): number => {
    if (currentStart === 0) {
        container.textContent = "";
        return 0;
    }

    // 阶段1：按行粗分，找到 [溢出点, 安全点]
    const findFirstOverflowLine = (safeStart: number, candidateStart: number) => {
        const nextStart = getPrevLineStart(text, candidateStart);
        container.textContent = text.substring(nextStart, currentStart);
        const isOverflow = container.clientHeight < container.scrollHeight;
        console.log(`next: ${nextStart}`);

        if (isOverflow) {
            return { overflow: nextStart, safe: safeStart };
        }
        if (nextStart === 0) {
            return { overflow: 0, safe: 0 };
        }
        return findFirstOverflowLine(nextStart, nextStart);
    };

    const lineRange = findFirstOverflowLine(currentStart, currentStart);
    console.log(`lineRange: ${lineRange}`);
    if (lineRange.overflow === lineRange.safe) {
        // 无法找到溢出点（所有起点都安全），显示全部内容
        container.textContent = text.substring(0, currentStart);
        return 0;
    }

    // 阶段2：在 [overflow, safe] 区间二分查找最小安全起始点
    const binarySearch = (low: number, high: number): number => {
        if (high - low <= 1) {
            return high; // high 是安全点，即为最小的安全起始点
        }
        const mid = Math.floor((low + high) / 2);
        container.textContent = text.substring(mid, currentStart);
        const isOverflow = container.clientHeight < container.scrollHeight;

        if (isOverflow) {
            // mid 溢出，最小安全点在 [mid, high]
            return binarySearch(mid, high);
        } else {
            // mid 安全，最小安全点在 [low, mid]
            return binarySearch(low, mid);
        }
    };

    const prevStart = binarySearch(lineRange.overflow, lineRange.safe);
    container.textContent = text.substring(prevStart, currentStart);
    return prevStart;
};
