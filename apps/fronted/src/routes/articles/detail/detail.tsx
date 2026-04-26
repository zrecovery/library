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

// ── 常量 ─────────────────────────────────
const COLUMN_GAP = 32;
const MAX_CONTENT_LENGTH = 2 ** 16;

// ── 纯工具 ─────────────────────────────────
const ignoreSpaces = (text: string, cursor: number): number => {
  let pos = cursor;
  while (pos < text.length && text[pos] === " ") pos++;
  return pos;
};

const truncateAtParagraph = (
  text: string,
  start: number,
  maxLength: number,
) => {
  const end = Math.min(start + maxLength, text.length);
  if (end >= text.length)
    return { slice: text.slice(start, end), endCursor: end };
  const sub = text.slice(start, end);
  const lastBreak = sub.lastIndexOf("\n");
  const trunc = lastBreak > 0 ? sub.slice(0, lastBreak) : sub;
  return { slice: trunc, endCursor: start + trunc.length };
};

// ── 组件 ─────────────────────────────────
const ArticleDetailPage = () => {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [article] = createResource(id, async (id) => {
    const response = await getArticleDetail(id);
    return response.data;
  });

  // 分页信号（页码从 1 开始）
  const [currentPage, setCurrentPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(10);

  // DOM 引用
  let containerRef!: HTMLDivElement;
  let textWrapper!: HTMLDivElement;
  let built = false;
  let afterInitialLayout = false; // 只在此声明一次

  // 工具方法
  const getAvailableWidth = () => {
    if (!containerRef) return 360;
    const style = window.getComputedStyle(containerRef);
    return (
      containerRef.clientWidth -
      parseFloat(style.paddingLeft || "0") -
      parseFloat(style.paddingRight || "0")
    );
  };

  const computeColumnWidth = () => getAvailableWidth();

  /** 将文本渲染成 <p> 列表 */
  const renderContent = (text: string, startCursor: number) => {
    const start = ignoreSpaces(text, startCursor);
    const { slice } = truncateAtParagraph(text, start, MAX_CONTENT_LENGTH);
    textWrapper.textContent = "";
    let cursor = start;

    slice.split(/\n/).forEach((line) => {
      const p = document.createElement("p");
      p.className = "m-0 indent-2em leading-relaxed";
      p.dataset.start = String(cursor);
      p.textContent = line;
      textWrapper.appendChild(p);
      cursor += line.length + 1;
    });
  };

  /** 重新计算总列数（基于容器可视宽度） */
  const updateTotalPages = () => {
    if (!textWrapper) return;
    const colWidth = parseFloat(textWrapper.style.columnWidth);
    if (!colWidth || colWidth <= 0) {
      setTotalPages(1);
      return;
    }
    textWrapper.style.width = "auto";
    const totalWidth = textWrapper.scrollWidth;
    const total = Math.max(1, Math.round(totalWidth / (colWidth + COLUMN_GAP)));
    setTotalPages(total);
    textWrapper.style.width = `${totalWidth}px`;
  };

  // 只操作 DOM，不改信号
  const goToPage = (page: number, animate = true) => {
    if (!textWrapper || totalPages() <= 0) return;
    const colWidth = parseFloat(textWrapper.style.columnWidth);
    const targetColumn = Math.max(0, Math.min(page - 1, totalPages() - 1));
    const offset = -targetColumn * (colWidth + COLUMN_GAP);
    textWrapper.style.transform = `translateX(${offset}px)`;
    textWrapper.style.transition = animate ? "transform 0.3s ease" : "none";
  };

  /** 初始化分页（改为异步，以便正确读取缓存） */
  const build = async () => {
    if (built || !containerRef || !article()?.body) return;
    built = true;

    textWrapper = document.createElement("div");
    textWrapper.className = "absolute top-0 bottom-0 left-0";
    textWrapper.style.columnFill = "auto";
    textWrapper.style.columnGap = `${COLUMN_GAP}px`;
    textWrapper.style.overflow = "hidden";
    textWrapper.style.willChange = "transform";

    containerRef.style.position = "relative";
    containerRef.innerHTML = "";
    containerRef.appendChild(textWrapper);

    // 等下一帧设置列宽与内容
    await new Promise((r) => requestAnimationFrame(r));
    textWrapper.style.columnWidth = `${computeColumnWidth()}px`;
    renderContent(article()!.body, 0);

    // 再等下一帧计算总页数并恢复进度
    await new Promise((r) => requestAnimationFrame(r));
    updateTotalPages();

    // ★ 异步读取缓存
    const cachedPage = await getCurrentPageCache(`article-${id}`);

    const total = totalPages();

    const target = cachedPage.match({
      ok: (val) => Math.min(val, total),
      err: (e) => 1,
    });

    goToPage(target, false);
    setCurrentPage(target);
    afterInitialLayout = true; // 之后翻页才会保存
  };

  // ── 生命周期 ────────────────────────────────
  onMount(() => {
    if (article()?.body) build();
  });

  // 如果文章在挂载后才返回
  createEffect(() => {
    if (article()?.body && containerRef && !built) {
      build();
    }
  });

  // 监听窗口宽度变化（防抖 200ms）
  let resizeTimer: number;
  let lastWidth = 0;
  onMount(() => {
    if (!containerRef) return;
    const ro = new ResizeObserver((entries) => {
      const width = Math.round(entries[0].contentRect.width);
      if (width === lastWidth) return;
      lastWidth = width;
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!textWrapper || !containerRef) return;
        textWrapper.style.columnWidth = `${computeColumnWidth()}px`;
        updateTotalPages();
        if (currentPage() > totalPages()) {
          setCurrentPage(totalPages());
        }
        goToPage(currentPage(), false);
      }, 200);
    });
    ro.observe(containerRef);
    onCleanup(() => ro.disconnect());
  });

  // 翻页时保存进度（初始化阶段不保存）
  createEffect(() => {
    const page = currentPage();
    if (!afterInitialLayout) return;
    if (page > 0 && totalPages() > 0) {
      setCurrentPageCache(`article-${id}`, page);
    }
  });

  // 组件卸载时再保存一次
  onCleanup(() => {
    const page = currentPage();
    if (afterInitialLayout && page > 0 && totalPages() > 0) {
      setCurrentPageCache(`article-${id}`, page);
    }
  });

  // 当 currentPage 变化时翻页
  createEffect(() => {
    if (!built) return;
    goToPage(currentPage());
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
              change={(p) => setCurrentPage(p)}
              current={currentPage}
            />
          </div>
        </main>
      </div>
    </Show>
  );
};

export default ArticleDetailPage;
