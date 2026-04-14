import { createSignal } from "solid-js";
import { getCache, setCache } from "./db";
import { Value } from "@sinclair/typebox/value";
import { Type } from "@sinclair/typebox";
import type { Id } from "@library/domain";

type ReaderSignals = {
  setCurrentPage: (n: number) => void;
  setTotal: (n: number) => void;
};

const getPagesFromIdx = async (id: Id) => {
  const pageFromCache = await getCache(String(id));
  try {
    return Value.Parse(Type.Array(Type.Integer()), pageFromCache);
  } catch {
    return [];
  }
};

export const useReader = async (
  body: () => string | undefined,
  container: () => HTMLElement | undefined,
  signals: ReaderSignals,
  id: number,
) => {
  const [pageIndex, setPageIndex] = createSignal<number[]>([]);

  async function build() {
    let pages: number[] = [];

    const pagesCache = await getPagesFromIdx(id);

    if (pagesCache.length > 0) {
      pages = pagesCache;
    } else {
      pages = [];
      const el = container();
      const text = body();
      if (!el || !text) return;

      const measure = document.createElement("div");

      const style = getComputedStyle(el);

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

      console.log(`[PageHeight]: ${pageHeight}`);

      let start = 0;

      while (start < lines.length) {
        measure.textContent = "";

        let end = start;

        while (end < lines.length) {
          measure.textContent += lines[end] + "\n";
          measure.style.position = "absolute";
          measure.style.visibility = "hidden";
          const lineHeight =
            parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
          const safeHeight = pageHeight - 3 * lineHeight;
          if (measure.scrollHeight > safeHeight) break;

          end++;
        }

        if (end === start) end++;

        pages.push(start);
        setCache(String(id), pages);
        start = end;
      }

      document.body.removeChild(measure);
    }
    console.log(pages);
    setPageIndex(pages);
    signals.setTotal(pages.length);
  }

  function getPageContent(page: number) {
    const el = container();
    const text = body();
    const idx = pageIndex();

    if (!el || !text || idx.length === 0) return "";

    const lines = text.split("\n");

    const start = idx[page] ?? 0;
    const end = idx[page + 1] ?? lines.length;

    return lines.slice(start, end).join("\n");
  }

  return {
    build,
    getPageContent,
    pageIndex,
  };
};
