import { Show, type Accessor, type Setter } from "solid-js";
import { iconBtnStyle } from "./styles";

/**
 * MENU 面板组件
 *
 * 显示阅读进度滑块和工具栏按钮（目录、搜索、跳转、书库、字体大小、深色模式、回到开头）。
 * 通过半透明遮罩层点击可返回阅读界面。
 */
export function MenuPanel(props: {
  /** 当前是否处于 menu 视图 */
  isActive: Accessor<boolean>;
  /** 书名 */
  title: Accessor<string>;
  /** 阅读进度百分比字符串 */
  progress: Accessor<string>;
  /** 全文文本 */
  text: Accessor<string>;
  /** 背景色（跟随主题） */
  backgroundColor: Accessor<string>;
  /** 文字色（跟随主题） */
  textColor: Accessor<string>;
  /** 当前是否深色模式 */
  darkMode: Accessor<boolean>;
  /** 当前字体大小 */
  fontSize: Accessor<number>;

  // ---- 回调 ----
  /** 点击遮罩层 / 返回阅读 */
  onBackToReader: () => void;
  /** 跳转到目录视图 */
  onGoIndex: () => void;
  /** 跳转到搜索面板 */
  onGoSearch: () => void;
  /** 跳转到进度跳转面板 */
  onGoJump: () => void;
  /** 跳转到书库面板 */
  onGoLibrary: () => void;
  /** 字体减小 */
  onFontDown: () => void;
  /** 字体增大 */
  onFontUp: () => void;
  /** 切换深色模式 */
  onToggleDark: () => void;
  /** 回到开头 */
  onGoStart: () => void;
  /** 拖拽进度条时更新光标位置 */
  onProgressChange: (percent: number) => void;
}) {
  return (
    <Show when={props.isActive()}>
      <>
        {/* 半透明遮罩层 — 点击返回阅读界面 */}
        <div
          onClick={props.onBackToReader}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            "z-index": 9,
            background: "transparent",
          }}
        />
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            "z-index": 10,
            background: props.backgroundColor(),
            color: props.textColor(),
            padding: "20px",
            "padding-bottom":
              "max(20px, env(safe-area-inset-bottom, 0px) + 4px)",
            "border-radius": "20px 20px 0 0",
            "max-height": "65vh",
            "overflow-y": "auto",
          }}
        >
          {/* 书名与进度百分比 */}
          <h2 style={{ margin: "0 0 12px", "font-size": "18px" }}>
            {props.title()} – {props.progress()}%
          </h2>

          {/* 可拖动进度条 */}
          <div
            style={{
              display: "flex",
              "align-items": "center",
              margin: "0 0 16px",
            }}
          >
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={props.progress()}
              onInput={(e) => {
                const p = parseFloat(e.currentTarget.value);
                props.onProgressChange(p);
              }}
              style={{
                flex: "1",
                height: "6px",
                "-webkit-appearance": "none",
                appearance: "none",
                background: `linear-gradient(to right, ${props.textColor()} ${props.progress()}%, ${props.textColor()}20 ${props.progress()}%)`,
                "border-radius": "3px",
                outline: "none",
                cursor: "pointer",
              }}
            />
          </div>

          {/* 工具栏按钮 */}
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "6px",
                "justify-content": "center",
                "flex-wrap": "wrap",
              }}
            >
              <button
                onClick={props.onGoIndex}
                style={iconBtnStyle}
                title="Chapters / Bookmarks"
              >
                📑
              </button>
              <button
                onClick={props.onGoSearch}
                style={iconBtnStyle}
                title="Search"
              >
                🔍
              </button>
              <button
                onClick={props.onGoJump}
                style={iconBtnStyle}
                title="Jump to Progress"
              >
                📍
              </button>
              <button
                onClick={props.onGoLibrary}
                style={iconBtnStyle}
                title="Library"
              >
                📚
              </button>
              <button
                onClick={props.onFontDown}
                style={iconBtnStyle}
                title="Font -"
              >
                A⁻
              </button>
              <button
                onClick={props.onFontUp}
                style={iconBtnStyle}
                title="Font +"
              >
                A⁺
              </button>
              <button
                onClick={props.onToggleDark}
                style={iconBtnStyle}
                title={props.darkMode() ? "Light Mode" : "Dark Mode"}
              >
                {props.darkMode() ? "☀️" : "🌙"}
              </button>
              <button
                onClick={props.onGoStart}
                style={iconBtnStyle}
                title="Go to Start"
              >
                ⏮
              </button>
            </div>
          </div>
        </div>
      </>
    </Show>
  );
}
