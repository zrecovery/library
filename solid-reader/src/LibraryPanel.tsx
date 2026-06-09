import { Show, For, type Accessor } from "solid-js";
import { btnStyle, iconBtnStyle } from "./styles";

/** 书库列表中的书籍摘要（不含全文） */
export interface BookSummary {
  id: string;
  title: string;
  cursor: number;
  updatedAt: number;
}

/**
 * 文件上传器内部组件
 *
 * 提供"Open TXT File"按钮，点击后触发系统文件选择器加载 .txt 文件。
 */
function FileUploader(props: {
  onLoad: (text: string, title: string) => void;
}) {
  let input!: HTMLInputElement;
  return (
    <div style={{ padding: "20px", "text-align": "center" }}>
      <input
        ref={input}
        type="file"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) {
            const r = new FileReader();
            r.onload = () =>
              props.onLoad(
                r.result as string,
                f.name.replace(/\.(txt|gz)$/i, ""),
              );
            r.readAsText(f, "UTF-8");
          }
        }}
        style={{ display: "none" }}
      />
      <button onClick={() => input.click()} style={btnStyle}>
        Open TXT File
      </button>
    </div>
  );
}

/**
 * LIBRARY（书库）面板组件
 *
 * 显示已保存的书籍列表，支持打开书籍、导出为 TXT、删除书籍。
 * 顶部包含文件上传器用于添加新书。
 */
export function LibraryPanel(props: {
  /** 当前是否处于 library 视图 */
  isActive: Accessor<boolean>;
  /** 已保存的书籍列表 */
  savedBooks: Accessor<BookSummary[]>;
  /** 背景色（跟随主题） */
  backgroundColor: Accessor<string>;
  /** 文字色（跟随主题） */
  textColor: Accessor<string>;

  // ---- 回调 ----
  /** 加载本地文件后处理 */
  onFileLoad: (text: string, title: string) => void;
  /** 从书库打开一本书（传入 book id） */
  onOpenBook: (id: string) => void;
  /** 导出书籍为 TXT 文件 */
  onExportBook: (id: string) => void;
  /** 删除一本书（传入 book id） */
  onDeleteBook: (id: string) => void;
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
          "z-index": 10,
          background: props.backgroundColor(),
          color: props.textColor(),
          display: "flex",
          "flex-direction": "column",
          padding: "max(16px, env(safe-area-inset-top, 0px)) 16px 16px",
        }}
      >
        {/* 文件上传 */}
        <FileUploader onLoad={props.onFileLoad} />

        {/* 书籍列表 / 空状态 */}
        <Show
          when={props.savedBooks().length > 0}
          fallback={
            <p style={{ opacity: 0.5, padding: "20px 0" }}>
              No saved books yet.
            </p>
          }
        >
          <div style={{ "overflow-y": "auto", flex: 1 }}>
            <For each={props.savedBooks()}>
              {(b) => (
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    "align-items": "center",
                  }}
                >
                  {/* 书名按钮 — 点击打开书籍 */}
                  <button
                    onClick={() => props.onOpenBook(b.id)}
                    style={{
                      ...btnStyle,
                      flex: "1",
                      "text-align": "left",
                      border: "none",
                    }}
                  >
                    <div style={{ "font-weight": "bold" }}>{b.title}</div>
                    <div style={{ "font-size": "12px", opacity: 0.5 }}>
                      Last read: {new Date(b.updatedAt).toLocaleDateString()}
                    </div>
                  </button>

                  {/* 导出按钮 */}
                  <button
                    onClick={() => props.onExportBook(b.id)}
                    style={{
                      ...iconBtnStyle,
                      width: "36px",
                      height: "36px",
                      "font-size": "16px",
                    }}
                    title="Export"
                  >
                    ⬇
                  </button>

                  {/* 删除按钮 */}
                  <button
                    onClick={() => props.onDeleteBook(b.id)}
                    style={{
                      ...iconBtnStyle,
                      width: "36px",
                      height: "36px",
                      "font-size": "16px",
                      color: "#e74c3c",
                    }}
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </Show>
  );
}
