/**
 * 文章详情页 —— 列式分页阅读器
 *
 * 职责分工：
 *   - column-reader-engine.ts  纯函数布局计算 + 可控的 DOM 渲染
 *   - db.ts                    读写 IndexedDB 缓存（分页数据 + 阅读进度）
 *   - detail.tsx (本文件)      组件状态管理、生命周期编排、JSX 渲染
 *
 * 阅读器采用 CSS multi-column 实现列式布局，通过 translateX 做平滑翻页。
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
  PAGE_TRANSITION,
  renderFullText,
} from "./column-reader-engine";

// ── 组件 ────────────────────────────────────────────────────

const ArticleDetailPage = () => {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  // ---- 数据获取 --------------------------------------------------
  const [article] = createResource(id, async (id) => {
    const response = await getArticleDetail(id);
    return response.data;
  });

  // ---- 分页信号（页码 1-based） ----------------------------------
  const [currentPage, setCurrentPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(10);

  // ---- DOM 引用 & 初始化守卫 -------------------------------------
  let containerRef!: HTMLDivElement;
  let textWrapper!: HTMLDivElement;
  let built = false; // 防止 build() 被重复调用
  let afterInitialLayout = false; // 首次布局完成后才开启进度自动保存

  // ---- 翻页（纯 DOM 操作，不改信号） ------------------------------
  /**
   * 将 textWrapper 平移到目标页。
   * 不触发 Solid 信号更新（信号更新由外部调用方负责），避免重渲染循环。
   */
  const goToPage = (page: number, animate = true): void => {
    if (!textWrapper || totalPages() <= 0) return;

    const colWidth = parseFloat(textWrapper.style.columnWidth);
    if (!colWidth || colWidth <= 0) return;

    const offset = computePageOffset(page, totalPages(), colWidth, COLUMN_GAP);
    textWrapper.style.transform = `translateX(${offset}px)`;
    textWrapper.style.transition = animate ? PAGE_TRANSITION : "none";
  };

  /**
   * 重建总页数（基于当前容器宽度）。
   */
  const updateTotalPages = (): void => {
    if (!textWrapper) return;
    setTotalPages(computeTotalPages(textWrapper, COLUMN_GAP));
  };

  // ---- 初始化 build() —— 创建 textWrapper、渲染内容、恢复进度 ----
  const build = async (): Promise<void> => {
    // 先取值到局部变量，避免后续多次调用 article() 且消除 non-null assertion
    const articleData = article();
    if (built || !containerRef || !articleData?.body) return;
    built = true;

    // 1. 创建 textWrapper（作为 multi-column 容器）
    textWrapper = document.createElement("div");
    textWrapper.className = "absolute top-0 bottom-0 left-0";
    textWrapper.style.columnFill = "auto";
    textWrapper.style.columnGap = `${COLUMN_GAP}px`;
    textWrapper.style.overflow = "hidden";
    textWrapper.style.willChange = "transform";

    // 2. 挂载到容器
    containerRef.style.position = "relative";
    containerRef.innerHTML = "";
    containerRef.appendChild(textWrapper);

    // 3. 等下一帧：设置列宽并渲染全文（CSS multi-column 需要全部内容在 DOM 中）
    await new Promise((r) => requestAnimationFrame(r));
    textWrapper.style.columnWidth = `${computeAvailableWidth(containerRef)}px`;
    renderFullText(textWrapper, articleData.body);

    // 4. 再等下一帧：计算总页数
    await new Promise((r) => requestAnimationFrame(r));
    updateTotalPages();

    // 5. 从缓存恢复上次阅读进度
    const cachedPage = await getCurrentPageCache(`article-${id}`);
    const total = totalPages();
    const target = cachedPage.match({
      ok: (val) => Math.min(val, total),
      err: () => 1, // 缓存读取失败时回退到首页
    });

    // 6. 展示目标页（无动画）
    goToPage(target, false);
    setCurrentPage(target);
    afterInitialLayout = true;
  };

  // ── 生命周期 ──────────────────────────────────────────────

  // 挂载时构建（如果文章数据已就绪）
  onMount(() => {
    if (article()?.body) build();
  });

  // 如果文章数据在挂载后异步返回，则在此构建
  createEffect(() => {
    if (article()?.body && containerRef && !built) {
      build();
    }
  });

  // ── 响应式：窗口 resize 时重建列宽和页数（防抖 200ms） ──
  let resizeTimer: ReturnType<typeof setTimeout>;
  let lastWidth = 0;

  onMount(() => {
    if (!containerRef) return;

    const ro = new ResizeObserver((entries) => {
      const first = entries[0];
      if (!first) return;
      const width = Math.round(first.contentRect.width);
      if (width === lastWidth) return;
      lastWidth = width;

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!textWrapper || !containerRef) return;
        // 更新列宽 → 重算页数 → 修正当前页（防止越界）
        textWrapper.style.columnWidth = `${computeAvailableWidth(containerRef)}px`;
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

  // ── 副作用：翻页时自动保存进度到 IndexedDB ──────────────
  createEffect(() => {
    const page = currentPage();
    if (!afterInitialLayout) return;
    if (page > 0 && totalPages() > 0) {
      setCurrentPageCache(`article-${id}`, page);
    }
  });

  onCleanup(() => {
    const page = currentPage();
    if (afterInitialLayout && page > 0 && totalPages() > 0) {
      setCurrentPageCache(`article-${id}`, page);
    }
  });

  // ── 信号 → DOM：currentPage 变化时驱动翻页 ──────────────
  createEffect(() => {
    if (!built) return;
    goToPage(currentPage());
  });

  // ── JSX ───────────────────────────────────────────────────
  return (
    <Show when={article()}>
      <div class="grid md:grid-cols-[min(10rem)_1fr] h-full">
        <aside>
          <h2>{article()?.author.name}</h2>
        </aside>
        <main class="grid grid-rows-[auto_auto_1fr_auto] h-full">
          <h1>{article()?.title}</h1>
          <Separator />
          {/* 列式阅读区域 */}
          <article
            ref={containerRef}
            class="relative overflow-hidden min-h-0"
          />
          {/* 底部翻页控件 */}
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
