/**
 * Solid Reader - main application.
 * TXT file reader with pagination, built with Solid.js.
 * Target: Safari on MacBook Pro + iOS.
 */

import {
  createSignal,
  createEffect,
  createMemo,
  Show,
  batch,
  onMount,
  type JSX,
} from "solid-js";
import { FlipPage } from "./FlipPage";
import type { ReaderConfig } from "./types";
import { defaultConfig, createViewport } from "./types";

// ---- Sample text ----

const sampleText = `第一章　楔子

夜已深。

窗外的梧桐叶被秋风卷起，沙沙作响。房间里只点着一盏油灯，昏黄的光晕在墙上投下摇曳的影子。沈墨坐在桌前，手中的笔停了许久，纸上只写了一个字——"等"。

他已经等了三年。

三年里，他走遍了大江南北，从漠北的黄沙到江南的烟雨，从西域的雪山到东海的浪涛。他见过太多人，听过太多故事，却始终找不到那个人的踪迹。

桌上的茶早已凉透。

沈墨放下笔，起身走到窗前，推开窗户。冷风灌进来，吹得油灯一阵摇晃。他望着漆黑的夜空，没有月亮，没有星星，只有无尽的黑暗。

就像他要找的那个人。

门外传来脚步声，很轻，但沈墨听得清清楚楚。他没有回头，只是淡淡地说："我以为你不会来了。"

脚步声停了。

一个身影出现在门口，月光隐约勾勒出她的轮廓——纤细，清瘦，一如三年前。

"你还在找。"她的声音很轻，带着一丝沙哑。

"从未停过。"

"何必呢？"

沈墨终于转过身，看着站在门口的女子。她穿着一袭素衣，脸色苍白，眼神却比三年前更加坚毅。

"因为承诺。"他说，声音平静得像一汪深潭，"我欠他的，必须要还。"

女子沉默了片刻，缓步走进房间。她的目光落在桌上的那张纸上，上面只有一个"等"字。

"三年了，"她说，"也许他早就死了。"

"你我都知道，他不会那么容易死。"

"那你找到什么了？"

沈墨没有回答，而是从怀中取出一枚玉佩，放在桌上。玉佩温润通透，上面刻着一个"凌"字。

女子瞳孔微缩。

"这是他留给你的？"

"这是他留给我的唯一线索。凌家最后一人的贴身之物。我在漠北的一个部落里找到的，他们说是从一具尸体上取下来的。"

"那具尸体——"

"不是他。"沈墨打断了她的话，"玉佩是完好的，没有任何血迹。他是故意留下的。"

女子走到桌前，伸出手，指尖轻轻触碰那枚玉佩。她的手指很冷，比窗外的秋风还冷。

"我有时想，"她轻声说，"如果我们从未踏入那个地方，是不是一切都不会发生？"

"那我们就不会相遇。"

她微微一怔，抬起头看着他。油灯的光映在他的眼睛里，像两簇跳动的火焰。

"你知道的，"沈墨说，"我从不后悔。无论结果如何。"

窗外，风更大了。梧桐叶簌簌作响，像是在低语着什么古老的秘密。

女子收回手，转身走向门口，在门槛前停下。

"我会再来的。"

"我知道。"

"下次，我会带你要的答案。"

她的身影消失在夜色中，就像她从未来过。

沈墨重新坐下，将玉佩放回怀中。他提起笔，在"等"字下面，又添了一个字——

"归"。

油灯终于熄灭了，房间里陷入深深的黑暗。但沈墨的眼睛，却比什么时候都亮。

第二章　北国来信

又是一年冬天。

北地的冬天来得格外早，刚过十月，大雪便封了山。沈墨在一个小镇的客栈里住了半个月，等雪停，也等人。

这日清晨，客栈老板敲响了他的门。

"沈公子，有您的信。"

沈墨接过那封信，信封上没有署名，只有墨迹勾勒的一朵梅花——那是他和那个人约定的暗号。

他拆开信，里面只有寥寥数语：

"君安否？冬寒，北国有梅，寄一枝以慰相思。腊月十五，雪岭之巅，待君共饮。"

信是半个月前寄出的。从这个小半个月的路程算来，写信的人应该已在雪岭。

沈墨将信折好，放入怀中。他抬头问老板："从这里到雪岭，怎么走最快？"

"雪岭？"老板脸色变了，"沈公子，这天气去雪岭，怕是——"

"我有非去不可的理由。"

老板叹了口气，指了指北边："往北走三十里，有座破庙。过了破庙，沿着溪水往上走，就能看到雪岭。但这天气，山道难行啊。"

沈墨没有多说，只道了声谢，收拾行囊离开了客栈。

三十里的路，他走了整整一天。

雪很深，没过膝盖。天地之间一片素白，只有他自己的脚印蜿蜒伸向远方。此刻，他想起很多年前，也是这样一个冬天，那个人对他说的话：

"你知道吗，雪是天地的眼泪。当天地悲伤到极致，就会下雪。"

"那现在天地为什么要哭？"

"因为有人走了很远的回来，却找不到回家的路。"

沈墨不知道自己是否是那个没有找路的人，但他确实走了很远。

从南到北，从东到西，从繁华的帝都到荒凉的边陲，从少年意气到鬓角微霜。

他走得太远了。

远到有时候连他自己都忘了，到底在找什么。

黄昏时分，他找到了那座破庙。

庙已荒废多年，佛像的金身斑驳脱落，香炉里积着厚厚的灰。但角落里有一堆新燃过的柴灰——有人来过。

沈墨摸了摸柴灰，还有余温。

他走出庙门，沿着溪水向上望去。雪岭巍峨地矗立在暮色中，山顶隐没在云雾里，像一头沉睡的巨兽。

明天，他就能见到那个人了。

今晚，就让他再等一晚。

沈墨在庙里生起火，取出干粮和水。火光映在佛像残破的脸上，竟有一种说不出的悲悯。

他靠在柱子上，闭上眼睛。

恍惚间，他似乎又回到了那个夜晚。

那是三年前的事，也是冬天。

他和那个人并肩站在一座宫殿前。宫殿金碧辉煌，灯火通明，里面正在举行一场盛大的宴席。

"进去之后，我们可能再也出不来了。"那个人说。

"我知道。"

"你不怕？"

沈墨笑了："怕什么，大不了一死。"

"死我不怕，"那个人望着灯火通明的宫殿，"我怕活着的人比死了更痛苦。"

"你不会死，"沈墨拍了拍他的肩膀，"我们都说好了，要活着走出来。"

"是啊，说好了。"

然后他们推开了那扇沉重的宫门。

门里面，觥筹交错，歌舞升平。没有人注意到，两道身影如鬼魅般掠过殿角，消失在内宫的深处。

接下来的事情，沈墨的记忆已有些模糊。他只记得扑面而来的血腥味，刀光剑影，还有那个人最后推了他一把，大喊——

"走！"

他走了。

那个人却没有。

沈墨睁开眼睛，庙外，雪又下起来了。

他望着漫天飞舞的雪花，轻声说：

"凌寒，三年了。你欠我的那杯酒，该还了吧。"

第三章未完待续`;

// ---- File uploader ----

function FileUploader(props: {
  onFileLoad: (text: string, title: string) => void;
}) {
  let fileInput!: HTMLInputElement;

  const handleFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      props.onFileLoad(text, file.name.replace(/\.(txt|gz)$/i, ""));
    };
    reader.readAsText(file, "UTF-8");
  };

  return (
    <div
      class="file-uploader"
      style={{ padding: "20px", "text-align": "center" }}
    >
      <input
        ref={fileInput}
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInput.click()}
        style={{
          padding: "12px 32px",
          "font-size": "16px",
          border: "2px solid #999",
          "border-radius": "8px",
          background: "transparent",
          cursor: "pointer",
          color: "#333",
        }}
      >
        Open TXT File
      </button>
    </div>
  );
}

// ---- Main App ----

export function App() {
  const [text, setText] = createSignal(sampleText);
  const [title, setTitle] = createSignal("Sample");
  const [cursor, setCursor] = createSignal(0);
  const [showMenu, setShowMenu] = createSignal(false);
  const [showUploader, setShowUploader] = createSignal(false);
  const [config, setConfig] = createSignal<ReaderConfig>(defaultConfig);
  const [viewportW, setViewportW] = createSignal(createViewport().width);
  const [viewportH, setViewportH] = createSignal(createViewport().height);
  const [darkMode, setDarkMode] = createSignal(false);

  // Viewport tracking - use document.documentElement for iOS accuracy
  onMount(() => {
    const update = () => {
      setViewportW(document.documentElement.clientWidth);
      setViewportH(document.documentElement.clientHeight);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    // iOS Safari may change viewport when scroll address bar shows/hides
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  });

  // Config sync with dark mode
  createEffect(() => {
    const dm = darkMode();
    setConfig((prev) => ({
      ...prev,
      textColor: dm ? "#d4d4d4" : "#333333",
      backgroundColor: dm ? "#1a1a1a" : "#faf8f0",
    }));
  });

  const handleFileLoad = (newText: string, newTitle: string) => {
    batch(() => {
      setText(newText);
      setTitle(newTitle);
      setCursor(0);
      setShowUploader(false);
    });
  };

  const handleCursorChange = (newCursor: number) => {
    setCursor(newCursor);
  };

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  const progressPercent = createMemo(() => {
    const len = text().length;
    if (len === 0) return 0;
    return ((cursor() / len) * 100).toFixed(1);
  });

  const rootStyle = createMemo(() => ({
    position: "fixed" as const,
    top: "0" as const,
    left: "0" as const,
    right: "0" as const,
    bottom: "0" as const,
    overflow: "hidden",
    "background-color": config().backgroundColor,
    color: config().textColor,
    "font-family":
      '-apple-system, "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif',
    transition: "background-color 0.3s, color 0.3s",
    "-webkit-overflow-scrolling": "touch" as const,
  }));

  return (
    <div class="app-root" style={rootStyle()}>
      <Show when={!showUploader()}>
        <FlipPage
          content={text()}
          cursor={cursor()}
          viewportWidth={viewportW()}
          viewportHeight={viewportH()}
          fontSize={config().fontSize}
          lineHeight={config().lineHeight}
          paragraphSpacing={config().paragraphSpacing}
          textColor={config().textColor}
          backgroundColor={config().backgroundColor}
          twoColumnThreshold={config().twoColumnThreshold}
          touchActions={config().touchActions}
          contentsList={[]}
          onCursorChange={handleCursorChange}
          onMenuRequest={toggleMenu}
        />
      </Show>

      {/* Menu overlay */}
      <Show when={showMenu()}>
        <div
          class="menu-overlay"
          onClick={toggleMenu}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            "z-index": 10,
            display: "flex",
            "flex-direction": "column",
            "justify-content": "flex-end",
          }}
        >
          <div
            class="menu-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: config().backgroundColor,
              color: config().textColor,
              padding: "24px 16px 32px",
              "padding-bottom":
                "max(32px, env(safe-area-inset-bottom, 0px) + 16px)",
              "border-radius": "16px 16px 0 0",
              "max-height": "60vh",
              "overflow-y": "auto",
            }}
          >
            <h2 style={{ margin: "0 0 16px", "font-size": "18px" }}>
              {title()} – {progressPercent()}%
            </h2>

            {/* Progress bar */}
            <div
              style={{
                height: "4px",
                background: "rgba(128,128,128,0.2)",
                "border-radius": "2px",
                margin: "0 0 20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPercent()}%`,
                  background: config().textColor,
                  "border-radius": "2px",
                  transition: "width 0.3s",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                gap: "8px",
              }}
            >
              <button
                onClick={() => {
                  setShowUploader(true);
                  setShowMenu(false);
                }}
                style={menuButtonStyle}
              >
                Open File
              </button>

              <button
                onClick={() => {
                  setConfig((prev) => ({
                    ...prev,
                    fontSize: Math.max(12, Math.min(32, prev.fontSize + 1)),
                  }));
                }}
                style={menuButtonStyle}
              >
                Font + ({config().fontSize}px)
              </button>

              <button
                onClick={() => {
                  setConfig((prev) => ({
                    ...prev,
                    fontSize: Math.max(12, Math.min(32, prev.fontSize - 1)),
                  }));
                }}
                style={menuButtonStyle}
              >
                Font -
              </button>

              <button
                onClick={() => setDarkMode((prev) => !prev)}
                style={menuButtonStyle}
              >
                {darkMode() ? "Light Mode" : "Dark Mode"}
              </button>

              <button onClick={() => setCursor(0)} style={menuButtonStyle}>
                Go to Start
              </button>

              <button
                onClick={() => setShowMenu(false)}
                style={{
                  ...menuButtonStyle,
                  background: config().textColor,
                  color: config().backgroundColor,
                }}
              >
                Continue Reading
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* File uploader */}
      <Show when={showUploader()}>
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
            "align-items": "center",
            "justify-content": "center",
            background: config().backgroundColor,
            color: config().textColor,
          }}
        >
          <FileUploader onFileLoad={handleFileLoad} />
          <button
            onClick={() => setShowUploader(false)}
            style={{
              ...menuButtonStyle,
              margin: "16px",
              background: config().textColor,
              color: config().backgroundColor,
            }}
          >
            Back to Reading
          </button>
          <button
            onClick={() => {
              setText(sampleText);
              setTitle("Sample");
              setCursor(0);
              setShowUploader(false);
            }}
            style={menuButtonStyle}
          >
            Load Sample Text
          </button>
        </div>
      </Show>
    </div>
  );
}

const menuButtonStyle: JSX.CSSProperties = {
  padding: "12px 16px",
  "font-size": "16px",
  border: "1px solid rgba(128,128,128,0.3)",
  "border-radius": "8px",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  "text-align": "left",
  width: "100%",
};
