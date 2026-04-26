// ── 类型定义 ────────────────────────────────────────────────
export interface SectionIndex {
  index: number;
  title: string;
  start: number;
  end: number;
}

export interface Size {
  height: number;
  width: number;
}

interface PageRenderContext {
  readonly paragraph: HTMLParagraphElement | null;
  readonly before: HTMLElement | null;
  readonly start: number;
  readonly end: number | null;
  readonly cursor: number;
  readonly previous: string;
  readonly error: boolean;
  readonly nextSection: number | null;
}

// ── 常量 ────────────────────────────────────────────────────
const MAXCONTENTLENGTH = 5000;
const STEP = 100;

// ── 基础工具（纯函数）───────────────────────────────────────
/**
 * 跳过光标后的空白字符（空格、换行等，这里简化为空格）
 */
const ignoreSpaces = (content: string, cursor: number): number => {
  let pos = cursor;
  while (pos < content.length && content[pos] === " ") {
    pos++;
  }
  return pos;
};

/** 公开: 获取跳过空格后的起始位置 */
export const start = (content: string, cursor: number): number =>
  ignoreSpaces(content, cursor);

/** 公开: 计算阅读进度(百分比) */
export const progress = (cursor: number, content: string): string | null => {
  const realStart = ignoreSpaces(content, cursor);
  if (realStart >= content.length) return null;
  return `${((realStart / content.length) * 100).toFixed(2)}%`;
};

/** 根据光标找到所在章节 */
const getSectionByCursor = (
  sectionIndexs: SectionIndex[],
  cursor: number,
): SectionIndex | undefined =>
  sectionIndexs.find((s) => s.start <= cursor && s.end >= cursor);

/** 获取元素尺寸（需要运行时挂载才能获取，这里封装） */
const getSize = (element: HTMLElement): Size => ({
  height: element.clientHeight,
  width: element.clientWidth,
});

// ── 排版核心函数 ─────────────────────────────────────────────

/**
 * 向 body 中逐步填充文本，直到达到或超过容器高度（或出错）
 * 每次调用会新增一个段落块，并返回新的不可变 context
 */
const renderContent = (
  content: string,
  body: HTMLElement,
  context: PageRenderContext,
  sectionIndexs: SectionIndex[],
): PageRenderContext => {
  // 计算本次填写的起止位置
  const startCursor = context.cursor != null ? context.cursor : context.start;
  const endCursor =
    context.end != null
      ? Math.min(context.end, content.length)
      : Math.min(startCursor + STEP, content.length);

  // 维护之前未闭合段落的剩余文本
  const previous =
    context.previous == null
      ? (() => {
          const text = content.slice(
            Math.max(0, startCursor - MAXCONTENTLENGTH),
            startCursor,
          );
          return text.slice(text.lastIndexOf("\n") + 1);
        })()
      : context.previous;

  // 计算下一个章节索引（仅第一次调用时计算）
  let nextSection = context.nextSection;
  if (sectionIndexs.length > 0 && nextSection == null) {
    const ref = startCursor - previous.length - 1;
    const found = getSectionByCursor(sectionIndexs, Math.max(ref, 0));
    const idx = found != null ? found.index : -1;
    nextSection = (idx + 1) % sectionIndexs.length; // 循环
  }

  const trunk = content.slice(startCursor, endCursor);
  if (!trunk) {
    // 无内容可填，标记错误
    return { ...context, error: true };
  }

  let paragraph = context.paragraph;
  let currentPrevious = previous;
  let pos2 = startCursor;

  // 按行切割（保留换行符）
  const lines = trunk.split(/(\n)/);
  for (const line of lines) {
    if (line === "") continue; // split 会产生空串，忽略

    if (line === "\n") {
      // 换行：结束当前段落
      paragraph = null;
      currentPrevious = "";
      pos2 += line.length;
      continue;
    }

    // 如果没有当前段落，创建一个新的 <p>
    if (!paragraph) {
      const p = document.createElement("p");
      p.classList.add("text");
      p.dataset.start = String(pos2);

      // 标记起始被截断的段落
      if (pos2 === 0 || content[pos2 - 1] !== "\n") {
        p.classList.add("text-truncated-start");
      }

      // 检查是否为新章节标题
      if (nextSection != null) {
        const section = sectionIndexs[nextSection];
        if (section?.start === pos2 - currentPrevious.length) {
          p.setAttribute("role", "heading");
          p.setAttribute("aria-level", "3");
          p.classList.add("text-heading");
          nextSection = (nextSection + 1) % sectionIndexs.length;
        }
      }

      body.appendChild(p); // 副作用：插入 DOM（这是排版必需的）
      paragraph = p;
    }

    // 追加文本到当前段落
    paragraph.textContent += line;
    currentPrevious += line;
    pos2 += line.length;
  }

  return {
    ...context,
    paragraph,
    cursor: endCursor,
    previous: currentPrevious,
    nextSection,
    error: false,
  };
};

/**
 * 对单页进行排版（列式），返回下一页起始光标
 * 使用二分查找精确截断溢出内容
 */
const layoutPageColumn = (
  cursor: number,
  body: HTMLElement,
  content: string,
  size: Size,
  sectionIndexs: SectionIndex[],
): number => {
  const { height } = size;
  let context: PageRenderContext = {
    paragraph: null,
    before: null,
    start: ignoreSpaces(content, cursor),
    end: null,
    cursor: ignoreSpaces(content, cursor), // 从跳过空格的位置开始
    previous: null as any,
    error: false,
    nextSection: null,
  };

  // 循环填充，直到溢出或超出限制
  let isOverflow = false;
  const MAX_ITER = 2000; // 防止死循环
  let iter = 0;
  while (!context.error && iter < MAX_ITER) {
    context = renderContent(content, body, context, sectionIndexs);
    iter++;
    // 检测溢出：内容高度超过容器高度
    if (body.clientHeight > height) {
      isOverflow = true;
      break;
    }
    // 额外保护：内容远超容器（比如 4 倍）
    if (body.clientHeight > height * 4) {
      context = { ...context, error: true };
      break;
    }
  }

  const paragraphs = Array.from(
    body.querySelectorAll("p[data-start]"),
  ) as HTMLParagraphElement[];

  let nextCursor: number;

  if (isOverflow) {
    // ── 找出第一个溢出容器的段落 ──
    const rect = body.getBoundingClientRect();
    const firstOut =
      paragraphs
        .slice()
        .reverse()
        .find((p) => p.getBoundingClientRect().bottom > rect.bottom) ??
      paragraphs[0];

    const startPos = Number(firstOut.dataset.start);
    const textNode = firstOut.firstChild as Text | null;
    let low = 0;
    let high = textNode ? textNode.textContent!.length - 1 : -1;
    const range = document.createRange();

    // 二分查找段落内溢出位置
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      range.setStart(textNode!, mid);
      range.setEnd(textNode!, mid + 1);
      if (range.getBoundingClientRect().bottom > rect.bottom) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    // 计算容器应该裁剪到的高度
    let targetHeight: number;
    if (high < 0) {
      targetHeight = firstOut.getBoundingClientRect().top - rect.top;
    } else {
      range.setStart(textNode!, low - 1);
      range.setEnd(textNode!, low);
      targetHeight = range.getBoundingClientRect().bottom - rect.top;
    }

    nextCursor = startPos + low;

    // ── 隐藏溢出部分，并保留不可见 span 以维持对齐特性 ──
    body.style.height = `${targetHeight}px`;
    body.style.overflow = "hidden"; // 原本为 bottom: auto，用 overflow 更合理
  } else {
    nextCursor = context.cursor;
  }

  // ── 清理越过截断点的段落及部分文本 ──
  paragraphs.forEach((paragraph) => {
    const start = Number(paragraph.dataset.start);
    const text = paragraph.textContent ?? "";
    const length = text.length;
    const end = start + length;

    if (start >= nextCursor) {
      paragraph.remove();
    } else if (end > nextCursor) {
      const pos = nextCursor - start;
      const before = text.slice(0, pos);
      const after = text.slice(pos);
      paragraph.textContent = before;

      // 保留溢出文本以维持 text-align: justify 等效果
      const afterSpan = document.createElement("span");
      afterSpan.setAttribute("aria-hidden", "true");
      afterSpan.textContent = after;
      paragraph.appendChild(afterSpan);
      paragraph.classList.add("text-truncated-end");
    }
  });

  return nextCursor;
};

// ── 公开的分页入口（函数式副作用管理） ────────────────────────

/**
 * 排版一页的内容，返回包含容器、下一页光标的对象
 * 调用者负责将 container 插入 pagesContainer
 */
export const layoutPageStartsWith = ({
  content,
  cursor,
  container,
  pagesContainer,
  article,
  sectionIndexs = [],
}: {
  content: string;
  cursor: number;
  container: HTMLElement;
  pagesContainer: HTMLElement;
  article: HTMLElement;
  sectionIndexs?: SectionIndex[];
}): { container: HTMLElement; cursor: number; nextCursor: number } => {
  // 1. 先挂载容器到页面，使样式生效并可测量
  pagesContainer.appendChild(container);
  container.classList.add("read-text-page-processing");

  const size = getSize(article);

  // 2. 执行分页排版
  const nextCursor = layoutPageColumn(
    cursor,
    container, // 在这里 container 充当 body 的角色
    content,
    size,
    sectionIndexs,
  );

  // 3. 完成，移除处理标记并返回
  container.classList.remove("read-text-page-processing");
  // 注意：容器保持在 pagesContainer 中，由外部决定最终位置或移除

  return { container, cursor, nextCursor };
};
