/**
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

const SEARCH_LIMIT = 500;

/**
 * Search content for query.
 * Mirrors tiansh/reader: escapes special regex chars, builds a
 * case-insensitive regex, tests each line, collects cursor positions.
 */
export function searchText(content: string, query: string): SearchMatch[] {
  if (!query || !content) return [];

  // Escape special regex characters (same as tReader)
  const escaped = query.replace(
    /[-[\]{}()*+?.,\\^$|#\s]/g,
    (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
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
