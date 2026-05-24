/**
 * Immutable data types for the reader.
 * All state transitions produce new objects rather than mutating existing ones.
 */

// ---- Core types ----

export interface PageLayoutResult {
  readonly cursor: number;
  readonly nextCursor: number;
  /** Serialized innerHTML for each column (1 or 2) */
  readonly columns: readonly string[];
  /** Precise pixel heights for each column (null = use default flex height) */
  readonly columnHeights: readonly (number | null)[];
}

// ---- Configuration ----

export interface ReaderConfig {
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly paragraphSpacing: number;
  readonly textColor: string;
  readonly backgroundColor: string;
  /** Enable two-column layout when width >= threshold */
  readonly twoColumnThreshold: number;
  /** Touch action map: [left, center, right] -> 'prev' | 'next' | 'menu' | 'noop' */
  readonly touchActions: readonly [
    "prev" | "next" | "menu" | "noop",
    "prev" | "next" | "menu" | "noop",
    "prev" | "next" | "menu" | "noop",
  ];
}

export const defaultConfig: ReaderConfig = {
  fontSize: 18,
  lineHeight: 1.5,
  paragraphSpacing: 0.5,
  textColor: "#333333",
  backgroundColor: "#faf8f0",
  twoColumnThreshold: 960,
  touchActions: ["prev", "menu", "next"],
};

// ---- Viewport ----

export interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

export const createViewport = (): ViewportSize => ({
  width:
    typeof window !== "undefined" ? document.documentElement.clientWidth : 800,
  height:
    typeof window !== "undefined" ? document.documentElement.clientHeight : 600,
});
