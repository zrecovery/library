/**
 * Layout engine for text pagination.
 *
 * Mirrors tiansh/reader approach:
 *   1. Create measurement DOM identical to rendering DOM (absolute-positioned columns).
 *   2. Fill text with overflow:visible.
 *   3. When overflow detected, binary-search the exact character boundary.
 *   4. Measure the exact pixel height of visible content.
 *   5. Return nextCursor AND columnHeight so FlipPage sets height directly on the column.
 *
 * 文本分页布局引擎（中文说明）：
 *   1. 创建与渲染 DOM 完全一致的测量 DOM（绝对定位的列）。
 *   2. 以 overflow:visible 方式填充文本。
 *   3. 检测到溢出时，二分查找精确的字符边界。
 *   4. 测量可见内容的精确像素高度。
 *   5. 返回 nextCursor 和 columnHeight，让 FlipPage 直接在列上设置高度。
 */

import type { PageLayoutResult, ViewportSize, ReaderConfig } from "./types";

// =============================================================================
//  Whitespace Helpers
//  空白字符辅助函数
// =============================================================================

const skipWhitespace = (content: string, cursor: number): number => {
  let pos = Math.max(0, cursor);
  let lastBreak = pos;
  while (pos < content.length && /[^\S\n]/.test(content[pos])) pos++;
  while (pos < content.length && content[pos] === "\n") {
    lastBreak = pos + 1;
    pos++;
  }
  return pos >= content.length ? content.length : lastBreak || cursor;
};

const skipWhitespaceBackward = (content: string, cursor: number): number => {
  let pos = cursor;
  while (pos > 0 && /[^\S\n]/.test(content[pos - 1])) pos--;
  return pos;
};

const calcStep = (vw: number, vh: number, fontSize: number): number =>
  Math.max(Math.floor((vw * vh) / (fontSize * fontSize)), 50);

// =============================================================================
//  Measurement Context
//  测量上下文
// =============================================================================

interface MeasureContext {
  outer: HTMLElement;
  inner: HTMLElement;
  contentHeight: number;
  contentWidth: number;
}

/**
 * Build the CSS string for an inner column element (mirrors FlipPage's colStyle).
 * 构造内层列的 CSS 字符串（镜像 FlipPage 的 colStyle）。
 *
 * @param isTwoCol 是否为双栏模式
 * @param isRight 当为 true 时，渲染右半部分定位；否则为左半部分或单栏。
 */
function colInnerStyle(isTwoCol: boolean, isRight: boolean): string {
  const topStr = "max(16px, env(safe-area-inset-top, 0px))";
  const botStr = "max(36px, calc(env(safe-area-inset-bottom, 0px) + 20px))";

  let leftStr: string;
  let rightStr: string;
  let extraStyle = "";
  if (isTwoCol) {
    if (isRight) {
      leftStr = "50%";
      rightStr = "16px";
      extraStyle = "padding-left:16px;";
    } else {
      leftStr = "16px";
      rightStr = "50%";
      extraStyle = "padding-right:16px;";
    }
  } else {
    leftStr = "16px";
    rightStr = "16px";
  }

  return (
    "position:absolute;" +
    `top:${topStr};bottom:${botStr};` +
    `left:${leftStr};right:${rightStr};` +
    "overflow:visible;overflow-wrap:break-word;word-break:break-all;" +
    "box-sizing:border-box;" +
    extraStyle
  );
}

/**
 * Mirror FlipPage's colStyle EXACTLY.
 * 精确镜像 FlipPage 的 colStyle。
 *
 * FlipPage renders:
 *   <div style="position:absolute; top:max(16px,...); bottom:max(36px,...);
 *               left:16px (or 50% with padding); right:...; overflow:hidden;
 *               overflow-wrap:break-word; word-break:break-all">
 */
function makeMeasureCtx(
  viewport: ViewportSize,
  config: ReaderConfig,
  isTwoCol: boolean,
  isRight: boolean,
): MeasureContext {
  const outer = document.createElement("div");
  outer.style.cssText =
    "position:fixed;left:-9999px;top:0;" +
    `width:${viewport.width}px;height:${viewport.height}px;` +
    `font-size:${config.fontSize}px;line-height:${config.lineHeight};` +
    `color:${config.textColor};`;
  document.body.appendChild(outer);

  const inner = document.createElement("div");
  inner.className = "read-body";
  if (isRight) inner.className += " read-body-right";

  inner.style.cssText = colInnerStyle(isTwoCol, isRight);

  outer.appendChild(inner);

  return {
    outer,
    inner,
    contentHeight: inner.clientHeight,
    contentWidth: inner.clientWidth,
  };
}

function removeMeasureCtx(ctx: MeasureContext): void {
  document.body.removeChild(ctx.outer);
}

// =============================================================================
//  Paragraph Filling
//  段落填充
// =============================================================================

/**
 * Mutable accumulator for the fillChunk loop.
 * fillChunk 循环的可变累加器。
 *
 * Fields are intentionally mutable — fillChunk mutates `s` in place to avoid
 * allocation overhead while progressively filling the measurement DOM with
 * text paragraphs. The caller creates one FillState and passes it repeatedly.
 *
 * 字段被设计为可变的——fillChunk 直接修改 `s` 以避免分配开销，同时逐步用
 * 文本段落填充测量 DOM。调用者创建一个 FillState 并反复传入。
 */
interface FillState {
  cursor: number;
  paragraph: HTMLElement | null;
  previous: string | null;
  end: number | null;
  error: boolean;
}

/**
 * 段落填充策略（Paragraph Filling Strategy）：
 *
 * fillChunk 每次从 content 中取出一段文本（chunk），将其按换行符拆分为段落，
 * 并逐个以 <p> 元素的形式追加到测量容器中。核心策略如下：
 *
 * 1. 步长计算（calcStep）：根据容器尺寸和字体大小动态计算每次填充的字符数，
 *    避免一次填充过多字符导致性能问题。
 *
 * 2. 渐进式填充：每次调用填充一个 chunk，多次调用逐步填满容器。状态由 FillState
 *    维护（cursor、current paragraph、previous context）。
 *
 * 3. 段落重建：chunk 中的文本按 "\n" 拆分，每个非空段创建一个新的 <p> 元素。
 *    换行符 "\n" 用于结束当前段落（将 paragraph 置 null）。
 *
 * 4. 截断标记：如果某段落的起始位置不在段落开头（即前一段被截断），
 *    为该 <p> 添加 "text-truncated-start" 类标记。
 *
 * 5. 边界检测：当 cursor 到达 end 或内容末尾时，设置 error 标志终止循环。
 *
 * @param container 测量容器的 DOM 元素
 * @param content 全文内容
 * @param s 填充状态（会被原地修改）
 * @param fontSize 字体大小，用于计算步长
 */
function fillChunk(
  container: HTMLElement,
  content: string,
  s: FillState,
  fontSize: number,
): void {
  if (s.cursor == null) s.cursor = s.end ?? 0;
  if (s.end != null && s.cursor >= s.end) {
    s.error = true;
    return;
  }
  // 根据容器尺寸和字体大小动态计算本次填充的步长
  const step = calcStep(
    container.clientWidth || 300,
    container.clientHeight || 400,
    fontSize,
  );

  let pos = s.cursor;
  const end =
    s.end != null
      ? Math.min(pos + step, s.end)
      : Math.min(pos + step, content.length);
  s.cursor = end;

  // 首次填充时，向前回溯最多 200 字符获取上一个换行符之后的上下文
  if (s.previous == null) {
    const p = content.slice(Math.max(0, pos - 200), pos);
    s.previous = p.slice(p.lastIndexOf("\n") + 1);
  }

  const trunk = content.slice(pos, end);
  if (!trunk) {
    s.error = true;
    return;
  }

  // 按换行符拆分 trunk，逐个构建段落 <p> 元素
  trunk.split(/(\n)/).forEach((line) => {
    if (!s.paragraph && line) {
      const p = document.createElement("p");
      p.className = "text";
      p.dataset.start = String(pos);
      // 如果段落起始位置不是段落的真正开头（前一段被截断），添加截断标记
      if (pos === 0 || content[pos - 1] !== "\n")
        p.classList.add("text-truncated-start");
      container.appendChild(p);
      s.paragraph = p;
    }
    if (line === "\n") {
      // 换行符结束当前段落
      s.paragraph = null;
      s.previous = "";
    } else if (line) {
      if (s.paragraph) s.paragraph.textContent += line;
      s.previous += line;
    }
    pos += line.length;
  });
}

// =============================================================================
//  Binary Search Helper (shared by forward and backward layout)
//  二分查找辅助函数（前向和后向布局共用）
// =============================================================================
//  二分查找逻辑：
//  给定一个文本节点和可见区域底部边界（相对于视口的像素值），
//  在节点的文本内容中二分查找最后一个完全位于边界上方的字符的索引。
//
//  算法流程：
//  1. 初始化 lo = 0, hi = textNode.textContent.length - 1
//  2. 使用 document.createRange() 获取中间位置的字符的 bounding rect
//  3. 比较 rect 的 top 与 visibleBottom：
//     - 如果 rectTop < visibleBottom → 该字符可见，向右搜索 (lo = mid + 1)
//     - 否则 → 该字符溢出，向左搜索 (hi = mid - 1)
//  4. 循环结束后 hi 即为最后一个可见字符的索引
//
//  调用者可以用此结果计算 nextCursor = paragraphStart + hi + 1

/**
 * Given a text node and a visible bottom boundary (in viewport pixels),
 * binary-search within the node's text to find the index of the last
 * character whose bounding rect is fully above the boundary.
 *
 * Returns the index. Caller can compute nextCursor = paragraphStart + index.
 *
 * 给定一个文本节点和可见区域底部边界（相对于视口的像素值），
 * 在节点的文本内容中二分查找最后一个完全位于边界上方的字符的索引。
 * 返回该索引值。调用者可以据此计算 nextCursor = paragraphStart + index。
 */
function binarySearchVisibleBoundary(
  textNode: Node & { textContent: string },
  visibleBottom: number,
): number {
  let lo = 0;
  let hi = textNode.textContent.length - 1;
  const range = document.createRange();

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    range.setStart(textNode, mid);
    range.setEnd(textNode, mid + 1);
    const rects = Array.from(range.getClientRects());
    // 优先选择有效矩形（宽高 > 0），其次选择第一个矩形
    const rectTop =
      rects.find((r) => r.width * r.height > 0)?.top ?? rects[0]?.top ?? 0;
    if (rectTop < visibleBottom) lo = mid + 1;
    else hi = mid - 1;
  }

  return hi;
}

// =============================================================================
//  Forward Column Layout
//  前向列布局
// =============================================================================
//  整体流程：
//  1. 跳过前置空白字符，确定起始 cursor
//  2. 逐步调用 fillChunk 填充测量容器，直到检测到溢出（scrollHeight > clientHeight）
//  3. 找到第一个溢出的段落（firstOut）
//  4. 对该段落的文本节点进行二分查找，定位精确的溢出边界字符
//  5. 测量可见内容的高度并返回 { nextCursor, height }

/**
 * 从给定 cursor 开始，向前填充一列文本，返回下一页的 cursor 和列高度。
 *
 * @param content 全文内容
 * @param cursor 起始位置
 * @param ctx 测量上下文
 * @param fontSize 字体大小
 * @returns {{ nextCursor: number; height: number | null }} 下一页的起始 cursor 和列的像素高度
 */
function layoutColumnForward(
  content: string,
  cursor: number,
  ctx: MeasureContext,
  fontSize: number,
): { nextCursor: number; height: number | null } {
  // 步骤 1：跳过前置空白字符
  const start = skipWhitespace(content, cursor);
  if (start >= content.length)
    return { nextCursor: content.length, height: null };

  const inner = ctx.inner;
  inner.innerHTML = "";

  // 步骤 2：逐步填充直到溢出
  const s: FillState = {
    cursor: start,
    paragraph: null,
    previous: null,
    end: null,
    error: false,
  };
  let overflow = false;

  while (!s.error) {
    fillChunk(inner, content, s, fontSize);
    if (inner.clientHeight !== inner.scrollHeight) {
      // 溢出确认：再填充一次以确保溢出不是偶然的（如行高差异导致的一行偏差）
      fillChunk(inner, content, s, fontSize);
      overflow = true;
      break;
    }
    // 安全阀：如果滚动高度远超容器高度，认为填充异常，终止循环
    if (inner.scrollHeight > ctx.contentHeight * 4) s.error = true;
  }

  if (!overflow) return { nextCursor: s.cursor, height: null };

  // 步骤 3：找到第一个溢出的段落
  const measureRect = inner.getBoundingClientRect();
  const visibleBottom = measureRect.bottom;

  const paragraphs = Array.from(
    inner.querySelectorAll<HTMLElement>("p[data-start]"),
  );
  // 从后往前找第一个 top < visibleBottom 的段落，即第一个部分溢出（或恰好在边界上的）段落
  const firstOut =
    paragraphs
      .slice()
      .reverse()
      .find((p) => p.getBoundingClientRect().top < visibleBottom) ??
    paragraphs[0];

  const paraStart = Number(firstOut.dataset.start);
  const textNode = firstOut.firstChild;
  if (!textNode || !textNode.textContent)
    return { nextCursor: paraStart, height: null };

  // 步骤 4：二分查找精确的溢出边界
  const hi = binarySearchVisibleBoundary(
    textNode as Node & { textContent: string },
    visibleBottom,
  );

  // 步骤 5：测量可见内容的精确像素高度
  // Measure exact pixel height (like original: body.style.height = targetHeight)
  let height: number;
  if (hi < 0) {
    // 段落完全溢出：高度 = 段落顶部到容器顶部的距离
    height = firstOut.getBoundingClientRect().top - measureRect.top;
  } else {
    // 段落部分溢出：高度 = 最后一个可见字符底部到容器顶部的距离
    const range = document.createRange();
    range.setStart(textNode, hi);
    range.setEnd(textNode, hi + 1);
    height = range.getBoundingClientRect().bottom - measureRect.top;
  }

  return { nextCursor: paraStart + hi + 1, height };
}

// =============================================================================
//  HTML Building
//  HTML 构建
// =============================================================================

/**
 * Transform the measurement DOM into the final HTML string for a column.
 *
 * Strategy: clone the measurement DOM and truncate paragraphs that extend
 * beyond `nextCursor`. Paragraphs fully past the cursor are removed; partially
 * included ones have their visible text cut and a hidden span preserving the
 * remainder (so that "text-truncated-end" styling can render ellipsis, etc.).
 * The in-place mutation is safe because the measurement DOM is discarded after
 * this call.
 *
 * 将测量 DOM 转换为列的最终 HTML 字符串。
 *
 * 克隆-截断策略（Clone-and-Truncate Strategy）：
 * 1. 遍历测量 DOM 中的全部 <p> 段落元素。
 * 2. 完全超出 nextCursor 的段落：直接移除（remove）。
 * 3. 部分超出 nextCursor 的段落：截断文本到 cut 位置，并将剩余部分包裹在
 *    隐藏的 <span> 中保留（aria-hidden="true", visibility:hidden）。
 *    这样 "text-truncated-end" 样式可以渲染省略号等效果。
 * 4. 原地修改是安全的，因为测量 DOM 在此调用后即被丢弃。
 */
function buildHTML(inner: HTMLElement, nextCursor: number): string {
  const paragraphs = Array.from(
    inner.querySelectorAll<HTMLElement>("p[data-start]"),
  );

  paragraphs.forEach((p) => {
    const start = Number(p.dataset.start);
    const text = p.textContent || "";
    const end = start + text.length;

    if (start >= nextCursor) {
      // 段落完全超出：直接移除
      p.remove();
    } else if (end > nextCursor) {
      // 段落部分超出：截断文本，剩余部分隐藏在 span 中
      const cut = nextCursor - start;
      p.textContent = text.slice(0, cut);
      const after = text.slice(cut);
      if (after) {
        const span = document.createElement("span");
        span.setAttribute("aria-hidden", "true");
        span.style.visibility = "hidden";
        span.textContent = after;
        p.appendChild(span);
      }
      p.classList.add("text-truncated-end");
    }
  });

  return inner.innerHTML;
}

// =============================================================================
//  Backward Column Layout
//  后向列布局
// =============================================================================
//  整体流程：
//  1. 从 targetNextCursor 向前推算，找到能填满一列的起始位置
//  2. 使用滑动窗口（low/high）迭代：从 low 开始填充，检查是否溢出
//  3. 如果未溢出且 low > 0，移除第一个段落并向前扩展窗口继续尝试
//  4. 找到第一个溢出的段落（firstOut）
//  5. 对溢出段落的文本节点进行二分查找，定位精确的溢出边界字符
//  6. 返回本列起始 cursor（即上一页的 nextCursor）

/**
 * 从 targetNextCursor 向后（反向）推算，找到能恰好填满一列的起始 cursor。
 * 即：给定下一页的起始位置，反推当前页应该从哪个 cursor 开始。
 *
 * 算法核心：
 * - 使用滑动窗口 [low, high] 迭代搜索
 * - 初始窗口：low = end - step, high = end（end 是 targetNextCursor 向前跳过空白后的位置）
 * - 每次迭代从 low 开始填充文本到 high
 * - 如果未溢出：移除第一个 <p>，将 high 更新为下一个段落的起始位置，low 向前移动 step
 * - 如果溢出：退出循环，进入精确边界查找
 * - 如果 low === 0：已到达全文开头，退出循环
 *
 * @param content 全文内容
 * @param targetNextCursor 目标下一页的起始 cursor（本列应在此位置结束）
 * @param ctx 测量上下文
 * @param fontSize 字体大小
 * @returns 本列的起始 cursor（即上一页的 nextCursor）
 */
function layoutColumnBackward(
  content: string,
  targetNextCursor: number,
  ctx: MeasureContext,
  fontSize: number,
): number {
  if (!targetNextCursor) return 0;

  const inner = ctx.inner;
  inner.innerHTML = "";
  const step = calcStep(ctx.contentWidth, ctx.contentHeight, fontSize);
  // 步骤 1：向前跳过空白字符，确定目标结束位置
  const end = skipWhitespaceBackward(content, targetNextCursor);

  // 步骤 2：滑动窗口 [low, high] 迭代搜索
  let low = Math.max(end - step, 0);
  let high = end;

  while (true) {
    inner.innerHTML = "";
    const s: FillState = {
      cursor: skipWhitespace(content, low),
      paragraph: null,
      previous: null,
      end: high,
      error: false,
    };

    // 填充文本到 high 位置，检查是否溢出
    while (!s.error) {
      fillChunk(inner, content, s, fontSize);
      if (inner.clientHeight !== inner.scrollHeight) break;
      if (inner.scrollHeight > ctx.contentHeight * 4) break;
    }

    // 终止条件：已到全文开头
    if (low === 0) break;
    // 终止条件：当前窗口已产生溢出
    if (inner.clientHeight !== inner.scrollHeight) break;

    // 步骤 3：未溢出 → 移除第一个段落，缩小窗口继续向前搜索
    const firstP = inner.querySelector<HTMLElement>("p[data-start]");
    if (firstP) {
      firstP.remove();
      const nextP = inner.querySelector<HTMLElement>("p[data-start]");
      high = nextP ? Number(nextP.dataset.start) : high;
    }
    low = Math.max(low - step, 0);
  }

  // 未溢出：说明内容不足一页，返回 low
  if (inner.clientHeight === inner.scrollHeight) return low;

  // 步骤 4：找到第一个溢出的段落
  const measureRect = inner.getBoundingClientRect();
  let visibleBottom = measureRect.top + inner.scrollHeight - inner.clientHeight;

  const paragraphs = Array.from(
    inner.querySelectorAll<HTMLElement>("p[data-start]"),
  );
  let firstOut = paragraphs.find(
    (p) => p.getBoundingClientRect().bottom > visibleBottom,
  );
  if (!firstOut) return low;

  // 如果 firstOut 是第一个子元素，可能因为之前被截断导致内容不足，
  // 需要回填更多内容以获得更精确的溢出边界。
  firstOut = refillIfFirstChild(
    content,
    inner,
    firstOut,
    low,
    step,
    end,
    fontSize,
    measureRect,
  );
  if (!firstOut) return low;
  // visibleBottom 在 refillIfFirstChild 中可能已更新
  visibleBottom = measureRect.top + inner.scrollHeight - inner.clientHeight;

  // 步骤 5：二分查找精确的溢出边界
  const firstOutStart = Number(firstOut.dataset.start);
  const textNode = firstOut.firstChild;
  if (!textNode || !textNode.textContent) return firstOutStart;

  const hi = binarySearchVisibleBoundary(
    textNode as Node & { textContent: string },
    visibleBottom,
  );

  // 步骤 6：返回本列起始 cursor
  inner.innerHTML = "";
  return skipWhitespace(content, firstOutStart + hi + 1);
}

/**
 * 回填策略：当 firstOut 是容器的第一个子元素时，说明该段落之前的内容不足，
 * 需要向前回填更多文本以获得准确的溢出边界。
 *
 * 具体步骤：
 * 1. 记录 firstOut 的下一个兄弟节点作为锚点（ref）。
 * 2. 移除当前的 firstOut。
 * 3. 从更早的位置（low - step）重新填充文本到 ref（或 end）的位置。
 * 4. 填充完成后，用 ref 定位新的 firstOut。
 *
 * @param content 全文内容
 * @param inner 测量容器
 * @param firstOut 当前识别为第一个溢出的段落元素
 * @param low 当前窗口下界
 * @param step 步长
 * @param end 目标结束位置
 * @param fontSize 字体大小
 * @param measureRect 测量容器的 bounding rect
 * @returns 修正后的 firstOut 段落元素，若无法确定则返回 undefined
 */
function refillIfFirstChild(
  content: string,
  inner: HTMLElement,
  firstOut: HTMLElement,
  low: number,
  step: number,
  end: number,
  fontSize: number,
  measureRect: DOMRect,
): HTMLElement | undefined {
  if (firstOut !== inner.firstChild) return firstOut;

  const ref = firstOut.nextSibling;
  firstOut.remove();
  // 从更早的位置重新填充文本
  const s: FillState = {
    cursor: skipWhitespace(content, Math.max(low - step, 0)),
    paragraph: null,
    previous: null,
    end: ref ? Number((ref as HTMLElement).dataset.start) : end,
    error: false,
  };
  while (!s.error) {
    fillChunk(inner, content, s, fontSize);
    if (inner.clientHeight !== inner.scrollHeight) break;
  }
  // 用 ref 定位新的 firstOut
  return (
    (ref
      ? (ref.previousSibling as HTMLElement)
      : (inner.lastChild as HTMLElement)) || undefined
  );
}

// =============================================================================
//  Public API
//  公开 API
// =============================================================================

/**
 * 从给定 cursor 向前布局一页（可能包含单栏或双栏）。
 *
 * 布局策略：
 * 1. 判断是否为双栏模式（viewport 宽度 >= 两栏阈值 且 宽度 >= 高度 * 1.2）。
 * 2. 单栏模式：直接 layoutColumnForward 填充一列，buildHTML 构建 HTML。
 * 3. 双栏模式：
 *    a. 先布局左栏（layoutColumnForward）。
 *    b. 如果左栏已到内容末尾，右栏留空。
 *    c. 否则将测量容器切换为右栏样式，继续布局右栏。
 *
 * @param _container 渲染容器（本引擎不使用，保留以兼容接口）
 * @param content 全文内容
 * @param cursor 起始 cursor 位置
 * @param viewport 视口尺寸
 * @param config 阅读器配置（字体大小、行高、颜色、双栏阈值等）
 * @param _contentsList 目录列表（本引擎不使用，保留以兼容接口）
 * @returns PageLayoutResult 包含 cursor、nextCursor、columns（HTML 数组）、columnHeights
 */
export const layoutPage = (
  _container: HTMLElement,
  content: string,
  cursor: number,
  viewport: ViewportSize,
  config: ReaderConfig,
  _contentsList: ReadonlyArray<{ cursor: number; title: string }>,
): PageLayoutResult => {
  // 判断双栏模式：宽度 >= 阈值 且 宽度足够宽（宽度 >= 高度 * 1.2）
  const isTwoCol =
    viewport.width >= config.twoColumnThreshold &&
    viewport.width >= viewport.height * 1.2;

  // 单栏布局
  if (!isTwoCol) {
    const ctx = makeMeasureCtx(viewport, config, false, false);
    const { nextCursor, height } = layoutColumnForward(
      content,
      cursor,
      ctx,
      config.fontSize,
    );
    const nc = Math.min(nextCursor, content.length);
    const html = buildHTML(ctx.inner, nc);
    removeMeasureCtx(ctx);
    return {
      cursor: skipWhitespace(content, cursor),
      nextCursor: nc,
      columns: [html],
      columnHeights: [height],
    };
  }

  // 双栏布局
  const ctx = makeMeasureCtx(viewport, config, true, false);

  // 左栏
  const leftR = layoutColumnForward(content, cursor, ctx, config.fontSize);
  if (leftR.nextCursor >= content.length) {
    // 左栏已到末尾，右栏留空
    const html = buildHTML(ctx.inner, leftR.nextCursor);
    removeMeasureCtx(ctx);
    return {
      cursor: skipWhitespace(content, cursor),
      nextCursor: leftR.nextCursor,
      columns: [html, ""],
      columnHeights: [leftR.height, null],
    };
  }

  const leftHTML = buildHTML(ctx.inner, leftR.nextCursor);

  // 切换为右栏样式（复用同一个 outer，替换 inner 的定位样式）
  // Switch to right column — rebuild inner with right-column styles
  // (reuse same outer, replace inner positioning)
  ctx.inner.className = "read-body read-body-right";
  ctx.inner.style.cssText = colInnerStyle(true, true);
  ctx.contentHeight = ctx.inner.clientHeight;
  ctx.contentWidth = ctx.inner.clientWidth;

  // 右栏
  const rightR = layoutColumnForward(
    content,
    leftR.nextCursor,
    ctx,
    config.fontSize,
  );
  const rightNC = Math.min(rightR.nextCursor, content.length);
  const rightHTML = buildHTML(ctx.inner, rightNC);
  removeMeasureCtx(ctx);

  return {
    cursor: skipWhitespace(content, cursor),
    nextCursor: rightNC,
    columns: [leftHTML, rightHTML],
    columnHeights: [leftR.height, rightR.height],
  };
};

/**
 * 从 targetNextCursor 向后推算，布局以该位置为结束点的一页。
 * 用于实现"翻到上一页"——给定下一页的起始位置，反推当前页的内容。
 *
 * 布局策略：
 * 1. 判断是否为双栏模式。
 * 2. 单栏模式：layoutColumnBackward 反推起始 cursor，再 layoutPage 正向布局。
 * 3. 双栏模式：
 *    a. 先用右栏样式反推右栏起始 position（layoutColumnBackward）。
 *    b. 再切换为左栏样式反推左栏起始 position。
 *    c. 最后以左栏起始 position 调用 layoutPage 正向布局完整页面。
 *
 * @param _container 渲染容器（本引擎不使用，保留以兼容接口）
 * @param content 全文内容
 * @param targetNextCursor 目标下一页的起始 cursor（本页应在此结束）
 * @param viewport 视口尺寸
 * @param config 阅读器配置
 * @param _contentsList 目录列表（本引擎不使用，保留以兼容接口）
 * @returns PageLayoutResult 包含 cursor、nextCursor、columns、columnHeights
 */
export const layoutPageEndingAt = (
  _container: HTMLElement,
  content: string,
  targetNextCursor: number,
  viewport: ViewportSize,
  config: ReaderConfig,
  _contentsList: ReadonlyArray<{ cursor: number; title: string }>,
): PageLayoutResult => {
  if (!targetNextCursor) {
    return {
      cursor: 0,
      nextCursor: 0,
      columns: ["", ""],
      columnHeights: [null, null],
    };
  }

  const isTwoCol =
    viewport.width >= config.twoColumnThreshold &&
    viewport.width >= viewport.height * 1.2;

  // 单栏模式：反推起始 cursor，再正向布局
  if (!isTwoCol) {
    const ctx = makeMeasureCtx(viewport, config, false, false);
    const start = layoutColumnBackward(
      content,
      targetNextCursor,
      ctx,
      config.fontSize,
    );
    removeMeasureCtx(ctx);
    return layoutPage(
      _container,
      content,
      start,
      viewport,
      config,
      _contentsList,
    );
  }

  // 双栏模式：先反推右栏起始，再反推左栏起始，最后正向布局完整页面
  const ctx = makeMeasureCtx(viewport, config, true, false);

  // 反推右栏起始 cursor
  const rightStart = layoutColumnBackward(
    content,
    targetNextCursor,
    ctx,
    config.fontSize,
  );

  // 切换为左栏样式，反推左栏起始 cursor
  ctx.inner.className = "read-body";
  ctx.inner.style.cssText = colInnerStyle(true, false);
  ctx.contentHeight = ctx.inner.clientHeight;
  ctx.contentWidth = ctx.inner.clientWidth;

  const leftStart = layoutColumnBackward(
    content,
    rightStart,
    ctx,
    config.fontSize,
  );
  removeMeasureCtx(ctx);

  // 以左栏起始位置正向布局完整页面
  return layoutPage(
    _container,
    content,
    leftStart,
    viewport,
    config,
    _contentsList,
  );
};

export const ignoreSpaces = skipWhitespace;
export const ignoreSpacesBackward = skipWhitespaceBackward;
