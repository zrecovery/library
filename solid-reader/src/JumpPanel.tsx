import { Show, type Accessor, type Setter } from "solid-js";
import { btnStyle } from "./styles";

/**
 * JUMP 面板组件
 *
 * 允许用户输入百分比数字（0-100），点击 Go 或按 Enter 跳转到全文对应位置。
 * 点击面板外的半透明区域可返回阅读界面。
 */
export function JumpPanel(props: {
  /** 当前是否处于 jump 视图 */
  isActive: Accessor<boolean>;
  /** 输入框中的百分比字符串 */
  jumpPercent: Accessor<string>;
  /** 背景色（跟随主题） */
  backgroundColor: Accessor<string>;
  /** 文字色（跟随主题） */
  textColor: Accessor<string>;

  // ---- 回调 ----
  /** 更新输入框中的百分比值 */
  onPercentChange: Setter<string>;
  /** 点击 Go 或按 Enter 时执行跳转逻辑 */
  onJump: () => void;
  /** 点击遮罩层 / 返回阅读 */
  onBackToReader: () => void;
}) {
  return (
    <Show when={props.isActive()}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          "z-index": 20,
          display: "flex",
          "flex-direction": "column",
          "justify-content": "flex-end",
        }}
      >
        {/* 顶部透明区域 — 点击返回阅读 */}
        <div onClick={props.onBackToReader} style={{ flex: 1 }} />
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: props.backgroundColor(),
            color: props.textColor(),
            padding: "24px 16px",
            "padding-bottom":
              "max(32px, env(safe-area-inset-bottom, 0px) + 16px)",
            "border-radius": "16px 16px 0 0",
          }}
        >
          <h2 style={{ margin: "0 0 16px", "font-size": "18px" }}>
            Jump to Progress
          </h2>

          {/* 百分比输入行 */}
          <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={props.jumpPercent()}
              onInput={(e) => props.onPercentChange(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") props.onJump();
              }}
              placeholder="0-100"
              autofocus
              style={{
                flex: "1",
                padding: "10px 12px",
                "font-size": "16px",
                border: `1px solid ${props.textColor()}33`,
                "border-radius": "8px",
                background: "transparent",
                color: props.textColor(),
                outline: "none",
              }}
            />
            <span style={{ "font-size": "18px" }}>%</span>
          </div>

          {/* Go 按钮 */}
          <button
            onClick={props.onJump}
            style={{ ...btnStyle, "margin-top": "12px" }}
          >
            Go
          </button>
        </div>
      </div>
    </Show>
  );
}
