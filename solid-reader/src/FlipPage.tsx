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
import type { PageLayoutResult } from "./types";
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

export function FlipPage(props: FlipPageProps) {
  const [layout, setLayout] = createSignal<PageLayoutResult | null>(null);
  const [animating, setAnimating] = createSignal<"prev" | "next" | null>(null);
  const [cloneHTML, setCloneHTML] = createSignal("");
  const [cloneRight, setCloneRight] = createSignal("");
  const [cloneTwoCol, setCloneTwoCol] = createSignal(false);

  const [wheelAcc, setWheelAcc] = createSignal(0);
  const [swipeOff, setSwipeOff] = createSignal(0);

  let containerRef!: HTMLDivElement;
  let leftRef!: HTMLDivElement;
  let rightRef!: HTMLDivElement;
  let touchSX = 0,
    touchSY = 0,
    touchMoved = false;
  let wheelTimer: ReturnType<typeof setTimeout> | null = null;
  let animLock = false;
  let pendingInject: (() => void) | null = null;

  // ---- Derived ----

  const isTwoColumn = createMemo(() => {
    const l = layout();
    return l ? l.columns.length > 1 && !!l.columns[1] : false;
  });

  const progress = createMemo(() => {
    const l = layout();
    if (!l || props.content.length === 0) return "0%";
    return ((l.nextCursor / props.content.length) * 100).toFixed(2) + "%";
  });

  const currentChapter = createMemo(() => {
    const idx = getContentsIndexAt(props.contentsList, props.cursor);
    return idx >= 0 ? props.contentsList[idx].title : "";
  });

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
    return layoutPage(
      containerRef,
      props.content,
      sc,
      { width: w, height: h },
      {
        fontSize: props.fontSize,
        lineHeight: props.lineHeight,
        paragraphSpacing: props.paragraphSpacing,
        textColor: props.textColor,
        backgroundColor: props.backgroundColor,
        twoColumnThreshold: props.twoColumnThreshold,
        touchActions: ["prev", "menu", "next"],
      },
      props.contentsList,
    );
  };

  /** Apply layout columns to DOM refs. Sets precise height on each column. */
  const injectLayout = () => {
    const l = layout();
    if (!l) return;
    const leftH = l.columnHeights?.[0];
    const rightH = l.columnHeights?.[1];

    if (leftRef) {
      leftRef.innerHTML = l.columns[0] ?? "";
      if (leftH != null) {
        leftRef.style.height = leftH + "px";
        leftRef.style.bottom = "auto";
      } else {
        leftRef.style.height = "";
        leftRef.style.bottom = "";
      }
    }
    if (rightRef) {
      rightRef.innerHTML = l.columns[1] ?? "";
      if (rightH != null) {
        rightRef.style.height = rightH + "px";
        rightRef.style.bottom = "auto";
      } else {
        rightRef.style.height = "";
        rightRef.style.bottom = "";
      }
    }
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

  // ---- Initial layout ----

  createEffect(() => {
    const c = props.cursor;
    const content = props.content;
    const w = props.viewportWidth;
    const h = props.viewportHeight;
    if (!content || w <= 0 || h <= 0) return;
    if (animLock) return;

    const l = computePage(c);
    if (!l) return;

    setLayout(l);
    scheduleInject();
  });

  // ---- Navigation ----

  const fireFlip = (
    direction: "prev" | "next",
    newLayout: PageLayoutResult,
  ) => {
    animLock = true;

    const l = layout();
    setCloneHTML(l?.columns[0] ?? "");
    setCloneRight(l?.columns[1] ?? "");
    setCloneTwoCol(!!(l && l.columns.length > 1 && l.columns[1]));

    setLayout(newLayout);
    scheduleInject();

    requestAnimationFrame(() => {
      setAnimating(direction);
      setTimeout(() => {
        setAnimating(null);
        setCloneHTML("");
        setCloneRight("");
        setCloneTwoCol(false);
        animLock = false;
        props.onCursorChange(newLayout.cursor);
      }, 350);
    });
  };

  const goNext = () => {
    if (!canGoNext() || animating() || animLock) return;
    const l = layout();
    if (!l) return;
    const next = computePage(l.nextCursor);
    if (!next) return;
    fireFlip("next", next);
  };

  const goPrev = () => {
    if (!canGoPrev() || animating() || animLock) return;
    const l = layout();
    if (!l) return;
    const prev = layoutPageEndingAt(
      containerRef,
      props.content,
      l.cursor,
      { width: props.viewportWidth, height: props.viewportHeight },
      {
        fontSize: props.fontSize,
        lineHeight: props.lineHeight,
        paragraphSpacing: props.paragraphSpacing,
        textColor: props.textColor,
        backgroundColor: props.backgroundColor,
        twoColumnThreshold: props.twoColumnThreshold,
        touchActions: ["prev", "menu", "next"],
      },
      props.contentsList,
    );
    fireFlip("prev", prev);
  };

  // ---- Mouse / Wheel / Touch / Keyboard (unchanged) ----

  const onMDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    touchSX = e.clientX;
    touchSY = e.clientY;
    touchMoved = false;
  };
  const onMUp = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const dx = e.clientX - touchSX,
      dy = e.clientY - touchSY;
    if (Math.hypot(dx, dy) > 20) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        dx < 0 ? goNext() : goPrev();
      }
      return;
    }
    const rect = containerRef.getBoundingClientRect();
    const zone = Math.floor(((e.clientX - rect.left) / rect.width) * 3);
    const act = props.touchActions[Math.min(Math.max(zone, 0), 2)] ?? "menu";
    if (act === "prev") goPrev();
    else if (act === "next") goNext();
    else if (act === "menu") props.onMenuRequest();
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const t = wheelAcc() + e.deltaY;
    setWheelAcc(t);
    if (t > 40) {
      setWheelAcc(0);
      goNext();
    } else if (t < -40) {
      setWheelAcc(0);
      goPrev();
    }
    if (wheelTimer) clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => setWheelAcc(0), 500);
  };
  onCleanup(() => {
    if (wheelTimer) clearTimeout(wheelTimer);
  });
  const onCtx = (e: MouseEvent) => {
    e.preventDefault();
    props.onMenuRequest();
  };
  const onTStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) {
      setSwipeOff(0);
      return;
    }
    touchSX = e.touches[0].clientX;
    touchSY = e.touches[0].clientY;
    touchMoved = false;
    setSwipeOff(0);
  };
  const onTMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchSX,
      dy = e.touches[0].clientY - touchSY;
    if (Math.hypot(dx, dy) < 8) return;
    touchMoved = true;
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
      let o = dx;
      if (o < -15 && !canGoNext()) o = Math.max(-100, o * 0.25);
      if (o > 15 && !canGoPrev()) o = Math.min(100, o * 0.25);
      setSwipeOff(o);
    }
  };
  const onTEnd = (e: TouchEvent) => {
    if (touchMoved) {
      const dx = (e.changedTouches[0]?.clientX ?? 0) - touchSX;
      setSwipeOff(0);
      if (Math.abs(dx) > 50) {
        dx < 0 ? goNext() : goPrev();
      }
    } else {
      const t = e.changedTouches[0];
      if (t) {
        const rect = containerRef.getBoundingClientRect();
        const zone = Math.floor(((t.clientX - rect.left) / rect.width) * 3);
        const act =
          props.touchActions[Math.min(Math.max(zone, 0), 2)] ?? "menu";
        if (act === "prev") goPrev();
        else if (act === "next") goNext();
        else if (act === "menu") props.onMenuRequest();
      }
    }
    touchMoved = false;
  };
  const onTCancel = () => {
    setSwipeOff(0);
    touchMoved = false;
  };
  onMount(() => {
    const h = (e: KeyboardEvent) => {
      const t = (e.target as HTMLElement)?.tagName;
      if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
      if (e.code === "ArrowLeft" || e.code === "PageUp" || e.code === "KeyA") {
        e.preventDefault();
        goPrev();
      } else if (
        e.code === "ArrowRight" ||
        e.code === "PageDown" ||
        e.code === "KeyD" ||
        e.code === "Space"
      ) {
        e.preventDefault();
        goNext();
      }
    };
    document.addEventListener("keydown", h);
    onCleanup(() => document.removeEventListener("keydown", h));
  });

  // ---- Animation ----

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

  // ---- Render ----
  // Columns use position:absolute with top/bottom (not flex),
  // so we can override height/bottom with exact measured values.

  const colStyle = (isLeft: boolean) => ({
    position: "absolute" as const,
    top: "max(16px, env(safe-area-inset-top, 0px))",
    bottom: "max(36px, calc(env(safe-area-inset-bottom, 0px) + 20px))",
    overflow: "hidden",
    "overflow-wrap": "break-word",
    "word-break": "break-all",
    "box-sizing": "border-box" as const,
    // Single column: span full width between margins
    // Two columns: split at 50% with 16px padding gap from midline
    ...(isTwoColumn()
      ? isLeft
        ? { left: "16px", right: "50%", "padding-right": "16px" }
        : { left: "50%", right: "16px", "padding-left": "16px" }
      : { left: "16px", right: "16px" }),
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        overflow: "hidden",
        "background-color": props.backgroundColor,
        color: props.textColor,
        "font-size": `${props.fontSize}px`,
        "line-height": String(props.lineHeight),
        cursor: "default",
        "user-select": "none",
        "touch-action": "manipulation",
      }}
      onMouseDown={onMDown}
      onMouseUp={onMUp}
      onContextMenu={onCtx}
      onTouchStart={onTStart}
      onTouchMove={onTMove}
      onTouchEnd={onTEnd}
      onTouchCancel={onTCancel}
      onWheel={onWheel}
    >
      {/* Main page layer */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          transform: mainTransform(),
          transition: mainTransition(),
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

      {/* Clone layer */}
      <Show when={hasClone()}>
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            transform: cloneTransform(),
            transition: "none",
          }}
        >
          <div
            class="read-body"
            style={colStyle(true)}
            innerHTML={cloneHTML()}
          />
          <Show when={cloneTwoCol() && cloneRight()}>
            <div
              class="read-body read-body-right"
              style={colStyle(false)}
              innerHTML={cloneRight()}
            />
          </Show>
        </div>
      </Show>

      {/* Click zones */}
      <div
        onClick={goPrev}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "33.33%",
          cursor: "pointer",
          "z-index": 2,
          background: "rgba(0,0,0,0.0001)",
        }}
        aria-label="prev"
      />
      <div
        onClick={() => props.onMenuRequest()}
        style={{
          position: "absolute",
          top: 0,
          left: "33.33%",
          bottom: 0,
          width: "33.34%",
          cursor: "pointer",
          "z-index": 2,
          background: "rgba(0,0,0,0.0001)",
        }}
        aria-label="menu"
      />
      <div
        onClick={goNext}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "33.33%",
          cursor: "pointer",
          "z-index": 2,
          background: "rgba(0,0,0,0.0001)",
        }}
        aria-label="next"
      />

      {/* Progress */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          "justify-content": "space-between",
          padding: "4px 16px",
          "padding-bottom": "max(4px, env(safe-area-inset-bottom, 0px))",
          "font-size": "12px",
          "line-height": "1.2",
          opacity: 0.35,
          "pointer-events": "none",
          "z-index": 1,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
            "max-width": "70%",
          }}
        >
          {currentChapter()}
        </span>
        <span>{progress()}</span>
      </div>

      {/* Arrows */}
      <Show when={canGoPrev()}>
        <div
          style={{
            position: "absolute",
            left: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            "font-size": "28px",
            opacity: 0.12,
            "pointer-events": "none",
          }}
        >
          {"‹"}
        </div>
      </Show>
      <Show when={canGoNext()}>
        <div
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            "font-size": "28px",
            opacity: 0.12,
            "pointer-events": "none",
          }}
        >
          {"›"}
        </div>
      </Show>
    </div>
  );
}
