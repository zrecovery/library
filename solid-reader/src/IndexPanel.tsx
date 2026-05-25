/**
 * Index panel — tReader-style overlay with tabs for Contents / Search / Bookmarks.
 */
import { createSignal, createMemo, Show, For } from "solid-js";
import type { ContentEntry } from "./contents";
import { getContentsIndexAt } from "./contents";
import { searchText, type SearchMatch } from "./search";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  type Bookmark,
} from "./bookmarks";

type Tab = "contents" | "search" | "bookmarks";

// Persist search state across panel open/close (clears on page refresh)
let savedSearchQuery = "";
let savedSearchResults: SearchMatch[] = [];

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
  const [searchQuery, setSearchQuery] = createSignal(savedSearchQuery);
  const [searchResults, setSearchResults] =
    createSignal<SearchMatch[]>(savedSearchResults);
  const bookmarks = createMemo(() => getBookmarks());
  const currentChapterIdx = createMemo(() =>
    getContentsIndexAt(props.contents, props.cursor),
  );
  let contentsRef!: HTMLDivElement;
  let searchListRef!: HTMLDivElement;

  const activeTabStyle = (t: Tab) => ({
    ...tabBtnStyle,
    color: tab() === t ? props.textColor : props.textColor + "60",
    background: tab() === t ? props.textColor + "12" : "transparent",
  });

  const doSearch = () => {
    const q = searchQuery().trim();
    savedSearchQuery = q;
    const results = q ? searchText(props.text, q) : [];
    savedSearchResults = results;
    setSearchResults(results);
    if (results.length > 0) {
      // Find the match nearest to current cursor
      let nearest = 0;
      let minDist = Math.abs(results[0].cursor - props.cursor);
      for (let i = 1; i < results.length; i++) {
        const d = Math.abs(results[i].cursor - props.cursor);
        if (d < minDist) {
          minDist = d;
          nearest = i;
        }
      }
      // Scroll to the nearest match after render
      queueMicrotask(() => {
        const el = searchListRef?.children[nearest] as HTMLElement | undefined;
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    }
  };

  const scrollToChapter = () => {
    const idx = currentChapterIdx();
    if (idx >= 0 && contentsRef) {
      const c = contentsRef.children[idx] as HTMLElement | undefined;
      c?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  // Auto-scroll when contents tab opens
  createMemo(() => {
    if (tab() === "contents") queueMicrotask(scrollToChapter);
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
          <div style={{ padding: "8px 16px 0" }}>
            <input
              type="text"
              value={props.chapterPattern}
              onInput={(e) =>
                props.onChapterPatternChange(e.currentTarget.value)
              }
              placeholder="Custom regex (e.g. ^第.+章)"
              style={{
                width: "100%",
                padding: "8px 12px",
                "font-size": "14px",
                border: `1px solid ${props.textColor}22`,
                "border-radius": "8px",
                background: "transparent",
                color: props.textColor,
                outline: "none",
              }}
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
                    display: "block",
                    width: "100%",
                    padding: "12px 8px",
                    "font-size": "15px",
                    "text-align": "left",
                    background:
                      i() === currentChapterIdx()
                        ? props.textColor + "10"
                        : "transparent",
                    border: "none",
                    "border-radius": "6px",
                    color: props.textColor,
                    cursor: "pointer",
                    "font-weight":
                      i() === currentChapterIdx() ? "bold" : "normal",
                    "white-space": "nowrap",
                    overflow: "hidden",
                    "text-overflow": "ellipsis",
                  }}
                >
                  {i() === currentChapterIdx() ? "▶ " : ""}
                  {entry.title}
                </button>
              )}
            </For>
            <Show when={props.contents.length === 0}>
              <p style={{ opacity: 0.5, padding: "20px 0" }}>
                No chapters detected.
              </p>
            </Show>
          </div>
        </Show>

        {/* SEARCH TAB */}
        <Show when={tab() === "search"}>
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
                flex: "1",
                padding: "10px 12px",
                "font-size": "16px",
                border: `1px solid ${props.textColor}33`,
                "border-radius": "8px",
                background: "transparent",
                color: props.textColor,
                outline: "none",
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
                        display: "block",
                        width: "100%",
                        padding: "12px 10px",
                        "font-size": "15px",
                        "text-align": "left",
                        border: "none",
                        "border-radius": "6px",
                        background: "transparent",
                        color: props.textColor,
                        cursor: "pointer",
                        "white-space": "nowrap",
                        overflow: "hidden",
                        "text-overflow": "ellipsis",
                        "line-height": "2.4",
                        "min-height": "50px",
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
              <p style={{ opacity: 0.5, padding: "20px 0" }}>
                No matches for "{searchQuery().trim()}"
              </p>
            </Show>
          </div>
        </Show>

        {/* BOOKMARKS TAB */}
        <Show when={tab() === "bookmarks"}>
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
                addBookmark(
                  props.cursor,
                  props.text.length,
                  label || undefined,
                );
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
                      flex: "1",
                      display: "block",
                      padding: "12px 8px",
                      "font-size": "14px",
                      "text-align": "left",
                      border: "none",
                      "border-radius": "6px",
                      background: "transparent",
                      color: props.textColor,
                      cursor: "pointer",
                      "white-space": "nowrap",
                      overflow: "hidden",
                      "text-overflow": "ellipsis",
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
              <p style={{ opacity: 0.5, padding: "20px 0" }}>No bookmarks.</p>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
}

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
