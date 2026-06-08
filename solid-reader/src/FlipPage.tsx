/**
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

export interface FlipPageProps {
  content: string;
  cursor: number;
  viewportWidth: number;
  viewportHeight: number;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  textColor: string;
  backgroundColor: string;
  twoColumnThreshold: number;
  touchActions: readonly [string, string, string];
  contentsList: ReadonlyArray<{ cursor: number; title: string }>;
  onCursorChange: (cursor: number) => void;
  onMenuRequest: () => void;
}

// ============================================================================
// Module-level style constants
// ============================================================================

/** Shared column style properties that never change. */
const COL_BASE: Record<string, string> = {
  position: "absolute",
  top: "max(16px, env(safe-area-inset-top, 0px))",
  bottom: "max(36px, calc(env(safe-area-inset-bottom, 0px) + 20px))",
  overflow: "hidden",
  "overflow-wrap": "break-word",
  "word-break": "break-all",
  "box-sizing": "border-box",
};

/** Single-column position: spans full width between margins. */
const COL_SINGLE: Record<string, string> = {
  left: "16px",
  right: "16px",
};

/** Left column in two-column mode: anchored left, extends to 50% with right padding. */
const COL_TWO_LEFT: Record<string, string> = {
  left: "16px",
  right: "50%",
  "padding-right": "16px",
};

/** Right column in two-column mode: anchored right, extends from 50% with left padding. */
const COL_TWO_RIGHT: Record<string, string> = {
  left: "50%",
  right: "16px",
  "padding-left": "16px",
};

/** Container wrapper style (dynamic props like background-color applied inline). */
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

/** Page layer wrapper — shared by both main and clone layers. */
const PAGE_LAYER_STYLE: Record<string, string> = {
  position: "absolute",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
};

/** Progress bar container. */
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

/** Chapter label in the progress bar. */
const CHAPTER_LABEL_STYLE: Record<string, string> = {
  overflow: "hidden",
  "text-overflow": "ellipsis",
  "white-space": "nowrap",
  "max-width": "70%",
};

/** Left arrow indicator. */
const ARROW_LEFT_STYLE: Record<string, string> = {
  position: "absolute",
  left: "8px",
  top: "50%",
  transform: "translateY(-50%)",
  "font-size": "28px",
  opacity: "0.12",
  "pointer-events": "none",
};

/** Right arrow indicator. */
const ARROW_RIGHT_STYLE: Record<string, string> = {
  position: "absolute",
  right: "8px",
  top: "50%",
  transform: "translateY(-50%)",
  "font-size": "28px",
  opacity: "0.12",
  "pointer-events": "none",
};

/** Factory for click zone styles — returns a style object for a zone at the given position. */
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

/** Pre-built click zone styles. */
const CLICK_ZONE_LEFT_STYLE = clickZoneStyle("0", "auto", "33.33%");
const CLICK_ZONE_CENTER_STYLE = clickZoneStyle("33.33%", "auto", "33.34%");
const CLICK_ZONE_RIGHT_STYLE = clickZoneStyle("auto", "0", "33.33%");

// ============================================================================
// Internal helpers
// ============================================================================

/** Build a full layout config from props. Extracted to avoid duplication. */
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

/** Check if two coordinates exceed a distance threshold. */
const exceededThreshold = (
  dx: number,
  dy: number,
  threshold: number,
): boolean => Math.hypot(dx, dy) > threshold;

/** Convert a touch/click x-position to a zone index [0, 1, 2] relative to the container rect. */
const zoneFromX = (clientX: number, rect: DOMRect): number =>
  Math.floor(((clientX - rect.left) / rect.width) * 3);

type ZoneAction = "prev" | "next" | "menu";

/** Resolve touchActions array lookup with clamping. */
const resolveZoneAction = (
  touchActions: readonly [string, string, string],
  zone: number,
): ZoneAction => {
  const clamped = Math.min(Math.max(zone, 0), 2);
  return (touchActions[clamped] as ZoneAction) ?? "menu";
};

// ============================================================================
// usePageAnimation — animation transforms, transitions, and clone state
// ============================================================================

interface PageAnimation {
  animating: () => "prev" | "next" | null;
  mainTransform: () => string;
  cloneTransform: () => string;
  mainTransition: () => string;
  hasClone: () => boolean;
  cloneHTML: () => string;
  cloneRight: () => string;
  cloneTwoCol: () => boolean;
  setAnimating: (v: "prev" | "next" | null) => void;
  saveCloneFromLayout: (layout: PageLayoutResult) => void;
  clearClone: () => void;
  swipeOff: () => number;
  setSwipeOff: (v: number) => void;
}

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

  const cloneTransform = () =>
    !animating() ? "translateX(110%)" : "translateX(0)";

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
// usePageNavigation — page turning logic
// ============================================================================

interface PageNavigation {
  currentLayout: () => PageLayoutResult | null;
  setLayout: (l: PageLayoutResult) => void;
  canGoNext: () => boolean;
  canGoPrev: () => boolean;
  goNext: () => void;
  goPrev: () => void;
  /** Called on initial/dependency change to recompute and set the page. */
  computeAndSetLayout: (cursor: number) => void;
}

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

  let pendingInject: (() => void) | null = null;

  // ---- Derived ----
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

  // ---- Layout helpers ----

  const computePage = (start: number): PageLayoutResult | null => {
    if (!containerRef || !props.content) return null;
    const sc = Math.max(0, Math.min(start, props.content.length));
    const w = props.viewportWidth;
    const h = props.viewportHeight;
    if (w <= 0 || h <= 0) return null;
    const viewport: ViewportSize = { width: w, height: h };
    return layoutPage(
      containerRef,
      props.content,
      sc,
      viewport,
      buildLayoutConfig(props),
      props.contentsList,
    );
  };

  /** Apply layout columns to DOM refs. Sets precise height on each column. */
  const injectLayout = () => {
    const l = layout();
    if (!l) return;

    const apply = (
      ref: HTMLDivElement | undefined,
      html: string | undefined,
      h: number | null | undefined,
    ) => {
      if (!ref) return;
      ref.innerHTML = html ?? "";
      if (h != null) {
        ref.style.height = h + "px";
        ref.style.bottom = "auto";
      } else {
        ref.style.height = "";
        ref.style.bottom = "";
      }
    };
    apply(leftRef, l.columns[0], l.columnHeights?.[0]);
    apply(rightRef, l.columns[1], l.columnHeights?.[1]);
  };

  const scheduleInject = () => {
    pendingInject = injectLayout;
    queueMicrotask(() => {
      if (pendingInject) {
        pendingInject();
        pendingInject = null;
      }
    });
  };

  // ---- Navigation ----

  const fireFlip = (
    direction: "prev" | "next",
    newLayout: PageLayoutResult,
  ) => {
    setAnimLock(true);

    const l = layout();
    if (l) {
      animation.saveCloneFromLayout(l);
    }

    setLayout(newLayout);
    scheduleInject();

    requestAnimationFrame(() => {
      animation.setAnimating(direction);
      setTimeout(() => {
        animation.setAnimating(null);
        animation.clearClone();
        setAnimLock(false);
        props.onCursorChange(newLayout.cursor);
      }, 350);
    });
  };

  const goNext = () => {
    const l = layout();
    if (!canGoNext() || animation.animating() || animLock()) return;
    if (!l) return;
    const next = computePage(l.nextCursor);
    if (!next) return;
    fireFlip("next", next);
  };

  const goPrev = () => {
    const l = layout();
    if (!canGoPrev() || animation.animating() || animLock()) return;
    if (!l) return;
    const viewport: ViewportSize = {
      width: props.viewportWidth,
      height: props.viewportHeight,
    };
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
// usePageGestures — mouse, touch, wheel, keyboard event handling
// ============================================================================

interface PageGestures {
  onMouseDown: (e: MouseEvent) => void;
  onMouseUp: (e: MouseEvent) => void;
  onContextMenu: (e: MouseEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
  onTouchCancel: () => void;
  onWheel: (e: WheelEvent) => void;
}

function usePageGestures(
  nav: PageNavigation,
  animation: PageAnimation,
  containerRef: HTMLDivElement,
  touchActions: () => readonly [string, string, string],
  onMenuRequest: () => void,
): PageGestures {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved = false;
  const [wheelAcc, setWheelAcc] = createSignal(0);
  let wheelTimer: ReturnType<typeof setTimeout> | null = null;

  // ---- Mouse ----

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
    if (exceededThreshold(dx, dy, 20)) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        dx < 0 ? nav.goNext() : nav.goPrev();
      }
      return;
    }
    const rect = containerRef.getBoundingClientRect();
    const zone = zoneFromX(e.clientX, rect);
    const act = resolveZoneAction(touchActions(), zone);
    if (act === "prev") nav.goPrev();
    else if (act === "next") nav.goNext();
    else if (act === "menu") onMenuRequest();
  };

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    onMenuRequest();
  };

  // ---- Wheel ----

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

  // ---- Touch ----

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
    if (Math.hypot(dx, dy) < 8) return;
    touchMoved = true;
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
      let o = dx;
      if (o < -15 && !nav.canGoNext()) o = Math.max(-100, o * 0.25);
      if (o > 15 && !nav.canGoPrev()) o = Math.min(100, o * 0.25);
      animation.setSwipeOff(o);
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchMoved) {
      const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX;
      animation.setSwipeOff(0);
      if (Math.abs(dx) > 50) {
        dx < 0 ? nav.goNext() : nav.goPrev();
      }
    } else {
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

  // ---- Keyboard ----

  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
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

  return {
    onMouseDown,
    onMouseUp,
    onContextMenu,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onWheel,
  };
}

// ============================================================================
// Main component
// ============================================================================

export function FlipPage(props: FlipPageProps) {
  let containerRef!: HTMLDivElement;
  let leftRef!: HTMLDivElement;
  let rightRef!: HTMLDivElement;

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

  // Initial layout effect
  createEffect(() => {
    nav.computeAndSetLayout(props.cursor);
  });

  // Derived values that depend on the current layout
  const isTwoColumn = createMemo(() => {
    const l = nav.currentLayout();
    return l ? l.columns.length > 1 && !!l.columns[1] : false;
  });

  const progress = createMemo(() => {
    const l = nav.currentLayout();
    if (!l || props.content.length === 0) return "0%";
    return ((l.nextCursor / props.content.length) * 100).toFixed(2) + "%";
  });

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

  // ---- Column style helper ----

  const colStyle = (isLeft: boolean): Record<string, string> => {
    if (isTwoColumn()) {
      return { ...COL_BASE, ...(isLeft ? COL_TWO_LEFT : COL_TWO_RIGHT) };
    }
    return { ...COL_BASE, ...COL_SINGLE };
  };

  // ---- Render ----
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
      {/* Main page layer */}
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

      {/* Clone layer — renders a snapshot of the previous page during animation */}
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

      {/* Click zones */}
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

      {/* Progress */}
      <div style={PROGRESS_CONTAINER_STYLE}>
        <span style={CHAPTER_LABEL_STYLE}>{currentChapter()}</span>
        <span>{progress()}</span>
      </div>

      {/* Arrows */}
      <Show when={nav.canGoPrev()}>
        <div style={ARROW_LEFT_STYLE}>{"‹"}</div>
      </Show>
      <Show when={nav.canGoNext()}>
        <div style={ARROW_RIGHT_STYLE}>{"›"}</div>
      </Show>
    </div>
  );
}
