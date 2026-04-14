// use-reader.ts
import { createSignal } from "solid-js";
import { getCache, setCache } from "./db";
import type { Id } from "@library/domain";

type ReaderSignals = {
  setCurrentPage: (n: number) => void;
  setTotal: (n: number) => void;
};

const getLayoutKey = (id: Id, el: HTMLElement, style: CSSStyleDeclaration) => {
  return `${id}-${el.clientWidth}-${el.clientHeight}-${style.fontSize}-${style.lineHeight}-${style.fontFamily}-${style.padding}`;
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

    if (start < lines.length) {
      pages.push(start);
    }

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

  async function rebuild(initial = false) {
    const el = container();
    const text = body();
    if (!el || !text) return;

    const style = getComputedStyle(el);
    const key = getLayoutKey(id, el, style);

    const cached = await getCache(key);
    if (cached && cached.length > 0) {
      setPageIndex(cached);
      signals.setTotal(cached.length);
      return;
    }

    const oldIdx = pageIndex();
    const oldPage = oldIdx.length ? signals : null;
    const current = oldIdx.length ? oldIdx[0] : 0;

    const pages = await doBuild(el, text, style);

    setPageIndex(pages);
    signals.setTotal(pages.length);

    if (!initial && oldIdx.length > 0) {
      const oldStart = oldIdx[current] ?? 0;
      const newPage = pages.findIndex((i) => i >= oldStart);
      signals.setCurrentPage(newPage === -1 ? 0 : newPage);
    }

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
  };
};
