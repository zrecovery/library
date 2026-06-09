/**
 * FlipPage - 核心分页组件。
 *
 * 布局策略（参考 tiansh/reader）：
 *   - 列 (.read-body) 使用 position:absolute 搭配 top/bottom，
 *     而非 flexbox。这样可以在布局后设置精确的测量高度。
 *   - 测量期间 overflow:visible 让内容自由流动。
 *   - 测量后，在列上设置精确高度，使其正好在测量边界处裁剪（不产生半行）。
 *
 * FlipPage - core pagination component.
 *
 * Layout strategy (mirrors tiansh/reader):
 *   - Columns (.read-body) use position:absolute with top/bottom,
 *     NOT flexbox. This lets us set precise measured height after layout.
 *   - During measurement, overflow:visible lets content flow freely.
 *   - After measurement, we set exact height on the column so it
 *     crops at exactly the measured boundary (no half-lines).
 */

import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import type { PageLayoutResult, ReaderConfig, ViewportSize } from "./types";
import { layoutPage, layoutPageEndingAt } from "./layout-engine";
import { getContentsIndexAt } from "./contents";

/**
 * FlipPage 组件的 props 接口。
 * Interface for FlipPage component props.
 */
export interface FlipPageProps {
  /** HTML 内容字符串。HTML content string. */
  content: string;
  /** 当前阅读位置（字符游标）。Current reading position (character cursor). */
  cursor: number;
  /** 视口宽度（像素）。Viewport width in pixels. */
  viewportWidth: number;
  /** 视口高度（像素）。Viewport height in pixels. */
  viewportHeight: number;
  /** 字体大小（像素）。Font size in pixels. */
  fontSize: number;
  /** 行高倍数。Line height multiplier. */
  lineHeight: number;
  /** 段落间距（像素）。Paragraph spacing in pixels. */
  paragraphSpacing: number;
  /** 文字颜色。Text color. */
  textColor: string;
  /** 背景颜色。Background color. */
  backgroundColor: string;
  /** 双列模式的宽度阈值（像素）。Width threshold for two-column mode in pixels. */
  twoColumnThreshold: number;
  /** 触摸区域动作配置：[左, 中, 右]。Touch zone action config: [left, center, right]. */
  touchActions: readonly [string, string, string];
  /** 目录/章节列表。Table of contents / chapter list. */
  contentsList: ReadonlyArray<{ cursor: number; title: string }>;
  /** 游标变化回调。Callback when cursor changes. */
  onCursorChange: (cursor: number) => void;
  /** 菜单请求回调（长按/右键/点击中间区域）。Menu request callback (long press / right click / center tap). */
  onMenuRequest: () => void;
}

// ============================================================================
// 模块级样式常量
// Module-level style constants
// ============================================================================

/** 共享的列样式属性，不会改变。
 * Shared column style properties that never change. */
const COL_BASE: Record<string, string> = {
  position: "absolute",
  top: "max(16px, env(safe-area-inset-top, 0px))",
  bottom: "max(36px, calc(env(safe-area-inset-bottom, 0px) + 20px))",
  overflow: "hidden",
  "overflow-wrap": "break-word",
  "word-break": "break-all",
  "box-sizing": "border-box",
};

/** 单列模式定位：左右边距之间占满全宽。
 * Single-column position: spans full width between margins. */
const COL_SINGLE: Record<string, string> = {
  left: "16px",
  right: "16px",
};

/** 双列模式左列：左对齐，右边界到 50%，右侧内边距 16px。
 * Left column in two-column mode: anchored left, extends to 50% with right padding. */
const COL_TWO_LEFT: Record<string, string> = {
  left: "16px",
  right: "50%",
  "padding-right": "16px",
};

/** 双列模式右列：右对齐，左边界从 50% 开始，左侧内边距 16px。
 * Right column in two-column mode: anchored right, extends from 50% with left padding. */
const COL_TWO_RIGHT: Record<string, string> = {
  left: "50%",
  right: "16px",
  "padding-left": "16px",
};

/** 容器包裹样式（动态属性如 background-color 以行内样式应用）。
 * Container wrapper style (dynamic props like background-color applied inline). */
const CONTAINER_STYLE: Record<string, string> = {
  position: "absolute",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
  overflow: "hidden",
  cursor: "default",
  "user-select": "none",
  "touch-action": "manipulation",
};

/** 页面层包裹样式——主层和克隆层共用。
 * Page layer wrapper — shared by both main and clone layers. */
const PAGE_LAYER_STYLE: Record<string, string> = {
  position: "absolute",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
};

/** 进度条容器样式。
 * Progress bar container. */
const PROGRESS_CONTAINER_STYLE: Record<string, string> = {
  position: "absolute",
  bottom: "0",
  left: "0",
  right: "0",
  display: "flex",
  "justify-content": "space-between",
  padding: "4px 16px",
  "padding-bottom": "max(4px, env(safe-area-inset-bottom, 0px))",
  "font-size": "12px",
  "line-height": "1.2",
  opacity: "0.35",
  "pointer-events": "none",
  "z-index": "1",
};

/** 进度条中的章节标签样式。
 * Chapter label in the progress bar. */
const CHAPTER_LABEL_STYLE: Record<string, string> = {
  overflow: "hidden",
  "text-overflow": "ellipsis",
  "white-space": "nowrap",
  "max-width": "70%",
};

/** 左箭头指示器样式。
 * Left arrow indicator. */
const ARROW_LEFT_STYLE: Record<string, string> = {
  position: "absolute",
  left: "8px",
  top: "50%",
  transform: "translateY(-50%)",
  "font-size": "28px",
  opacity: "0.12",
  "pointer-events": "none",
};

/** 右箭头指示器样式。
 * Right arrow indicator. */
const ARROW_RIGHT_STYLE: Record<string, string> = {
  position: "absolute",
  right: "8px",
  top: "50%",
  transform: "translateY(-50%)",
  "font-size": "28px",
  opacity: "0.12",
  "pointer-events": "none",
};

/** 点击区域样式工厂——返回指定位置区域的样式对象。
 * Factory for click zone styles — returns a style object for a zone at the given position. */
const clickZoneStyle = (
  left: string,
  right: string,
  width: string,
): Record<string, string> => ({
  position: "absolute",
  top: "0",
  left,
  right,
  bottom: "0",
  width,
  cursor: "pointer",
  "z-index": "2",
  background: "rgba(0,0,0,0.0001)",
});

/** 预构建的点击区域样式：左侧 1/3、中间 1/3、右侧 1/3。
 * Pre-built click zone styles. */
const CLICK_ZONE_LEFT_STYLE = clickZoneStyle("0", "auto", "33.33%");
const CLICK_ZONE_CENTER_STYLE = clickZoneStyle("33.33%", "auto", "33.34%");
const CLICK_ZONE_RIGHT_STYLE = clickZoneStyle("auto", "0", "33.33%");

// ============================================================================
// 内部辅助函数
// Internal helpers
// ============================================================================

/** 从 props 构建完整的 ReaderConfig。提取此函数以避免重复。
 * Build a full layout config from props. Extracted to avoid duplication. */
function buildLayoutConfig(props: FlipPageProps): ReaderConfig {
  return {
    fontSize: props.fontSize,
    lineHeight: props.lineHeight,
    paragraphSpacing: props.paragraphSpacing,
    textColor: props.textColor,
    backgroundColor: props.backgroundColor,
    twoColumnThreshold: props.twoColumnThreshold,
    touchActions: ["prev", "menu", "next"],
  };
}

/** 检查两点坐标是否超过距离阈值。
 * Check if two coordinates exceed a distance threshold. */
const exceededThreshold = (
  dx: number,
  dy: number,
  threshold: number,
): boolean => Math.hypot(dx, dy) > threshold;

/** 将触摸/点击的 x 坐标转换为相对于容器矩形的区域索引 [0, 1, 2]。
 * Convert a touch/click x-position to a zone index [0, 1, 2] relative to the container rect. */
const zoneFromX = (clientX: number, rect: DOMRect): number =>
  Math.floor(((clientX - rect.left) / rect.width) * 3);

/** 区域对应的动作类型。
 * Action type for a zone. */
type ZoneAction = "prev" | "next" | "menu";

/** 安全解析触摸区域动作，对索引做边界裁剪。
 * Resolve touchActions array lookup with clamping. */
const resolveZoneAction = (
  touchActions: readonly [string, string, string],
  zone: number,
): ZoneAction => {
  // 将 zone 裁剪到 [0, 2] 范围
  const clamped = Math.min(Math.max(zone, 0), 2);
  return (touchActions[clamped] as ZoneAction) ?? "menu";
};

// ============================================================================
// usePageAnimation — 动画变换、过渡和克隆状态管理
// usePageAnimation — animation transforms, transitions, and clone state
// ============================================================================

/** 页面动画的接口。
 * Interface for page animation state and controls. */
export interface PageAnimation {
  /** 当前动画方向："prev" | "next" | null。Current animation direction. */
  animating: () => "prev" | "next" | null;
  /** 主层的 CSS transform 值。CSS transform for the main layer. */
  mainTransform: () => string;
  /** 克隆层的 CSS transform 值。CSS transform for the clone layer. */
  cloneTransform: () => string;
  /** 主层的 CSS transition 值。CSS transition for the main layer. */
  mainTransition: () => string;
  /** 是否存在克隆层内容。Whether clone layer has content. */
  hasClone: () => boolean;
  /** 克隆层的左列 HTML 内容。Clone layer left column HTML. */
  cloneHTML: () => string;
  /** 克隆层的右列 HTML 内容。Clone layer right column HTML. */
  cloneRight: () => string;
  /** 克隆层是否为双列模式。Whether clone is in two-column mode. */
  cloneTwoCol: () => boolean;
  /** 设置动画方向。Set animation direction. */
  setAnimating: (v: "prev" | "next" | null) => void;
  /** 根据当前布局保存克隆内容（在翻页动画前调用）。Save clone from current layout (called before flip animation). */
  saveCloneFromLayout: (layout: PageLayoutResult) => void;
  /** 清除克隆层内容。Clear clone layer content. */
  clearClone: () => void;
  /** 当前滑动偏移量（像素）。Current swipe offset in pixels. */
  swipeOff: () => number;
  /** 设置滑动偏移量。Set swipe offset. */
  setSwipeOff: (v: number) => void;
}

/**
 * 页面动画 hook——管理翻页动画的变换、过渡和克隆层状态。
 * Page animation hook — manages transform, transition, and clone state for page flip animations.
 */
function usePageAnimation(): PageAnimation {
  const [animating, setAnimating] = createSignal<"prev" | "next" | null>(null);
  const [cloneHTML, setCloneHTML] = createSignal("");
  const [cloneRight, setCloneRight] = createSignal("");
  const [cloneTwoCol, setCloneTwoCol] = createSignal(false);
  const [swipeOff, setSwipeOff] = createSignal(0);

  const mainTransform = () => {
    if (swipeOff()) return `translateX(${swipeOff()}px)`;
    if (animating() === "next") return "translateX(-100%)";
    if (animating() === "prev") return "translateX(100%)";
    return "translateX(0)";
  };

  // 克隆层初始位于屏幕右侧之外（110%），动画时滑入到 0
  // Clone starts off-screen right (110%), slides in to 0 during animation
  const cloneTransform = () =>
    !animating() ? "translateX(110%)" : "translateX(0)";

  // 动画进行中或滑动中时禁用 transition，让变换即时响应
  // Disable transition during animation or swipe for instant response
  const mainTransition = () =>
    animating() || swipeOff()
      ? "none"
      : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";

  const hasClone = () => cloneHTML() !== "";

  const saveCloneFromLayout = (layout: PageLayoutResult) => {
    setCloneHTML(layout.columns[0] ?? "");
    setCloneRight(layout.columns[1] ?? "");
    setCloneTwoCol(!!(layout.columns.length > 1 && layout.columns[1]));
  };

  const clearClone = () => {
    setCloneHTML("");
    setCloneRight("");
    setCloneTwoCol(false);
  };

  return {
    animating,
    mainTransform,
    cloneTransform,
    mainTransition,
    hasClone,
    cloneHTML,
    cloneRight,
    cloneTwoCol,
    setAnimating,
    saveCloneFromLayout,
    clearClone,
    swipeOff,
    setSwipeOff,
  };
}

// ============================================================================
// usePageNavigation — 翻页逻辑
// usePageNavigation — page turning logic
// ============================================================================

/** 页面导航的接口。
 * Interface for page navigation controls. */
export interface PageNavigation {
  /** 当前布局结果。Current layout result. */
  currentLayout: () => PageLayoutResult | null;
  /** 设置布局结果。Set layout result. */
  setLayout: (l: PageLayoutResult) => void;
  /** 是否可以翻到下一页。Whether next page is available. */
  canGoNext: () => boolean;
  /** 是否可以翻到上一页。Whether previous page is available. */
  canGoPrev: () => boolean;
  /** 翻到下一页。Go to next page. */
  goNext: () => void;
  /** 翻到上一页。Go to previous page. */
  goPrev: () => void;
  /**
   * 初始或依赖变化时调用，重新计算并设置页面布局。
   * Called on initial/dependency change to recompute and set the page.
   */
  computeAndSetLayout: (cursor: number) => void;
}

// ============================================================================
// 布局计算相关（从 usePageNavigation 中拆分）
// Layout computation helpers (extracted from usePageNavigation)
// ============================================================================

/**
 * 创建布局计算相关的函数：computePage、injectLayout、scheduleInject。
 * 这些函数按固定顺序配合工作：
 *   1. computePage(start) —— 测量给定起始位置的一个页面内容
 *   2. injectLayout() —— 将测量结果写入 DOM 列元素
 *   3. scheduleInject() —— 延迟到微任务中执行注入，确保状态更新已完成
 *
 * Creates layout computation functions: computePage, injectLayout, scheduleInject.
 */
function createLayoutComputation(
  props: FlipPageProps,
  containerRef: HTMLDivElement,
  leftRef: HTMLDivElement,
  rightRef: HTMLDivElement,
  layout: () => PageLayoutResult | null,
  setLayout: (l: PageLayoutResult) => void,
) {
  let pendingInject: (() => void) | null = null;

  /**
   * 测量页面：从 start 游标开始，计算刚好填满视口的内容范围。
   * Compute a page: starting from start cursor, calculate the content range that fits the viewport.
   */
  const computePage = (start: number): PageLayoutResult | null => {
    if (!containerRef || !props.content) return null;
    // 将起始游标裁剪到有效范围
    const sc = Math.max(0, Math.min(start, props.content.length));
    const w = props.viewportWidth;
    const h = props.viewportHeight;
    if (w <= 0 || h <= 0) return null;
    const viewport: ViewportSize = { width: w, height: h };
    // 调用布局引擎进行实际的页面测量
    return layoutPage(
      containerRef,
      props.content,
      sc,
      viewport,
      buildLayoutConfig(props),
      props.contentsList,
    );
  };

  /**
   * 将当前布局结果注入 DOM：设置列元素的 innerHTML 和精确高度。
   * 设置精确高度是为了裁剪半行、防止内容溢出。
   *
   * Inject current layout into DOM: set column innerHTML and exact heights.
   * Exact heights are set to crop half-lines and prevent overflow.
   */
  const injectLayout = () => {
    const l = layout();
    if (!l) return;

    // 对单个列应用 HTML 内容和精确高度
    const apply = (
      ref: HTMLDivElement | undefined,
      html: string | undefined,
      h: number | null | undefined,
    ) => {
      if (!ref) return;
      ref.innerHTML = html ?? "";
      if (h != null) {
        // 有测量高度：设置固定高度，取消自动 bottom
        ref.style.height = h + "px";
        ref.style.bottom = "auto";
      } else {
        // 无测量高度：恢复默认（撑满可用空间）
        ref.style.height = "";
        ref.style.bottom = "";
      }
    };
    apply(leftRef, l.columns[0], l.columnHeights?.[0]);
    apply(rightRef, l.columns[1], l.columnHeights?.[1]);
  };

  /**
   * 将 injectLayout 延迟到微任务中执行。
   * 这样可以确保 setLayout 触发的任何响应式更新先完成。
   *
   * Schedule injectLayout to run in a microtask.
   * This ensures any reactive updates from setLayout complete first.
   */
  const scheduleInject = () => {
    pendingInject = injectLayout;
    queueMicrotask(() => {
      if (pendingInject) {
        pendingInject();
        pendingInject = null;
      }
    });
  };

  return { computePage, injectLayout, scheduleInject };
}

// ============================================================================
// 翻页动画执行（从 usePageNavigation 中拆分）
// Page flip execution (extracted from usePageNavigation)
// ============================================================================

/**
 * 创建翻页动画执行函数：fireFlip、goNext、goPrev。
 * fireFlip 是核心——它使用双层克隆渲染来实现平滑的翻页动画：
 *   1. 保存当前页面为"克隆层"（旧内容）
 *   2. 更新主层为新页面的内容
 *   3. 播放滑动动画：主层滑出，克隆层滑入，然后清除克隆
 *
 * Creates page flip functions: fireFlip, goNext, goPrev.
 * fireFlip is the core — it uses dual-layer clone rendering for smooth animation:
 *   1. Save current page as "clone layer" (old content)
 *   2. Update main layer with new page content
 *   3. Play slide animation: main slides out, clone slides in, then clear clone
 */
function createPageFlip(
  props: FlipPageProps,
  containerRef: HTMLDivElement,
  animation: PageAnimation,
  animLock: () => boolean,
  setAnimLock: (v: boolean) => void,
  layout: () => PageLayoutResult | null,
  setLayout: (l: PageLayoutResult) => void,
  computePage: (start: number) => PageLayoutResult | null,
  scheduleInject: () => void,
  canGoNext: () => boolean,
  canGoPrev: () => boolean,
) {
  /**
   * 执行翻页动画的核心函数。
   * Core function to execute a page flip animation.
   */
  const fireFlip = (
    direction: "prev" | "next",
    newLayout: PageLayoutResult,
  ) => {
    // 锁定动画，防止并发翻页
    setAnimLock(true);

    // 步骤 1：将当前页面内容保存到克隆层
    const l = layout();
    if (l) {
      animation.saveCloneFromLayout(l);
    }

    // 步骤 2：更新主层为新页面内容
    setLayout(newLayout);
    scheduleInject();

    // 步骤 3：下一帧开始动画（确保 DOM 已更新）
    requestAnimationFrame(() => {
      // 触发 CSS transition：主层滑出，克隆层滑入
      animation.setAnimating(direction);
      // 350ms 后动画结束，清理状态
      setTimeout(() => {
        animation.setAnimating(null);
        animation.clearClone();
        setAnimLock(false);
        // 通知外部游标已变化
        props.onCursorChange(newLayout.cursor);
      }, 350);
    });
  };

  /** 翻到下一页。
   * Go to next page. */
  const goNext = () => {
    const l = layout();
    if (!canGoNext() || animation.animating() || animLock()) return;
    if (!l) return;
    const next = computePage(l.nextCursor);
    if (!next) return;
    fireFlip("next", next);
  };

  /** 翻到上一页。
   * Go to previous page. */
  const goPrev = () => {
    const l = layout();
    if (!canGoPrev() || animation.animating() || animLock()) return;
    if (!l) return;
    const viewport: ViewportSize = {
      width: props.viewportWidth,
      height: props.viewportHeight,
    };
    // 向前测量：layoutPageEndingAt 从内容末尾向前计算，
    // 找到结束位置恰好为 l.cursor 的页面起点
    const prev = layoutPageEndingAt(
      containerRef,
      props.content,
      l.cursor,
      viewport,
      buildLayoutConfig(props),
      props.contentsList,
    );
    fireFlip("prev", prev);
  };

  return { fireFlip, goNext, goPrev };
}

/**
 * 页面导航 hook——组合布局计算和翻页逻辑。
 * Page navigation hook — composes layout computation and page flip logic.
 */
function usePageNavigation(
  props: FlipPageProps,
  containerRef: HTMLDivElement,
  leftRef: HTMLDivElement,
  rightRef: HTMLDivElement,
  animation: PageAnimation,
  animLock: () => boolean,
  setAnimLock: (v: boolean) => void,
): PageNavigation {
  const [layout, setLayout] = createSignal<PageLayoutResult | null>(null);

  // ---- 派生状态 / Derived ----
  const canGoNext = createMemo(() => {
    const l = layout();
    if (!l) return false;
    return l.nextCursor < props.content.length;
  });

  const canGoPrev = createMemo(() => {
    const l = layout();
    if (!l) return false;
    return l.cursor > 0;
  });

  // ---- 布局计算 / Layout computation ----
  const { computePage, scheduleInject } = createLayoutComputation(
    props,
    containerRef,
    leftRef,
    rightRef,
    layout,
    setLayout,
  );

  // ---- 翻页执行 / Page flip execution ----
  const { goNext, goPrev } = createPageFlip(
    props,
    containerRef,
    animation,
    animLock,
    setAnimLock,
    layout,
    setLayout,
    computePage,
    scheduleInject,
    canGoNext,
    canGoPrev,
  );

  /**
   * 计算并设置初始/更新后的布局。
   * Compute and set initial/updated layout.
   */
  const computeAndSetLayout = (cursor: number) => {
    if (!props.content || props.viewportWidth <= 0 || props.viewportHeight <= 0)
      return;
    if (animLock()) return;
    const l = computePage(cursor);
    if (!l) return;
    setLayout(l);
    scheduleInject();
  };

  return {
    currentLayout: layout,
    setLayout,
    canGoNext,
    canGoPrev,
    goNext,
    goPrev,
    computeAndSetLayout,
  };
}

// ============================================================================
// usePageGestures — 鼠标、触摸、滚轮、键盘事件处理
// usePageGestures — mouse, touch, wheel, keyboard event handling
// ============================================================================

/** 页面手势处理的接口。
 * Interface for page gesture handlers. */
export interface PageGestures {
  onMouseDown: (e: MouseEvent) => void;
  onMouseUp: (e: MouseEvent) => void;
  onContextMenu: (e: MouseEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
  onTouchCancel: () => void;
  onWheel: (e: WheelEvent) => void;
}

// ============================================================================
// 鼠标事件处理（从 usePageGestures 中拆分）
// Mouse event handlers (extracted from usePageGestures)
// ============================================================================

/**
 * 创建鼠标事件处理器。
 * - onMouseDown: 记录按下位置
 * - onMouseUp: 判断是滑动翻页还是点击区域动作
 * - onContextMenu: 阻止默认右键菜单，触发菜单请求
 *
 * Creates mouse event handlers.
 */
function createMouseHandlers(
  nav: PageNavigation,
  containerRef: HTMLDivElement,
  touchActions: () => readonly [string, string, string],
  onMenuRequest: () => void,
) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved = false;

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    touchStartX = e.clientX;
    touchStartY = e.clientY;
    touchMoved = false;
  };

  const onMouseUp = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const dx = e.clientX - touchStartX;
    const dy = e.clientY - touchStartY;
    // 移动超过阈值 → 判定为滑动翻页
    if (exceededThreshold(dx, dy, 20)) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        dx < 0 ? nav.goNext() : nav.goPrev();
      }
      return;
    }
    // 未超过阈值 → 判定为点击，根据点击位置触发相应动作
    const rect = containerRef.getBoundingClientRect();
    const zone = zoneFromX(e.clientX, rect);
    const act = resolveZoneAction(touchActions(), zone);
    if (act === "prev") nav.goPrev();
    else if (act === "next") nav.goNext();
    else if (act === "menu") onMenuRequest();
  };

  // 右键/长按 → 触发菜单
  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    onMenuRequest();
  };

  return { onMouseDown, onMouseUp, onContextMenu };
}

// ============================================================================
// 滚轮事件处理（从 usePageGestures 中拆分）
// Wheel event handler (extracted from usePageGestures)
// ============================================================================

/**
 * 创建滚轮事件处理器。
 * 累积滚轮增量，超过阈值（40px）时翻页，500ms 无操作则重置累积值。
 *
 * Creates wheel event handler.
 * Accumulates wheel delta, flips page when threshold (40px) is exceeded,
 * resets accumulator after 500ms of inactivity.
 */
function createWheelHandler(nav: PageNavigation) {
  const [wheelAcc, setWheelAcc] = createSignal(0);
  let wheelTimer: ReturnType<typeof setTimeout> | null = null;

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const t = wheelAcc() + e.deltaY;
    setWheelAcc(t);
    if (t > 40) {
      setWheelAcc(0);
      nav.goNext();
    } else if (t < -40) {
      setWheelAcc(0);
      nav.goPrev();
    }
    if (wheelTimer) clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => setWheelAcc(0), 500);
  };

  onCleanup(() => {
    if (wheelTimer) clearTimeout(wheelTimer);
  });

  return { onWheel };
}

// ============================================================================
// 触摸事件处理（从 usePageGestures 中拆分）
// Touch event handlers (extracted from usePageGestures)
// ============================================================================

/**
 * 创建触摸事件处理器。
 * - onTouchStart: 记录起始位置，重置滑动偏移
 * - onTouchMove: 实时更新滑动偏移，实现跟手效果
 * - onTouchEnd: 滑动超过 50px 则翻页，否则按点击区域处理
 * - onTouchCancel: 重置滑动状态
 *
 * Creates touch event handlers.
 */
function createTouchHandlers(
  nav: PageNavigation,
  animation: PageAnimation,
  containerRef: HTMLDivElement,
  touchActions: () => readonly [string, string, string],
  onMenuRequest: () => void,
) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved = false;

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) {
      animation.setSwipeOff(0);
      return;
    }
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchMoved = false;
    animation.setSwipeOff(0);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    // 移动小于 8px → 忽略（防抖）
    if (Math.hypot(dx, dy) < 8) return;
    touchMoved = true;
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
      let o = dx;
      // 到达边界时施加弹性阻尼（原偏移量的 25%）
      // Apply elastic damping at boundaries (25% of original offset)
      if (o < -15 && !nav.canGoNext()) o = Math.max(-100, o * 0.25);
      if (o > 15 && !nav.canGoPrev()) o = Math.min(100, o * 0.25);
      animation.setSwipeOff(o);
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchMoved) {
      const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX;
      animation.setSwipeOff(0);
      // 滑动超过 50px → 翻页
      if (Math.abs(dx) > 50) {
        dx < 0 ? nav.goNext() : nav.goPrev();
      }
    } else {
      // 未移动 → 按点击区域处理
      const t = e.changedTouches[0];
      if (t) {
        const rect = containerRef.getBoundingClientRect();
        const zone = zoneFromX(t.clientX, rect);
        const act = resolveZoneAction(touchActions(), zone);
        if (act === "prev") nav.goPrev();
        else if (act === "next") nav.goNext();
        else if (act === "menu") onMenuRequest();
      }
    }
    touchMoved = false;
  };

  const onTouchCancel = () => {
    animation.setSwipeOff(0);
    touchMoved = false;
  };

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
}

// ============================================================================
// 键盘事件处理（从 usePageGestures 中拆分）
// Keyboard event handler (extracted from usePageGestures)
// ============================================================================

/**
 * 创建键盘事件处理器。
 * 使用 onMount 注册全局 keydown 监听，onCleanup 自动注销。
 * 支持的按键：左箭头/PageUp/A → 上一页，右箭头/PageDown/D/空格 → 下一页
 *
 * Creates keyboard event handler.
 * Registers global keydown listener via onMount, auto-cleans up via onCleanup.
 * Supported keys: ArrowLeft/PageUp/A → prev, ArrowRight/PageDown/D/Space → next
 */
function createKeyboardHandler(nav: PageNavigation) {
  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // 在输入框等元素中不处理键盘翻页
      // Don't handle keyboard navigation inside input elements
      const t = (e.target as HTMLElement)?.tagName;
      if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
      if (e.code === "ArrowLeft" || e.code === "PageUp" || e.code === "KeyA") {
        e.preventDefault();
        nav.goPrev();
      } else if (
        e.code === "ArrowRight" ||
        e.code === "PageDown" ||
        e.code === "KeyD" ||
        e.code === "Space"
      ) {
        e.preventDefault();
        nav.goNext();
      }
    };
    document.addEventListener("keydown", handleKeydown);
    onCleanup(() => document.removeEventListener("keydown", handleKeydown));
  });
}

/**
 * 页面手势 hook——组合所有输入事件处理器（鼠标、触摸、滚轮、键盘）。
 * 现在是一个简洁的组合函数，将具体实现委托给子函数。
 *
 * Page gestures hook — composes all input event handlers (mouse, touch, wheel, keyboard).
 * Now a concise composition function that delegates to sub-functions.
 */
function usePageGestures(
  nav: PageNavigation,
  animation: PageAnimation,
  containerRef: HTMLDivElement,
  touchActions: () => readonly [string, string, string],
  onMenuRequest: () => void,
): PageGestures {
  const mouse = createMouseHandlers(
    nav,
    containerRef,
    touchActions,
    onMenuRequest,
  );
  const touch = createTouchHandlers(
    nav,
    animation,
    containerRef,
    touchActions,
    onMenuRequest,
  );
  const wheel = createWheelHandler(nav);
  createKeyboardHandler(nav);

  return {
    onMouseDown: mouse.onMouseDown,
    onMouseUp: mouse.onMouseUp,
    onContextMenu: mouse.onContextMenu,
    onTouchStart: touch.onTouchStart,
    onTouchMove: touch.onTouchMove,
    onTouchEnd: touch.onTouchEnd,
    onTouchCancel: touch.onTouchCancel,
    onWheel: wheel.onWheel,
  };
}

// ============================================================================
// 主组件
// Main component
// ============================================================================

/**
 * FlipPage 主组件——核心分页阅读器组件。
 * 负责布局计算、翻页动画、手势/键盘输入处理。
 *
 * FlipPage main component — core pagination reader component.
 * Handles layout computation, page flip animations, and gesture/keyboard input.
 */
export function FlipPage(props: FlipPageProps) {
  let containerRef!: HTMLDivElement;
  let leftRef!: HTMLDivElement;
  let rightRef!: HTMLDivElement;

  // 动画锁：防止并发翻页
  const [animLock, setAnimLock] = createSignal(false);

  const animation = usePageAnimation();

  const nav = usePageNavigation(
    props,
    containerRef,
    leftRef,
    rightRef,
    animation,
    animLock,
    setAnimLock,
  );

  // 初始布局效果：cursor 或视口尺寸变化时重新计算布局
  // Initial layout effect: recompute layout when cursor or viewport size changes
  createEffect(() => {
    nav.computeAndSetLayout(props.cursor);
  });

  // 依赖当前布局的派生值
  // Derived values that depend on the current layout
  const isTwoColumn = createMemo(() => {
    const l = nav.currentLayout();
    return l ? l.columns.length > 1 && !!l.columns[1] : false;
  });

  /** 当前阅读进度百分比。Current reading progress percentage. */
  const progress = createMemo(() => {
    const l = nav.currentLayout();
    if (!l || props.content.length === 0) return "0%";
    return ((l.nextCursor / props.content.length) * 100).toFixed(2) + "%";
  });

  /** 当前所在章节标题。Current chapter title. */
  const currentChapter = createMemo(() => {
    const idx = getContentsIndexAt(props.contentsList, props.cursor);
    return idx >= 0 ? props.contentsList[idx].title : "";
  });

  const gestures = usePageGestures(
    nav,
    animation,
    containerRef,
    () => props.touchActions,
    () => props.onMenuRequest(),
  );

  // ---- 列样式辅助函数 / Column style helper ----

  /** 根据是否为左列返回对应的列样式（单列/双列模式自适应）。
   * Returns column style for left or right column (adapts to single/two-column mode). */
  const colStyle = (isLeft: boolean): Record<string, string> => {
    if (isTwoColumn()) {
      return { ...COL_BASE, ...(isLeft ? COL_TWO_LEFT : COL_TWO_RIGHT) };
    }
    return { ...COL_BASE, ...COL_SINGLE };
  };

  // ---- 渲染 / Render ----
  // 列使用 position:absolute 搭配 top/bottom（非 flex），
  // 所以我们可以用精确测量值覆写 height/bottom。
  // Columns use position:absolute with top/bottom (not flex),
  // so we can override height/bottom with exact measured values.

  return (
    <div
      ref={containerRef}
      style={{
        ...CONTAINER_STYLE,
        "background-color": props.backgroundColor,
        color: props.textColor,
        "font-size": `${props.fontSize}px`,
        "line-height": String(props.lineHeight),
      }}
      onMouseDown={gestures.onMouseDown}
      onMouseUp={gestures.onMouseUp}
      onContextMenu={gestures.onContextMenu}
      onTouchStart={gestures.onTouchStart}
      onTouchMove={gestures.onTouchMove}
      onTouchEnd={gestures.onTouchEnd}
      onTouchCancel={gestures.onTouchCancel}
      onWheel={gestures.onWheel}
    >
      {/* 主页面层 / Main page layer */}
      <div
        style={{
          ...PAGE_LAYER_STYLE,
          transform: animation.mainTransform(),
          transition: animation.mainTransition(),
        }}
      >
        <div ref={leftRef} class="read-body" style={colStyle(true)} />
        <Show when={isTwoColumn()}>
          <div
            ref={rightRef}
            class="read-body read-body-right"
            style={colStyle(false)}
          />
        </Show>
      </div>

      {/* 克隆层——动画期间渲染上一页的快照
          Clone layer — renders a snapshot of the previous page during animation */}
      <Show when={animation.hasClone()}>
        <div
          style={{
            ...PAGE_LAYER_STYLE,
            transform: animation.cloneTransform(),
            transition: "none",
          }}
        >
          <div
            class="read-body"
            style={colStyle(true)}
            innerHTML={animation.cloneHTML()}
          />
          <Show when={animation.cloneTwoCol() && animation.cloneRight()}>
            <div
              class="read-body read-body-right"
              style={colStyle(false)}
              innerHTML={animation.cloneRight()}
            />
          </Show>
        </div>
      </Show>

      {/* 点击区域 / Click zones */}
      <div
        onClick={nav.goPrev}
        style={CLICK_ZONE_LEFT_STYLE}
        aria-label="prev"
      />
      <div
        onClick={() => props.onMenuRequest()}
        style={CLICK_ZONE_CENTER_STYLE}
        aria-label="menu"
      />
      <div
        onClick={nav.goNext}
        style={CLICK_ZONE_RIGHT_STYLE}
        aria-label="next"
      />

      {/* 进度条 / Progress */}
      <div style={PROGRESS_CONTAINER_STYLE}>
        <span style={CHAPTER_LABEL_STYLE}>{currentChapter()}</span>
        <span>{progress()}</span>
      </div>

      {/* 翻页箭头 / Arrows */}
      <Show when={nav.canGoPrev()}>
        <div style={ARROW_LEFT_STYLE}>{"‹"}</div>
      </Show>
      <Show when={nav.canGoNext()}>
        <div style={ARROW_RIGHT_STYLE}>{"›"}</div>
      </Show>
    </div>
  );
}
