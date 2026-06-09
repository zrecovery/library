/**
 * 搜索模块 — 从 tiansh/reader searchpage.js 直接移植。
 *
 * 搜索策略：逐行扫描全文，对用户查询做正则转义后进行大小写不敏感的逐行匹配。
 * 每行最多返回一个匹配，结果列表按文本顺序排列，用户点击即可跳转。
 *
 * Search module — direct port from tiansh/reader searchpage.js.
 *
 * Searches text line-by-line using case-insensitive literal matching.
 * Builds a result list; user clicks to jump.
 */

export interface SearchMatch {
  readonly cursor: number;
  readonly line: string;
  readonly matchStart: number;
  readonly matchLen: number;
}

/**
 * 搜索结果上限 — 扫描到该数量后停止，防止全文过大时性能下降。
 * Maximum number of search results before stopping the scan.
 */
const SEARCH_LIMIT = 2000;

/**
 * 在全文内容中搜索指定查询词。
 * 步骤：① 转义查询中的正则特殊字符确保字面匹配；② 构建大小写不敏感的正则；
 *       ③ 逐行匹配；④ 收集匹配位置（cursor）和上下文行信息。
 *
 * Search content for query.
 * Mirrors tiansh/reader: escapes special regex chars, builds a
 * case-insensitive regex, tests each line, collects cursor positions.
 */
export function searchText(content: string, query: string): SearchMatch[] {
  if (!query || !content) return [];

  // Escape special regex characters so the query is matched literally
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const reg = new RegExp(`(${escaped})`, "iu");

  const lines = content.split("\n");
  const results: SearchMatch[] = [];
  let cursor = 0;

  for (const line of lines) {
    if (results.length >= SEARCH_LIMIT) break;

    const m = line.match(reg);
    if (m && m.index !== undefined) {
      results.push({
        cursor: cursor + m.index,
        line,
        matchStart: m.index,
        matchLen: m[0].length,
      });
    }
    cursor += line.length + 1;
  }

  return results;
}
