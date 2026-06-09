/**
 * Index panel — tReader-style overlay with tabs for Contents / Search / Bookmarks.
 * 索引面板：仿 tReader 的全屏覆盖层，包含目录/搜索/书签三个标签页。
 * 整体布局结构：顶部 Header（关闭按钮 + 标签切换栏） + 下方内容区（按当前标签条件渲染对应子组件）。
 */
import {
  createSignal,
  createMemo,
  Show,
  For,
  createEffect,
  on,
  type JSX,
} from "solid-js";
import type { ContentEntry } from "./contents";
import { getContentsIndexAt } from "./contents";
import { searchText, type SearchMatch } from "./search";
import { getBookmarks, addBookmark, removeBookmark } from "./bookmarks";

type Tab = "contents" | "search" | "bookmarks";

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const panelBtnStyle: JSX.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};

const tabBtnStyle: JSX.CSSProperties = {
  ...panelBtnStyle,
  padding: "6px 14px",
  "font-size": "14px",
  "border-radius": "8px",
  "font-weight": "500",
};

const inputStyle = (textColor: string, ico: string): JSX.CSSProperties => ({
  width: "100%",
  padding: "8px 12px",
  "font-size": "14px",
  border: `1px solid ${textColor}${ico}`,
  "border-radius": "8px",
  background: "transparent",
  color: textColor,
  outline: "none",
});

const listItemBtnStyle = (textColor: string): JSX.CSSProperties => ({
  display: "block",
  width: "100%",
  padding: "12px 8px",
  "font-size": "15px",
  "text-align": "left",
  border: "none",
  "border-radius": "6px",
  background: "transparent",
  color: textColor,
  cursor: "pointer",
  "white-space": "nowrap",
  overflow: "hidden",
  "text-overflow": "ellipsis",
});

const emptyMsgStyle: JSX.CSSProperties = {
  opacity: 0.5,
  padding: "20px 0",
};

// ---------------------------------------------------------------------------
// Tiny persistence helper — search state survives panel close/reopen
// ---------------------------------------------------------------------------

/**
 * 创建一个“持久信号”，其值同时保存在闭包内的可变变量中，
 * 因此能在组件挂载/卸载之间存活，但页面刷新时重置为初始值。
 *
 * Creates a signal whose value is also mirrored in a mutable "saved" variable,
 * so it survives component mount/unmount but resets on page refresh.
 */
function createPersistedSignal<T>(initial: T): [() => T, (v: T) => void] {
  let saved: T = initial;
  const [value, setValue] = createSignal<T>(saved);
  const set = (v: T) => {
    saved = v;
    setValue(() => saved);
  };
  return [value, set];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * 在所有搜索结果中找到距离当前光标位置最近的那一条的索引。
 * 用于搜索后自动滚动到离阅读位置最近的匹配项。
 *
 * Find the index of the match closest to `cursor`.
 */
function findNearestMatch(
  results: readonly SearchMatch[],
  cursor: number,
): number {
  if (results.length <= 1) return 0;
  let nearest = 0;
  let minDist = Math.abs(results[0].cursor - cursor);
  for (let i = 1; i < results.length; i++) {
    const d = Math.abs(results[i].cursor - cursor);
    if (d < minDist) {
      minDist = d;
      nearest = i;
    }
  }
  return nearest;
}

/**
 * 将容器内指定索引的子元素滚动到可视区域。
 * 使用 queueMicrotask 延迟到下一微任务执行，确保 DOM 已更新后再滚动。
 *
 * Scroll a specific child of a container into view (deferred).
 */
function scrollChildIntoView(
  container: HTMLElement | undefined,
  index: number,
): void {
  queueMicrotask(() => {
    const el = container?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}

// ---------------------------------------------------------------------------
// Tab sub-components
// ---------------------------------------------------------------------------

interface TabProps {
  textColor: string;
  text: string; // full book text (search needs it)
  cursor: number;
  onNavigate: (cursor: number) => void;
}

/**
 * 目录标签页 — 展示章节列表，支持自定义章节正则匹配。
 * 自动高亮当前所在章节，并在切换标签页时滚动到对应位置。
 */
function ContentsTab(props: {
  textColor: string;
  contents: ContentEntry[];
  cursor: number;
  chapterPattern: string;
  onChapterPatternChange: (pattern: string) => void;
  onNavigate: (cursor: number) => void;
}) {
  const currentChapterIdx = createMemo(() =>
    getContentsIndexAt(props.contents, props.cursor),
  );
  let contentsRef!: HTMLDivElement;

  // Auto-scroll to current chapter when this tab becomes visible.
  // We use createEffect with a ref gate instead of the old createMemo pattern.
  createEffect(
    on(
      () => ({ idx: currentChapterIdx(), ref: contentsRef }),
      ({ idx, ref }) => {
        if (idx >= 0 && ref) {
          scrollChildIntoView(ref, idx);
        }
      },
    ),
  );

  return (
    <>
      <div style={{ padding: "8px 16px 0" }}>
        <input
          type="text"
          value={props.chapterPattern}
          onInput={(e) => props.onChapterPatternChange(e.currentTarget.value)}
          placeholder="Custom regex (e.g. ^第.+章)"
          style={{ ...inputStyle(props.textColor, "22"), "font-size": "14px" }}
        />
      </div>
      <div
        ref={contentsRef}
        style={{ flex: 1, "overflow-y": "auto", padding: "8px 16px" }}
      >
        <For each={props.contents}>
          {(entry, i) => (
            <button
              onClick={() => props.onNavigate(entry.cursor)}
              style={{
                ...listItemBtnStyle(props.textColor),
                background:
                  i() === currentChapterIdx()
                    ? props.textColor + "10"
                    : "transparent",
                "font-weight": i() === currentChapterIdx() ? "bold" : "normal",
              }}
            >
              {i() === currentChapterIdx() ? "▶ " : ""}
              {entry.title}
            </button>
          )}
        </For>
        <Show when={props.contents.length === 0}>
          <p style={emptyMsgStyle}>No chapters detected.</p>
        </Show>
      </div>
    </>
  );
}

/**
 * 搜索标签页 — 提供全文搜索功能，支持回车触发搜索。
 * 搜索结果按行匹配，高亮匹配文本，点击可跳转到对应位置。
 * 搜索状态通过 createPersistedSignal 在面板关闭/重开间保持。
 */
function SearchTab(props: TabProps) {
  const [searchQuery, setSearchQuery] = createPersistedSignal("");
  const [searchResults, setSearchResults] = createPersistedSignal<
    SearchMatch[]
  >([]);
  let searchListRef!: HTMLDivElement;

  const doSearch = () => {
    const q = searchQuery().trim();
    const results = q ? searchText(props.text, q) : [];
    setSearchResults(results);
    if (results.length > 0) {
      const nearest = findNearestMatch(results, props.cursor);
      scrollChildIntoView(searchListRef, nearest);
    }
  };

  return (
    <>
      <div style={{ padding: "12px 16px", display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doSearch();
          }}
          placeholder="Search..."
          style={{
            ...inputStyle(props.textColor, "33"),
            flex: "1",
            padding: "10px 12px",
            "font-size": "16px",
          }}
        />
        <button
          onClick={doSearch}
          style={{ ...panelBtnStyle, padding: "10px 16px" }}
        >
          Go
        </button>
      </div>
      <div
        ref={searchListRef}
        style={{ flex: 1, "overflow-y": "auto", padding: "0 16px" }}
      >
        <Show when={searchResults().length > 0}>
          <p
            style={{
              "font-size": "12px",
              opacity: 0.5,
              margin: "0 0 8px 4px",
            }}
          >
            {searchResults().length} results
          </p>
          <For each={searchResults()}>
            {(m) => {
              const before = m.line.slice(
                Math.max(0, m.matchStart - 12),
                m.matchStart,
              );
              const match = m.line.slice(
                m.matchStart,
                m.matchStart + m.matchLen,
              );
              const after = m.line.slice(
                m.matchStart + m.matchLen,
                m.matchStart + m.matchLen + 120,
              );
              return (
                <button
                  onClick={() => props.onNavigate(m.cursor)}
                  style={{
                    ...listItemBtnStyle(props.textColor),
                    "line-height": "2.4",
                    "min-height": "50px",
                    padding: "12px 10px",
                  }}
                >
                  {before}
                  <mark
                    style={{
                      color: props.textColor,
                      background: props.textColor + "25",
                      "font-weight": "bold",
                    }}
                  >
                    {match}
                  </mark>
                  {after}
                </button>
              );
            }}
          </For>
        </Show>
        <Show when={searchQuery().trim() && searchResults().length === 0}>
          <p style={emptyMsgStyle}>No matches for "{searchQuery().trim()}"</p>
        </Show>
      </div>
    </>
  );
}

/**
 * 书签标签页 — 展示已保存的书签列表，支持添加和删除书签。
 * 每个书签记录阅读进度（百分比），点击可跳转。
 */
function BookmarksTab(props: {
  textColor: string;
  cursor: number;
  text: string;
  onNavigate: (cursor: number) => void;
}) {
  const bookmarks = createMemo(() => getBookmarks());

  return (
    <>
      <div
        style={{
          padding: "12px 16px 0",
          display: "flex",
          "justify-content": "flex-end",
        }}
      >
        <button
          onClick={() => {
            const label = prompt(
              "Bookmark label:",
              `${((props.cursor / props.text.length) * 100).toFixed(1)}%`,
            );
            addBookmark(props.cursor, props.text.length, label || undefined);
          }}
          style={{
            ...panelBtnStyle,
            padding: "8px 14px",
            "font-size": "14px",
          }}
        >
          + Add
        </button>
      </div>
      <div style={{ flex: 1, "overflow-y": "auto", padding: "8px 16px" }}>
        <For each={bookmarks()}>
          {(bm) => (
            <div
              style={{
                display: "flex",
                "align-items": "center",
                gap: "4px",
              }}
            >
              <button
                onClick={() => props.onNavigate(bm.cursor)}
                style={{
                  ...listItemBtnStyle(props.textColor),
                  flex: "1",
                  "font-size": "14px",
                }}
              >
                {bm.label} – {bm.percent}%
              </button>
              <button
                onClick={() => removeBookmark(bm.id)}
                style={{
                  ...panelBtnStyle,
                  padding: "4px 8px",
                  "font-size": "12px",
                  color: "#e74c3c",
                }}
              >
                ✕
              </button>
            </div>
          )}
        </For>
        <Show when={bookmarks().length === 0}>
          <p style={emptyMsgStyle}>No bookmarks.</p>
        </Show>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Panel shell — 面板壳组件
// 整体布局：全屏绝对定位 → Header（关闭 + 标签切换） → 内容区（条件渲染子标签页）
// ---------------------------------------------------------------------------

/**
 * 索引面板壳组件 — 全屏覆盖层容器。
 * 结构：顶部 Header 栏（关闭按钮 + Contents/Search/Bookmarks 标签切换）
 *       下方 flex 内容区，按当前选中标签条件渲染 ContentsTab / SearchTab / BookmarksTab。
 */
export function IndexPanel(props: {
  text: string;
  cursor: number;
  contents: ContentEntry[];
  chapterPattern: string;
  onChapterPatternChange: (pattern: string) => void;
  textColor: string;
  backgroundColor: string;
  initialTab?: Tab;
  onNavigate: (cursor: number) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = createSignal<Tab>(props.initialTab ?? "contents");

  const activeTabStyle = (t: Tab) => ({
    ...tabBtnStyle,
    color: tab() === t ? props.textColor : props.textColor + "60",
    background: tab() === t ? props.textColor + "12" : "transparent",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        "z-index": 20,
        background: props.backgroundColor,
        color: props.textColor,
        display: "flex",
        "flex-direction": "column",
        padding: "max(16px, env(safe-area-inset-top, 0px)) 0 0 0",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          "align-items": "center",
          padding: "8px 16px 0",
          gap: "8px",
        }}
      >
        <button
          onClick={props.onClose}
          style={{ ...panelBtnStyle, "font-size": "18px", padding: "4px 8px" }}
        >
          ✕
        </button>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: props.textColor + "10",
            "border-radius": "10px",
            padding: "3px",
          }}
        >
          <button
            onClick={() => setTab("contents")}
            style={activeTabStyle("contents")}
          >
            Chapters
          </button>
          <button
            onClick={() => setTab("search")}
            style={activeTabStyle("search")}
          >
            Search
          </button>
          <button
            onClick={() => setTab("bookmarks")}
            style={activeTabStyle("bookmarks")}
          >
            Bookmarks
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          "flex-direction": "column",
        }}
      >
        {/* CONTENTS TAB */}
        <Show when={tab() === "contents"}>
          <ContentsTab
            textColor={props.textColor}
            contents={props.contents}
            cursor={props.cursor}
            chapterPattern={props.chapterPattern}
            onChapterPatternChange={props.onChapterPatternChange}
            onNavigate={props.onNavigate}
          />
        </Show>

        {/* SEARCH TAB */}
        <Show when={tab() === "search"}>
          <SearchTab
            textColor={props.textColor}
            text={props.text}
            cursor={props.cursor}
            onNavigate={props.onNavigate}
          />
        </Show>

        {/* BOOKMARKS TAB */}
        <Show when={tab() === "bookmarks"}>
          <BookmarksTab
            textColor={props.textColor}
            cursor={props.cursor}
            text={props.text}
            onNavigate={props.onNavigate}
          />
        </Show>
      </div>
    </div>
  );
}
