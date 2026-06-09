/**
 * 阅读器的不可变数据类型。
 * 所有状态迁移都生成新对象，不修改已有对象（不可变范式）。
 *
 * Immutable data types for the reader.
 * All state transitions produce new objects rather than mutating existing ones.
 */

// ---- Core types 核心类型 ----

/**
 * 单页布局结果 — 描述排版引擎计算出的一个页面。
 * cursor: 该页起始字符位置
 * nextCursor: 下一页起始字符位置
 * columns: 每列的序列化 innerHTML（1列或2列）
 * columnHeights: 每列的精确像素高度（null 表示使用默认 flex 高度）
 */
export interface PageLayoutResult {
  readonly cursor: number;
  readonly nextCursor: number;
  /** Serialized innerHTML for each column (1 or 2) */
  readonly columns: readonly string[];
  /** Precise pixel heights for each column (null = use default flex height) */
  readonly columnHeights: readonly (number | null)[];
}

// ---- Configuration 阅读器配置 ----

/**
 * 阅读器配置 — 控制字体、颜色、分栏、触摸操作等外观和行为参数。
 */
export interface ReaderConfig {
  /** 字体大小（px） */
  readonly fontSize: number;
  /** 行高倍率 */
  readonly lineHeight: number;
  /** 段落间距（em） */
  readonly paragraphSpacing: number;
  /** 文字颜色 */
  readonly textColor: string;
  /** 背景颜色 */
  readonly backgroundColor: string;
  /** Enable two-column layout when width >= threshold */
  /** 当容器宽度 ≥ 此阈值时启用双栏布局 */
  readonly twoColumnThreshold: number;
  /** Touch action map: [left, center, right] -> 'prev' | 'next' | 'menu' | 'noop' */
  /** 触摸区域映射：[左, 中, 右] -> 'prev'(上一页) | 'next'(下一页) | 'menu'(菜单) | 'noop'(无操作) */
  readonly touchActions: readonly [
    "prev" | "next" | "menu" | "noop",
    "prev" | "next" | "menu" | "noop",
    "prev" | "next" | "menu" | "noop",
  ];
}

/** 默认阅读器配置 */
export const defaultConfig: ReaderConfig = {
  fontSize: 18,
  lineHeight: 1.5,
  paragraphSpacing: 0.5,
  textColor: "#333333",
  backgroundColor: "#faf8f0",
  twoColumnThreshold: 960,
  touchActions: ["prev", "menu", "next"],
};

// ---- Viewport 视口 ----

/** 视口尺寸 — 当前可视区域的宽高 */
export interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

/** 创建当前视口尺寸对象（SSR 安全：服务端返回默认值 800x600） */
export const createViewport = (): ViewportSize => ({
  width:
    typeof window !== "undefined" ? document.documentElement.clientWidth : 800,
  height:
    typeof window !== "undefined" ? document.documentElement.clientHeight : 600,
});
