/**
 * 目录 / 章节模块。
 *
 * 扫描文本内容识别章节标题并生成目录。
 * 基于 tiansh/reader 的思路：将较短的行（尤其是匹配章节模式如"第X章"）识别为标题条目。
 * 每个条目包含：{ cursor: 字符位置, title: 标题文本 }
 *
 * Contents / Chapters module.
 *
 * Scans text content for chapter headings and generates a table of contents.
 * Based on tiansh/reader approach: identifies short lines (especially those
 * matching chapter patterns like "第X章") as heading entries.
 *
 * Each entry: { cursor: number, title: string }
 */

export interface ContentEntry {
  /** Character position in the full text where this chapter starts */
  readonly cursor: number;
  /** Chapter title */
  readonly title: string;
}

/** Maximum line length to consider as a potential heading */
const MAX_HEADING_LENGTH = 100;

/**
 * 预定义的章节标题匹配模式。
 * 每个模式包含 name（类型标识）和 pattern（正则表达式）。
 *
 * Patterns that suggest a line is a chapter heading.
 * Using named entries for clarity.
 */
const CHAPTER_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  {
    name: "Chinese chapter",
    pattern: /^第[0-9零一二三四五六七八九十百千万]+[章节卷部篇]/,
    // 中文章节：匹配"第X章"、"第XX卷"等，支持中文数字和阿拉伯数字
  },
  {
    name: "Numbered section",
    pattern: /^[0-9]+[\.\、\s]+/,
    // 数字编号：匹配"1."、"2、"等数字开头的节标题
  },
  {
    name: "Preface",
    pattern: /^序[章言]?/,
    // 序言：匹配"序"、"序章"、"序言"
  },
  {
    name: "Prologue",
    pattern: /^楔子/,
    // 楔子 / 引子
  },
  {
    name: "Epilogue",
    pattern: /^尾声/,
    // 尾声 / 结局
  },
  {
    name: "Afterword",
    pattern: /^后记/,
    // 后记 / 后话
  },
  {
    name: "Extra",
    pattern: /^番外/,
    // 番外篇
  },
  {
    name: "Appendix",
    pattern: /^附录/,
    // 附录
  },
];

/** Maximum number of contents entries before we give up */
const MAX_ENTRIES = 5000;

/**
 * 判断一个已 trim 的行是否像是章节标题。
 * 检查是否命中预定义模式或用户提供的自定义正则。
 *
 * Check whether a trimmed line looks like a chapter heading.
 */
function isChapterHeading(trimmed: string, customReg: RegExp | null): boolean {
  return (
    CHAPTER_PATTERNS.some(({ pattern }) => pattern.test(trimmed)) ||
    (customReg?.test(trimmed) ?? false)
  );
}

/**
 * 从文本内容生成目录。
 *
 * 扫描算法：① 按换行符拆分全文；② 逐行遍历，维护字符位置累计偏移量 cursor；
 * ③ 对每行 trim 后检查：长度 ≤ MAX_HEADING_LENGTH（100字符）且命中章节模式或自定义正则；
 * ④ 命中的行记录其 cursor 和 trim 后的标题文本；⑤ 达到 MAX_ENTRIES 上限时提前终止。
 *
 * Generate table of contents from text content.
 * Lines that are short (≤ MAX_HEADING_LENGTH) and match chapter-like
 * patterns or a custom regex are treated as headings.
 */
export function generateContents(
  content: string,
  customPattern?: string,
): ContentEntry[] {
  if (!content) return [];

  let customReg: RegExp | null = null;
  if (customPattern) {
    try {
      customReg = new RegExp(customPattern, "iu");
    } catch {
      /* invalid regex, ignore */
    }
  }

  const lines = content.split("\n");
  const entries: ContentEntry[] = [];
  let cursor = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed && trimmed.length <= MAX_HEADING_LENGTH) {
      if (isChapterHeading(trimmed, customReg)) {
        entries.push({
          // cursor points to start of this line (before we add its length)
          cursor,
          title: trimmed,
        });
        if (entries.length >= MAX_ENTRIES) break;
      }
    }

    cursor += line.length + 1;
  }

  return entries;
}

/**
 * 查找在给定光标位置处或之前最近的目录条目索引。
 * 返回目录列表中的索引，如果光标位置在所有条目之前则返回 -1。
 *
 * Find the contents entry at or just before a given cursor position.
 * Returns the index into the contents list, or -1 if not found.
 */
export function getContentsIndexAt(
  contents: ReadonlyArray<ContentEntry>,
  cursor: number,
): number {
  let idx = -1;
  for (let i = 0; i < contents.length; i++) {
    if (contents[i].cursor <= cursor) idx = i;
    else break;
  }
  return idx;
}

/**
 * 获取包含给定光标位置的章节标题。如果未找到返回 null。
 *
 * Get the title of the section containing the given cursor.
 */
export function getCurrentSectionTitle(
  contents: ReadonlyArray<ContentEntry>,
  cursor: number,
): string | null {
  const idx = getContentsIndexAt(contents, cursor);
  return idx >= 0 ? contents[idx].title : null;
}
