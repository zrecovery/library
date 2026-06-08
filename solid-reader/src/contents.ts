/**
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
 * Patterns that suggest a line is a chapter heading.
 * Using named entries for clarity.
 */
const CHAPTER_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  {
    name: "Chinese chapter",
    pattern: /^第[0-9零一二三四五六七八九十百千万]+[章节卷部篇]/,
  },
  { name: "Numbered section", pattern: /^[0-9]+[\.\、\s]+/ },
  { name: "Preface", pattern: /^序[章言]?/ },
  { name: "Prologue", pattern: /^楔子/ },
  { name: "Epilogue", pattern: /^尾声/ },
  { name: "Afterword", pattern: /^后记/ },
  { name: "Extra", pattern: /^番外/ },
  { name: "Appendix", pattern: /^附录/ },
];

/** Maximum number of contents entries before we give up */
const MAX_ENTRIES = 5000;

/**
 * Check whether a trimmed line looks like a chapter heading.
 */
function isChapterHeading(trimmed: string, customReg: RegExp | null): boolean {
  return (
    CHAPTER_PATTERNS.some(({ pattern }) => pattern.test(trimmed)) ||
    (customReg?.test(trimmed) ?? false)
  );
}

/**
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
 * Get the title of the section containing the given cursor.
 */
export function getCurrentSectionTitle(
  contents: ReadonlyArray<ContentEntry>,
  cursor: number,
): string | null {
  const idx = getContentsIndexAt(contents, cursor);
  return idx >= 0 ? contents[idx].title : null;
}
