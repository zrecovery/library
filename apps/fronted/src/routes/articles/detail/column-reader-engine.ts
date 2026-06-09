/**
 * 列式阅读器排版引擎 — CSS multi-column
 *
 * 全文一次渲染到 DOM，利用浏览器 CSS multi-column 自动分列。
 * 核心思路：将 textWrapper 宽度展开到所有列的总宽，再通过 overflow:hidden + translateX 实现翻页。
 * 每次翻页只需改变 translateX 偏移量，无需重新排版。
 */

// ---- constants ----

/** Gap between columns, in pixels */
export const COLUMN_GAP = 32;

/** CSS transition for page changes */
export const PAGE_TRANSITION = "transform 0.3s ease";

// ---- types ----

export interface LayoutSnapshot {
  readonly columnWidth: number;
  readonly totalPages: number;
}

// ---- rendering ----

/**
 * 将全文渲染到容器中。每行一个 &lt;p&gt; 标签，使用 DocumentFragment 批量插入 DOM 以减少回流。
 *
 * 全文渲染到容器。使用 DocumentFragment 批量插入。
 */
export const renderFullText = (container: HTMLElement, text: string): void => {
  container.textContent = "";
  const fragment = document.createDocumentFragment();

  text.split("\n").forEach((line) => {
    const p = document.createElement("p");
    p.className = "m-0 indent-2em leading-relaxed";
    p.textContent = line;
    fragment.appendChild(p);
  });

  container.appendChild(fragment);
};

// ---- measurement ----

/**
 * 计算可用宽度（扣除 padding）。
 */
export const computeAvailableWidth = (el: HTMLElement): number => {
  const style = window.getComputedStyle(el);
  return (
    el.clientWidth -
    parseFloat(style.paddingLeft || "0") -
    parseFloat(style.paddingRight || "0")
  );
};

/**
 * 测量总页数。
 *
 * 展开-测量策略：
 * ① 先将容器 width 设为 auto，让浏览器展开所有内容，通过 scrollWidth 读取真实总宽度；
 * ② 再将 width 设回总宽度值（必须这样，否则浏览器只在一屏内分列）；
 * ③ 用总宽度 ÷ (列宽 + 列间距) 计算总页数。
 *
 * 测量总页数。同时展开 textWrapper 宽度到所有列的总宽。
 */
export const computeTotalPages = (
  container: HTMLElement,
  columnGap: number = COLUMN_GAP,
): LayoutSnapshot => {
  const columnWidth = parseFloat(container.style.columnWidth);
  if (!columnWidth || columnWidth <= 0) {
    return { columnWidth: 0, totalPages: 1 };
  }

  // 展开 → 测量：先将宽度设为 auto 获取真实总宽度
  container.style.width = "auto";
  const totalWidth = container.scrollWidth;

  // 必须设为总宽度，否则浏览器只在一屏内分列
  container.style.width = `${totalWidth}px`;

  return {
    columnWidth,
    totalPages: Math.max(1, Math.round(totalWidth / (columnWidth + columnGap))),
  };
};

// ---- navigation ----

/**
 * 计算翻页所需的 translateX 偏移量（负值）。
 * page 从 1 开始计数，结果用于 CSS transform: translateX()。
 *
 * translateX 偏移量（负值）
 */
export const computePageOffset = (
  page: number,
  layout: LayoutSnapshot,
  columnGap: number = COLUMN_GAP,
): number => {
  const clamped = Math.max(0, Math.min(page - 1, layout.totalPages - 1));
  return -clamped * (layout.columnWidth + columnGap);
};
