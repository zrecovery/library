import { createSignal } from "solid-js";
import { getCache, getCurrentPageCache, setCache } from "./db";

type ReaderSignals = {
  setCurrentPage: (n: number) => void;
  setTotal: (n: number) => void;
};
let currentKey = "";
const getLayoutKey = (
  id: number,
  el: HTMLElement,
  style: CSSStyleDeclaration,
) => {
  // ❗去掉 height，避免缓存失效
  return `${id}-${el.clientWidth}-${style.fontSize}-${style.lineHeight}-${style.fontFamily}-${style.padding}`;
};

async function doBuild(
  el: HTMLElement,
  text: string,
  style: CSSStyleDeclaration,
) {
  const measure = document.createElement("div");

  measure.style.cssText = `
    position: absolute;
    visibility: hidden;
    width: ${el.clientWidth}px;
    font-size: ${style.fontSize};
    line-height: ${style.lineHeight};
    font-family: ${style.fontFamily};
    white-space: pre-wrap;
    word-break: break-word;
    padding: ${style.padding};
    box-sizing: ${style.boxSizing};
  `;

  document.body.appendChild(measure);

  const lines = text.split("\n");
  const pageHeight = el.clientHeight;

  let pages: number[] = [];
  let start = 0;

  while (start < lines.length) {
    let buffer = "";
    let end = start;

    while (end < lines.length) {
      const next = buffer + lines[end] + "\n";
      measure.textContent = next;

      if (measure.scrollHeight > pageHeight) break;

      buffer = next;
      end++;
    }

    pages.push(start);
    start = end;
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
    // ✅ 先尝试缓存
    const cached = await getCache(key);
    const currentCached = await getCurrentPageCache(key);

    if (cached.isOk() && cached.unwrap().length > 0) {
      const idx = cached.unwrap();

      setPageIndex(idx);

      if (currentCached.isOk()) {
        queueMicrotask(() => {
          const page = currentCached.unwrap();
          const safePage = Math.min(page, idx.length - 1);

          signals.setCurrentPage(safePage);
        });
      }

      signals.setTotal(idx.length);
      return; // ⭐⭐⭐ 核心：命中缓存直接退出
    }

    // ❗没有缓存才计算
    const pages = await doBuild(el, text, style);

    setPageIndex(pages);
    signals.setTotal(pages.length);

    await setCache(key, pages);
  }

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
    getLayoutKey, // 暴露给外部写 currentPage
    getKey,
  };
};
