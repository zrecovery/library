import { Separator } from "@/components/ui/separator";
import { getArticleDetail } from "@/libs/api";
import { useParams } from "@solidjs/router";
import { createEffect, createResource, Show } from "solid-js";

import { createSignal } from "solid-js";

type ReaderSignals = {
  setCurrentPage: (n: number) => void;
  setTotal: (n: number) => void;
};

export function useReader(
  body: () => string | undefined,
  container: () => HTMLElement | undefined,
  signals: ReaderSignals,
) {
  const [pageIndex, setPageIndex] = createSignal<number[]>([]);

  function build() {
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

    const pages: number[] = [];

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
      start = end;
    }

    setPageIndex(pages);
    signals.setTotal(pages.length);

    document.body.removeChild(measure);
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

const ArticleDetailPage = () => {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [article] = createResource(id, async (id) => {
    const response = await getArticleDetail(id);
    return response.data;
  });

  // =========================
  // Reader state（你要的 signals）
  // =========================
  const [currentPage, setCurrentPage] = createSignal(0);
  const [total, setTotal] = createSignal(0);

  let containerRef!: HTMLDivElement;

  const reader = useReader(
    () => article()?.body,
    () => containerRef,
    { setCurrentPage, setTotal },
  );

  // =========================
  // 数据加载后 build分页
  // =========================
  createEffect(() => {
    if (article()?.body && containerRef) {
      reader.build();
    }
  });

  return (
    <Show when={article()}>
      <div class="grid md-grid-auto-cols-2 h-full md-grid-cols-[min(10rem)_1fr]">
        <aside>
          <h2>{article()?.author.name}</h2>

          <div class="text-sm opacity-60">
            Page {currentPage() + 1} / {total()}
          </div>

          <button
            onClick={() => {
              const p = currentPage();
              if (p > 0) {
                setCurrentPage(p - 1);
                containerRef.textContent = reader.getPageContent(p - 1);
              }
            }}
          >
            Prev
          </button>

          <button
            onClick={() => {
              const p = currentPage();
              if (p + 1 < total()) {
                setCurrentPage(p + 1);
                containerRef.textContent = reader.getPageContent(p + 1);
              }
            }}
          >
            Next
          </button>
        </aside>

        <main class="h-full">
          <h1>{article()?.title}</h1>
          <Separator />

          {/* Reader container */}
          <article
            ref={containerRef}
            class="whitespace-pre-wrap word-wrap h-full"
          >
            {reader.getPageContent(currentPage())}
          </article>
        </main>
      </div>
    </Show>
  );
};

export default ArticleDetailPage;
