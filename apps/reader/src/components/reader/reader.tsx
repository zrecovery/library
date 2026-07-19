import { createEffect, createSignal, onMount, type Component } from "solid-js";
import { render } from "./render";
import { prevRender } from "./prev-render";
import {
    Slider,
    SliderTrack,
    SliderFill,
    SliderThumb,
} from "@/registry/ui/slider";
import { Button } from "@/registry/ui/button";

const Reader: Component<{ article: string }> = (props) => {
    const article = () => props.article;

    // 1. 创建一个隐藏的测量容器（用于计算游标）
    let measuringContainer: HTMLDivElement | undefined;
    const getMeasuringContainer = () => {
        if (!measuringContainer) {
            measuringContainer = createMeasuringContainer(
                document.getElementById("display-area"), // 假设你的显示容器有 id="display-area"
            );
        }
        return measuringContainer;
    };

    // 2. 引用一个可见的显示容器
    let displayContainer: HTMLDivElement | undefined;

    const [getCursor, setCursor] = createSignal(0);
    const [getNextCursor, setNextCursor] = createSignal(0);
    const [getCurrentText, setCurrentText] = createSignal("");

    // 3. 渲染当前页到显示容器
    const renderCurrentPage = (startCursor: number) => {
        const container = getMeasuringContainer();
        const endCursor = render(article(), container, startCursor);
        setNextCursor(endCursor);
        setCursor(startCursor);

        // 🔥 关键：从文章中截取当前页的文本，显示给用户
        const pageText = article().slice(startCursor, endCursor);
        setCurrentText(pageText);
        if (displayContainer) {
            displayContainer.textContent = pageText;
        }
    };

    // 4. 初始化第一页
    const initReader = () => {
        renderCurrentPage(0);
    };

    // 处理翻页逻辑
    const handlePrev = () => {
        const container = getMeasuringContainer();
        const prevStart = prevRender(article(), container, getCursor());
        if (prevStart < getCursor()) {
            renderCurrentPage(prevStart);
        }
    };

    const handleNext = () => {
        if (getNextCursor() < article().length) {
            renderCurrentPage(getNextCursor());
        }
    };

    // 在组件挂载后初始化
    onMount(() => {
        initReader();
    });

    return (
        <div>
            {/* 显示区域 */}
            <article
                id="display-area"
                ref={(el) => (displayContainer = el)}
                class="whitespace-pre-wrap"
                style={{
                    width: "100%",
                    height: "50vh",
                    border: "1px solid #ccc",
                    padding: "20px",
                    overflow: "hidden",
                    "font-size": "16px",
                    "line-height": "1.8",
                    "font-family": "serif",
                    "white-space": "pre-wrap",
                }}
            ></article>

            <p>
                光标: {getCursor()} / {article().length}
            </p>

            <div>
                <Button onClick={handlePrev}>上一页</Button>
                <Button onClick={handleNext}>下一页</Button>
            </div>

            <Slider
                defaultValue={[0]}
                step={0.01}
                value={[(getCursor() / article().length) * 100]}
                maxValue={100}
                class="w-[60%]"
            >
                <SliderTrack>
                    <SliderFill />
                    <SliderThumb />
                </SliderTrack>
            </Slider>
        </div>
    );
};

// 创建测量容器的辅助函数
function createMeasuringContainer(targetContainer: HTMLElement | null) {
    const styles = window.getComputedStyle(targetContainer || document.body);
    const measuringContainer = document.createElement("div");

    // 复制关键样式
    measuringContainer.style.width = styles.width || "100%";
    measuringContainer.style.height = styles.height || "100%";

    measuringContainer.style.fontSize = styles.fontSize;
    measuringContainer.style.fontFamily = styles.fontFamily;
    measuringContainer.style.lineHeight = styles.lineHeight;
    measuringContainer.style.wordBreak = styles.wordBreak;
    measuringContainer.style.padding = styles.padding;
    measuringContainer.style.boxSizing = styles.boxSizing;
    measuringContainer.style.whiteSpace = styles.whiteSpace;

    // 隐藏测量容器
    measuringContainer.style.position = "absolute";
    measuringContainer.style.left = "-9999px";
    measuringContainer.style.top = "0";
    measuringContainer.style.visibility = "hidden";
    measuringContainer.style.pointerEvents = "none";

    document.body.appendChild(measuringContainer);
    return measuringContainer;
}

export default Reader;
