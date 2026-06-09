import { createSignal } from "solid-js";
import { getCache, getCurrentPageCache, setCache } from "./db";

interface ReaderSignals {
  setCurrentPage: (n: number) => void;
  setTotal: (n: number) => void;
}

/** 当前排版缓存键（供外部读取，用于存储当前页码） */
let currentKey = "";

/**
 * 生成排版缓存键。
 * 基于容器宽度、字体大小、行高、字体族和 padding 拼接，
 * 故意排除 height —— 避免窗口高度变化导致缓存失效（宽度不变时排版结果相同）。
 */
const getLayoutKey = (
  id: number,
  el: HTMLElement,
  style: CSSStyleDeclaration,
) => {
  // ❗去掉 height，避免缓存失效
  return `${id}-${el.clientWidth}-${style.fontSize}-${style.lineHeight}-${style.fontFamily}-${style.padding}`;
};

/** 构建测量元素的 CSS 样式字符串。复制容器的主要排版属性，隐藏该元素用于测量。 */
function buildMeasureStyle(
  containerWidth: number,
  style: CSSStyleDeclaration,
): string {
  return [
    "position: absolute",
    "visibility: hidden",
    `width: ${containerWidth}px`,
    `font-size: ${style.fontSize}`,
    `line-height: ${style.lineHeight}`,
    `font-family: ${style.fontFamily}`,
    "white-space: pre-wrap",
    "word-break: break-word",
    `padding: ${style.padding}`,
    `box-sizing: ${style.boxSizing}`,
  ].join(";");
}

/**
 * 逐行填充测量算法 — 将文本按自然行拆分后逐行填入隐藏的测量元素，
 * 当 scrollHeight 超过页面高度时切分新页，记录每页的起始行号。
 *
 * 策略：外层循环逐页切分，内层循环逐行累加并对比 scrollHeight，
 * 超过页面高度则回退（不包含当前行），完成一页后继续处理剩余行。
 */
async function doBuild(
  el: HTMLElement,
  text: string,
  style: CSSStyleDeclaration,
) {
  const measure = document.createElement("div");
  measure.style.cssText = buildMeasureStyle(el.clientWidth, style);
  document.body.appendChild(measure);

  const lines = text.split("\n");
  const pageHeight = el.clientHeight;

  const pages: number[] = [];
  let lineStart = 0;

  while (lineStart < lines.length) {
    let buffer = "";
    let lineEnd = lineStart;

    while (lineEnd < lines.length) {
      const next = buffer + lines[lineEnd] + "\n";
      measure.textContent = next;

      if (measure.scrollHeight > pageHeight) break;

      buffer = next;
      lineEnd++;
    }

    pages.push(lineStart);
    lineStart = lineEnd;
  }

  document.body.removeChild(measure);

  return pages;
}

export const useReader = async (
  body: () => string | undefined,
  container: () => HTMLElement | undefined,
  signals: ReaderSignals,
  id: number,
) => {
  const [pageIndex, setPageIndex] = createSignal<number[]>([]);

  async function build() {
    await rebuild(true);
  }

  function getKey() {
    return currentKey;
  }

  async function rebuild(initial = false) {
    const el = container();
    const text = body();
    if (!el || !text) return;

    const style = getComputedStyle(el);
    const key = getLayoutKey(id, el, style);

    currentKey = key;

    // ✅ 先尝试读取缓存 — 如果布局参数未变，直接复用已有的分页结果
    // 缓存命中逻辑：用 layoutKey 查询 IndexedDB，命中则跳过昂贵的逐行测量，直接恢复分页和当前页码。
    const cached = await getCache(key);
    const currentCached = await getCurrentPageCache(key);

    if (cached.isOk() && cached.unwrap().length > 0) {
      const idx = cached.unwrap();

      setPageIndex(idx);

      // 恢复上次阅读的页码（如果有）
      if (currentCached.isOk()) {
        queueMicrotask(() => {
          const page = currentCached.unwrap();
          const safePage = Math.min(page, idx.length - 1); // 防止超过总页数

          signals.setCurrentPage(safePage);
        });
      }

      signals.setTotal(idx.length);
      return; // ⭐⭐⭐ 核心：命中缓存直接退出，不做重复计算
    }

    // ❗缓存未命中时才执行昂贵的逐行测量计算
    const pages = await doBuild(el, text, style);

    setPageIndex(pages);
    signals.setTotal(pages.length);

    await setCache(key, pages);
  }

  /** 获取指定页码的文本内容（按行号切片） */
  function getPageContent(page: number) {
    const text = body();
    const idx = pageIndex();

    if (!text || idx.length === 0) return "";

    const lines = text.split("\n");

    const start = idx[page] ?? 0;
    const end = idx[page + 1] ?? lines.length;

    return lines.slice(start, end).join("\n");
  }

  return {
    build,
    rebuild,
    getPageContent,
    pageIndex,
    getLayoutKey, // 暴露给外部，用于存储当前页码到 IndexedDB
    getKey,
  };
};
