import type { JSX } from "solid-js";

/** 通用按钮样式 — 全宽、透明背景、带圆角边框 */
export const btnStyle: JSX.CSSProperties = {
  padding: "12px 16px",
  "font-size": "16px",
  border: "1px solid rgba(128,128,128,0.3)",
  "border-radius": "8px",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  width: "100%",
  "text-align": "center",
};

/** 图标按钮样式 — 固定尺寸方形按钮 */
export const iconBtnStyle: JSX.CSSProperties = {
  width: "44px",
  height: "44px",
  "font-size": "22px",
  border: "none",
  "border-radius": "10px",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
};
