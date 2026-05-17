/**
 * 文章详情页 — CSS multi-column 列式阅读器
 */

import { Separator } from "@/components/ui/separator";
import { getArticleDetail } from "@/libs/api";
import { useParams } from "@solidjs/router";
import {
  createEffect,
  createResource,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import { getCurrentPageCache, setCurrentPageCache } from "./db";
import ReaderPagination from "@/components/reader-pagination";
import {
  COLUMN_GAP,
  computeAvailableWidth,
  computePageOffset,
  computeTotalPages,
  type LayoutSnapshot,
  PAGE_TRANSITION,
  renderFullText,
} from "./column-reader-engine";

const SAVE_DEBOUNCE_MS = 500;
const RESIZE_DEBOUNCE_MS = 200;

const ArticleDetailPage = () => {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [article] = createResource(id, async (id) => {
    const response = await getArticleDetail(id);
    return response.data;
  });

  const [currentPage, setCurrentPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(10);

  let containerRef!: HTMLDivElement;
  let textWrapper!: HTMLDivElement;
  let layout: LayoutSnapshot = { columnWidth: 0, totalPages: 1 };
  let built = false;
  let initialized = false;

  const goToPage = (page: number, animate: boolean): void => {
    if (!textWrapper || layout.totalPages <= 1) return;
    const offset = computePageOffset(page, layout, COLUMN_GAP);
    textWrapper.style.transform = `translateX(${offset}px)`;
    textWrapper.style.transition = animate ? PAGE_TRANSITION : "none";
  };

  const turnPage = (page: number): void => {
    const clamped = Math.max(1, Math.min(page, layout.totalPages));
    goToPage(clamped, true);
    setCurrentPage(clamped);
  };

  const build = (): void => {
    const articleData = article();
    if (built || !containerRef || !articleData?.body) return;
    built = true;

    // 1. 创建 textWrapper
    textWrapper = document.createElement("div");
    textWrapper.className = "absolute top-0 bottom-0 left-0";
    textWrapper.style.columnFill = "auto";
    textWrapper.style.columnGap = `${COLUMN_GAP}px`;
    textWrapper.style.overflow = "hidden";
    textWrapper.style.willChange = "transform";

    containerRef.style.position = "relative";
    containerRef.innerHTML = "";
    containerRef.appendChild(textWrapper);

    // 2. 列宽 & 渲染全文
    textWrapper.style.columnWidth = `${computeAvailableWidth(containerRef)}px`;
    renderFullText(textWrapper, articleData.body);

    // 3. 计算总页数（同时展开 textWrapper 宽度）
    layout = computeTotalPages(textWrapper, COLUMN_GAP);
    setTotalPages(layout.totalPages);

    // 4. 恢复进度
    getCurrentPageCache(`article-${id}`).then((cachedPage) => {
      const saved = cachedPage.match({ ok: (v) => v, err: () => 1 });
      const target = Math.max(1, Math.min(saved, layout.totalPages));
      goToPage(target, false);
      setCurrentPage(target);
      initialized = true;
    });
  };

  onMount(() => {
    if (article()?.body) build();
  });

  createEffect(() => {
    if (article()?.body && containerRef && !built) build();
  });

  // resize
  let resizeTimer: ReturnType<typeof setTimeout>;
  let lastWidth = 0;

  onMount(() => {
    if (!containerRef) return;
    const ro = new ResizeObserver((entries) => {
      const first = entries[0];
      if (!first) return;
      const w = Math.round(first.contentRect.width);
      if (w === lastWidth) return;
      lastWidth = w;

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!textWrapper || !containerRef) return;
        textWrapper.style.columnWidth = `${computeAvailableWidth(containerRef)}px`;
        layout = computeTotalPages(textWrapper, COLUMN_GAP);
        setTotalPages(layout.totalPages);
        if (currentPage() > layout.totalPages) {
          goToPage(layout.totalPages, false);
          setCurrentPage(layout.totalPages);
        } else {
          goToPage(currentPage(), false);
        }
      }, RESIZE_DEBOUNCE_MS);
    });
    ro.observe(containerRef);
    onCleanup(() => ro.disconnect());
  });

  // 进度保存 debounce
  let saveTimer: ReturnType<typeof setTimeout>;

  const scheduleSave = (): void => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const page = currentPage();
      if (initialized && page > 0) {
        setCurrentPageCache(`article-${id}`, page);
      }
    }, SAVE_DEBOUNCE_MS);
  };

  createEffect(() => {
    if (!initialized) return;
    scheduleSave();
  });

  onCleanup(() => {
    clearTimeout(saveTimer);
    const page = currentPage();
    if (initialized && page > 0) {
      setCurrentPageCache(`article-${id}`, page);
    }
  });

  return (
    <Show when={article()}>
      <div class="grid md:grid-cols-[min(10rem)_1fr] h-full">
        <aside>
          <h2>{article()?.author.name}</h2>
        </aside>
        <main class="grid grid-rows-[auto_auto_1fr_auto] h-full">
          <h1>{article()?.title}</h1>
          <Separator />
          <article
            ref={containerRef}
            class="relative overflow-hidden min-h-0"
          />
          <div class="p-[2rem]">
            <ReaderPagination
              pages={totalPages}
              change={(p): void => {
                const n = typeof p === "function" ? p(currentPage()) : p;
                turnPage(n);
              }}
              current={currentPage}
            />
          </div>
        </main>
      </div>
    </Show>
  );
};

export default ArticleDetailPage;
