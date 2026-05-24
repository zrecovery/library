/**
 * Layout engine for text pagination.
 *
 * Mirrors tiansh/reader approach:
 *   1. Create measurement DOM identical to rendering DOM (absolute-positioned columns).
 *   2. Fill text with overflow:visible.
 *   3. When overflow detected, binary-search the exact character boundary.
 *   4. Measure the exact pixel height of visible content.
 *   5. Return nextCursor AND columnHeight so FlipPage sets height directly on the column.
 */

import type { PageLayoutResult, ViewportSize, ReaderConfig } from "./types";

// ---- Helpers ----

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

// ---- Measurement context ----

interface MeasureContext {
  outer: HTMLElement;
  inner: HTMLElement;
  contentHeight: number;
  contentWidth: number;
}

/**
 * Mirror FlipPage's colStyle EXACTLY.
 *
 * FlipPage renders:
 *   <div style="position:absolute; top:max(16px,...); bottom:max(24px,...);
 *               left:16px (or calc(50%+8px)); right:...; overflow:hidden;
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

  const topStr = "max(16px, env(safe-area-inset-top, 0px))";
  const botStr = "max(24px, calc(env(safe-area-inset-bottom, 0px) + 8px))";

  let leftStr: string;
  let rightStr: string;
  if (isTwoCol) {
    if (isRight) {
      leftStr = "calc(50% + 8px)";
      rightStr = "16px";
    } else {
      leftStr = "16px";
      rightStr = "calc(50% + 8px)";
    }
  } else {
    leftStr = "16px";
    rightStr = "16px";
  }

  inner.style.cssText =
    "position:absolute;" +
    `top:${topStr};bottom:${botStr};` +
    `left:${leftStr};right:${rightStr};` +
    "overflow:visible;overflow-wrap:break-word;word-break:break-all;";

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

// ---- Paragraph filling ----

interface FillState {
  cursor: number;
  paragraph: HTMLElement | null;
  previous: string | null;
  end: number | null;
  error: boolean;
}

function fillChunk(
  container: HTMLElement,
  content: string,
  s: FillState,
): void {
  if (s.cursor == null) s.cursor = s.end ?? 0;
  if (s.end != null && s.cursor >= s.end) {
    s.error = true;
    return;
  }
  const step = calcStep(
    container.clientWidth || 300,
    container.clientHeight || 400,
    18,
  );

  let pos = s.cursor;
  const end =
    s.end != null
      ? Math.min(pos + step, s.end)
      : Math.min(pos + step, content.length);
  s.cursor = end;

  if (s.previous == null) {
    const p = content.slice(Math.max(0, pos - 200), pos);
    s.previous = p.slice(p.lastIndexOf("\n") + 1);
  }

  const trunk = content.slice(pos, end);
  if (!trunk) {
    s.error = true;
    return;
  }

  trunk.split(/(\n)/).forEach((line) => {
    if (!s.paragraph && line) {
      const p = document.createElement("p");
      p.className = "text";
      p.dataset.start = String(pos);
      if (pos === 0 || content[pos - 1] !== "\n")
        p.classList.add("text-truncated-start");
      container.appendChild(p);
      s.paragraph = p;
    }
    if (line === "\n") {
      s.paragraph = null;
      s.previous = "";
    } else if (line) {
      if (s.paragraph) s.paragraph.textContent += line;
      s.previous += line;
    }
    pos += line.length;
  });
}

// ---- Forward column layout ----

function layoutColumnForward(
  content: string,
  cursor: number,
  ctx: MeasureContext,
): { nextCursor: number; height: number | null } {
  const start = skipWhitespace(content, cursor);
  if (start >= content.length)
    return { nextCursor: content.length, height: null };

  const inner = ctx.inner;
  inner.innerHTML = "";

  const s: FillState = {
    cursor: start,
    paragraph: null,
    previous: null,
    end: null,
    error: false,
  };
  let overflow = false;

  while (!s.error) {
    fillChunk(inner, content, s);
    if (inner.clientHeight !== inner.scrollHeight) {
      fillChunk(inner, content, s);
      overflow = true;
      break;
    }
    if (inner.scrollHeight > ctx.contentHeight * 4) s.error = true;
  }

  if (!overflow) return { nextCursor: s.cursor, height: null };

  // Find overflow boundary
  const innerRect = inner.getBoundingClientRect();
  const visBottom = innerRect.bottom;

  const paragraphs = Array.from(
    inner.querySelectorAll<HTMLElement>("p[data-start]"),
  );
  const firstOut =
    paragraphs
      .slice()
      .reverse()
      .find((p) => p.getBoundingClientRect().top < visBottom) ?? paragraphs[0];

  const paraStart = Number(firstOut.dataset.start);
  const textNode = firstOut.firstChild;
  if (!textNode || !textNode.textContent)
    return { nextCursor: paraStart, height: null };

  const text = textNode.textContent;
  let lo = 0,
    hi = text.length - 1;
  const range = document.createRange();

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    range.setStart(textNode, mid);
    range.setEnd(textNode, mid + 1);
    const rects = Array.from(range.getClientRects());
    const rectTop =
      rects.find((r) => r.width * r.height > 0)?.top ?? rects[0]?.top ?? 0;
    if (rectTop < visBottom) lo = mid + 1;
    else hi = mid - 1;
  }

  // Measure exact pixel height (like original: body.style.height = targetHeight)
  let height: number;
  if (hi < 0) {
    height = firstOut.getBoundingClientRect().top - innerRect.top;
  } else {
    range.setStart(textNode, lo - 1);
    range.setEnd(textNode, lo);
    height = range.getBoundingClientRect().bottom - innerRect.top;
  }

  return { nextCursor: paraStart + lo, height };
}

// ---- Build HTML from measurement DOM ----

function buildHTML(inner: HTMLElement, nextCursor: number): string {
  const paragraphs = Array.from(
    inner.querySelectorAll<HTMLElement>("p[data-start]"),
  );

  paragraphs.forEach((p) => {
    const start = Number(p.dataset.start);
    const text = p.textContent || "";
    const end = start + text.length;

    if (start >= nextCursor) {
      p.remove();
    } else if (end > nextCursor) {
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

// ---- Backward column layout ----

function layoutColumnBackward(
  content: string,
  targetNextCursor: number,
  ctx: MeasureContext,
): number {
  if (!targetNextCursor) return 0;

  const inner = ctx.inner;
  inner.innerHTML = "";
  const step = calcStep(ctx.contentWidth, ctx.contentHeight, 18);
  const end = skipWhitespaceBackward(content, targetNextCursor);

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

    while (!s.error) {
      fillChunk(inner, content, s);
      if (inner.clientHeight !== inner.scrollHeight) break;
      if (inner.scrollHeight > ctx.contentHeight * 4) break;
    }

    if (low === 0) break;
    if (inner.clientHeight !== inner.scrollHeight) break;

    const firstP = inner.querySelector<HTMLElement>("p[data-start]");
    if (firstP) {
      firstP.remove();
      const nextP = inner.querySelector<HTMLElement>("p[data-start]");
      high = nextP ? Number(nextP.dataset.start) : high;
    }
    low = Math.max(low - step, 0);
  }

  if (inner.clientHeight === inner.scrollHeight) return low;

  const innerRect = inner.getBoundingClientRect();
  let boundary = innerRect.top + inner.scrollHeight - inner.clientHeight;

  const paragraphs = Array.from(
    inner.querySelectorAll<HTMLElement>("p[data-start]"),
  );
  let firstOut = paragraphs.find(
    (p) => p.getBoundingClientRect().bottom > boundary,
  );
  if (!firstOut) return low;

  if (firstOut === inner.firstChild) {
    const ref = firstOut.nextSibling;
    firstOut.remove();
    const s: FillState = {
      cursor: skipWhitespace(content, Math.max(low - step, 0)),
      paragraph: null,
      previous: null,
      end: ref ? Number((ref as HTMLElement).dataset.start) : end,
      error: false,
    };
    while (!s.error) {
      fillChunk(inner, content, s);
      if (inner.clientHeight !== inner.scrollHeight) break;
    }
    firstOut = ref
      ? (ref.previousSibling as HTMLElement)
      : (inner.lastChild as HTMLElement);
    if (!firstOut) return low;
    boundary = innerRect.top + inner.scrollHeight - inner.clientHeight;
  }

  const firstOutStart = Number(firstOut.dataset.start);
  const textNode = firstOut.firstChild;
  if (!textNode || !textNode.textContent) return firstOutStart;

  let lo = 0,
    hi = textNode.textContent.length - 1;
  const range = document.createRange();
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    range.setStart(textNode, mid);
    range.setEnd(textNode, mid + 1);
    const rects = Array.from(range.getClientRects());
    const rectTop =
      rects.find((r) => r.width * r.height > 0)?.top ?? rects[0]?.top ?? 0;
    if (rectTop < boundary) lo = mid + 1;
    else hi = mid - 1;
  }

  inner.innerHTML = "";
  return skipWhitespace(content, firstOutStart + lo);
}

// ---- Public API ----

export const layoutPage = (
  _container: HTMLElement,
  content: string,
  cursor: number,
  viewport: ViewportSize,
  config: ReaderConfig,
  _contentsList: ReadonlyArray<{ cursor: number; title: string }>,
): PageLayoutResult => {
  const isTwoCol =
    viewport.width >= config.twoColumnThreshold &&
    viewport.width >= viewport.height * 1.2;

  if (!isTwoCol) {
    const ctx = makeMeasureCtx(viewport, config, false, false);
    const { nextCursor, height } = layoutColumnForward(content, cursor, ctx);
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

  // Two-column
  const ctx = makeMeasureCtx(viewport, config, true, false);

  const leftR = layoutColumnForward(content, cursor, ctx);
  if (leftR.nextCursor >= content.length) {
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

  // Switch to right column — rebuild inner with right-column styles
  // (reuse same outer, replace inner positioning)
  ctx.inner.className = "read-body read-body-right";
  ctx.inner.style.cssText =
    "position:absolute;" +
    "top:max(16px, env(safe-area-inset-top, 0px));" +
    "bottom:max(24px, calc(env(safe-area-inset-bottom, 0px) + 8px));" +
    "left:calc(50% + 8px);right:16px;" +
    "overflow:visible;overflow-wrap:break-word;word-break:break-all;";
  ctx.contentHeight = ctx.inner.clientHeight;
  ctx.contentWidth = ctx.inner.clientWidth;

  const rightR = layoutColumnForward(content, leftR.nextCursor, ctx);
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

  if (!isTwoCol) {
    const ctx = makeMeasureCtx(viewport, config, false, false);
    const start = layoutColumnBackward(content, targetNextCursor, ctx);
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

  const ctx = makeMeasureCtx(viewport, config, true, false);
  const rightStart = layoutColumnBackward(content, targetNextCursor, ctx);

  ctx.inner.className = "read-body";
  ctx.inner.style.cssText =
    "position:absolute;" +
    "top:max(16px, env(safe-area-inset-top, 0px));" +
    "bottom:max(24px, calc(env(safe-area-inset-bottom, 0px) + 8px));" +
    "left:16px;right:calc(50% + 8px);" +
    "overflow:visible;overflow-wrap:break-word;word-break:break-all;";
  ctx.contentHeight = ctx.inner.clientHeight;
  ctx.contentWidth = ctx.inner.clientWidth;

  const leftStart = layoutColumnBackward(content, rightStart, ctx);
  removeMeasureCtx(ctx);

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
