/**
 * 列式阅读器排版引擎 — CSS multi-column
 *
 * 全文一次渲染，浏览器 multi-column 自动分列。
 * 将 textWrapper 宽度展开到所有列的总宽，然后 overflow:hidden + translateX 翻页。
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

  // 展开 → 测量
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
