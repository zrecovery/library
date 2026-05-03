/**
 * 列式阅读器排版引擎 —— 纯函数模块
 *
 * 采用 CSS multi-column 实现列式布局：
 *   1. 全文渲染为 <p> 列表放入一个宽容器
 *   2. 浏览器按 columnWidth 自动分列（列高 = 容器高）
 *   3. 将容器 width 展开到所有列的总宽度
 *   4. 父容器 overflow:hidden + translateX 实现"翻页"
 *
 * 注意：CSS multi-column 要求容器 width >= 所有列的总宽度，
 * 否则额外的列不会被创建，导致第 2 页及之后内容为空。
 */

// ── 常量 ────────────────────────────────────────────────────
/** 列间距 (px) */
export const COLUMN_GAP = 32;

// ── 基础工具 ─────────────────────────────────────────────────

/**
 * 跳过光标后的空白字符。
 */
export const skipWhitespace = (text: string, cursor: number): number => {
  let pos = cursor;
  while (pos < text.length && text[pos] === " ") pos++;
  return pos;
};

// ── DOM 渲染 ────────────────────────────────────────────────

/**
 * 将全文按行渲染为 <p> 元素。
 *
 * 每个 <p> 带有 data-start 属性（字符偏移量）用于调试定位。
 * CSS multi-column 要求全文都在 DOM 中才能正确分配列。
 */
export const renderFullText = (container: HTMLElement, text: string): void => {
  container.textContent = "";
  let cursor = 0;

  for (const line of text.split("\n")) {
    const p = document.createElement("p");
    p.className = "m-0 indent-2em leading-relaxed";
    p.dataset.start = String(cursor);
    p.textContent = line;
    container.appendChild(p);
    cursor += line.length + 1;
  }
};

// ── 布局计算 ────────────────────────────────────────────────

/**
 * 计算容器可用宽度（扣除 padding）。
 */
export const computeAvailableWidth = (el: HTMLElement | null): number => {
  if (!el) return 360;
  const style = window.getComputedStyle(el);
  return (
    el.clientWidth -
    parseFloat(style.paddingLeft || "0") -
    parseFloat(style.paddingRight || "0")
  );
};

/**
 * 计算总页数，同时将容器 width 展开到容纳所有列。
 *
 * CSS multi-column 的行为：
 *   - 浏览器按照 columnWidth 在容器内创建列
 *   - 列数取决于"容器宽度能放下多少列"
 *   - 如果 width 不够，多余的列不会被创建
 *
 * 因此必须：
 *   width:auto → 读取 scrollWidth → width = scrollWidth
 *
 * 外部通过 overflow:hidden + translateX 裁剪到单个可视页。
 */
export const computeTotalPages = (
  container: HTMLElement,
  columnGap: number = COLUMN_GAP,
): number => {
  const colWidth = parseFloat(container.style.columnWidth);
  if (!colWidth || colWidth <= 0) return 1;

  // 展开 → 测量所有列的总宽度
  container.style.width = "auto";
  const totalWidth = container.scrollWidth;

  // 固定 width = 总宽度（保证所有列参与布局）
  container.style.width = `${totalWidth}px`;

  return Math.max(1, Math.round(totalWidth / (colWidth + columnGap)));
};

/**
 * 计算翻页所需的 translateX 偏移量（负值）。
 */
export const computePageOffset = (
  page: number,
  totalPages: number,
  columnWidth: number,
  columnGap: number = COLUMN_GAP,
): number => {
  const clamped = Math.max(0, Math.min(page - 1, totalPages - 1));
  return -clamped * (columnWidth + columnGap);
};

/** CSS transition 字符串，用于平滑翻页。 */
export const PAGE_TRANSITION = "transform 0.3s ease";
