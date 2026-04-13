import { createSignal } from "solid-js";
import { getCache, setCache } from "./db";

type ReaderSignals = {
  setCurrentPage: (n: number) => void;
  setTotal: (n: number) => void;
};

export async function useReader(
  body: () => string | undefined,
  container: () => HTMLElement | undefined,
  signals: ReaderSignals,
  id: number,
) {
  const [pageIndex, setPageIndex] = createSignal<number[]>([]);

  async function build() {
    let pages: number[] = [];
    const pa = await getCache(String(id));
    if (pa.length > 1) {
      console.log(pa);
      pages = pa;
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
    `;

      document.body.appendChild(measure);

      const lines = text.split("\n");
      const pageHeight = el.clientHeight;

      let start = 0;

      while (start < lines.length) {
        measure.textContent = "";

        let end = start;

        while (end < lines.length) {
          measure.textContent += lines[end] + "\n";
          const style = getComputedStyle(el);
          measure.style.cssText = style.cssText;
          measure.style.position = "absolute";
          measure.style.visibility = "hidden";
          const lineHeight =
            parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
          const safeHeight = pageHeight - 2 * lineHeight;
          if (measure.scrollHeight > safeHeight) break;

          end++;
        }

        if (end === start) end++;

        pages.push(start);
        setCache(String(id), pages);
        start = end;
      }

      console.log(pages)
      setPageIndex(pages);
      signals.setTotal(pages.length);

      document.body.removeChild(measure);
    }
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
}
