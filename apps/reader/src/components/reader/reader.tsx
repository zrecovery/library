import { createEffect, createResource, createSignal, onMount, type Component } from "solid-js";
import { render } from "./render";
import {
    Slider,
    SliderFill,
    SliderThumb,
    SliderTrack,
} from "@/registry/ui/slider";
import { Button } from "@/registry/ui/button";
import { openDB } from "idb";

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
    const [getSliderCurosr, setSliderCursor] = createSignal(false);
    const [getNextCursor, setNextCursor] = createSignal(0);
    const [getCurrentText, setCurrentText] = createSignal("");
    const [getCurrentPage, setCurrentPage] = createSignal(1);
    const [getNextPage, setNextPage] = createSignal(1);
    const [getPrevPage, setPrevPage] = createSignal(1);
    const [getCache, setCache] = createSignal([{ page: 1, start: 0 }])

    // 3. 渲染当前页到显示容器
    const renderCurrentPage = (startCursor: number) => {
        const container = getMeasuringContainer();
        const endCursor = render(article(), container, startCursor);
        setNextCursor(endCursor);
        setCursor(startCursor);

        const pageText = article().slice(startCursor, endCursor);
        setCurrentText(pageText);
        if (displayContainer) {
            displayContainer.textContent = pageText;
        }
    };

    createEffect(() => {
        console.log(getCurrentPage())
        if (getCache().length > 1) {

            const result = getCache().filter(a => a.page === getCurrentPage())

            const next = getCache().filter(a => a.page === (getCurrentPage() + 1))
            const pageText = article().substring(result[0].start, next[0].start);
            setCurrentText(pageText);
            if (displayContainer) {
                displayContainer.textContent = pageText;
            }
        }
    })
    // 4. 初始化第一页
    const initReader = () => {
        renderCurrentPage(0);
    };

    // 处理翻页逻辑
    const handlePrev = () => {
        const prev = getPrevPage() >= 2 ? getPrevPage() - 1 : 1;
        setCurrentPage(getPrevPage());
        setPrevPage(prev)
        setCurrentPage(getCurrentPage() + 1)
    };

    const handleNext = () => {
        const next = getNextPage() <= getCache().length - 1 ? getNextPage() + 1 : 1;
        setPrevPage(getCurrentPage())
        setCurrentPage(getNextPage());
        setNextPage(next)
    };

    let cache = [{ page: 1, start: 0 }]

    const dbPromise = openDB("cache", 2, {
        upgrade(db) {
            db.createObjectStore("test");
        },
    });
    const getIdbCache = async (text: string) => {
        const db = await dbPromise;
        const r = db.get('test', "test")
        return r;

    }
    const setIdbCache = async (result: []) => {
        const db = await dbPromise;
        db.put('test', result, "test")
    }

    const computeCache = async (text: string, container: HTMLElement, cursor = 0, page = 1) => {
        const [cache] = createResource(text, getIdbCache)
        if (cache()) {
            return cache()
        }
        let result = [{ page: 1, start: 0 }]

        while (cursor < text.length - 1) {
            cursor = render(text, container, cursor);
            page = page + 1;
            result.push({ page, start: cursor })
        }
        setIdbCache(result)

        return result;
    }



    // 在组件挂载后初始化
    onMount(async () => {
        //initReader()
        const container = getMeasuringContainer();
        const [result] = createResource(async () => {
            const cache = await computeCache(article(), container, 0, 1)
            setCache(cache)

            const pageText = article().slice(0, cache[1].start);
            console.log(pageText)
            setCurrentText(pageText);
            if (displayContainer) {
                displayContainer.textContent = pageText;
            }
        });

    });

    return (
        <div>
            <article
                id="display-area"
                ref={(el) => (displayContainer = el)}
                class="whitespace-pre-wrap"
                style={{
                    width: "100%",
                    height: "80vh",
                    border: "1px solid #ccc",
                    padding: "20px",
                    overflow: "hidden",
                    "font-size": "16px",
                    "line-height": "1.8",
                    "font-family": "serif",
                    "white-space": "pre-wrap",
                }}
            />


            <div>
                <Button onClick={handlePrev}>上一页</Button>
                <Button onClick={handleNext}>下一页</Button>
            </div>

            <Slider
                defaultValue={[0]}
                step={1}
                value={[getCurrentPage()]}
                maxValue={getCache().length - 1}
                class="w-[60%]"
                onChange={v => { setCurrentPage(v[0]); setSliderCursor(true) }}
                minValue={1}
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
