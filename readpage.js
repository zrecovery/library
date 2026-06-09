/*!
 * @license MPL-2.0-no-copyleft-exception
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as
 * defined by the Mozilla Public License, v. 2.0.
 */

import IndexPage from "./index/indexpage.js";
import ReadIndex from "./index/readindex.js";
import JumpPage from "./jump/jumppage.js";
import ReadSpeech from "./speech/readspeech.js";
import ControlPage from "./control/controlpage.js";
import FlipTextPage from "./text/fliptextpage.js";
import ScrollTextPage from "./text/scrolltextpage.js";
import Page from "../page.js";
import file from "../../data/file.js";
import config from "../../data/config.js";
import onResize from "../../ui/util/onresize.js";
import i18n from "../../i18n/i18n.js";
import wakelock from "../../ui/util/wakelock.js";

export default class ReadPage extends Page {
  // ---- 静态 CSS 类名 ----
  static CSS_FLIP = "read-page-flip";
  static CSS_SCROLL = "read-page-scroll";
  static CSS_WIDE = "read-page-wide";
  static CSS_THIN = "read-page-thin";
  static CSS_SHOW_INDEX = "read-show-index";

  // ---- 构造函数 ----
  constructor() {
    super(document.querySelector("#read_page"));

    /** @type {boolean} */
    this.useSideIndex = null;
    this.onResize = this.onResize.bind(this);
    this.keyboardEvents = this.keyboardEvents.bind(this);
  }

  // ---- URL 路由 ----
  matchUrl(url) {
    if (!/\/read\/\d+/.test(url)) return null;
    const id = +url.split("/").pop();
    if (!id) return null;
    return { id };
  }
  getUrl({ id }) {
    return "/read/" + id;
  }

  // ---- 生命周期（初始化 / 激活 / 更新 / 停用） ----
  /**
   * @description 首次激活阅读页面，初始化所有子页面组件、注册文件操作和滚动事件监听。
   *              仅在页面首次创建时调用一次。
   */
  async onFirstActivate() {
    this.container = document.querySelector("#read_page");

    this.controlPageElement = this.container.querySelector(".read-control");
    this.controlPage = new ControlPage(this.controlPageElement, this);

    this.indexPageElement = this.container.querySelector(".read-index");
    this.indexPage = new IndexPage(this.indexPageElement, this);

    this.jumpPageElement = this.container.querySelector(".read-jump");
    this.jumpPage = new JumpPage(this.jumpPageElement, this);

    this.speech = new ReadSpeech(this);

    this.subPages = [this.controlPage, this.indexPage, this.jumpPage];
    this.forEachSubPage((page) => page.onFirstActivate());

    this.container.addEventListener("scroll", (event) => {
      this.container.scrollTop = 0;
      this.container.scrollLeft = 0;
      event.preventDefault();
    });

    this.registerFileActions();
  }

  /**
   * @description 激活阅读页面，加载文章元数据、索引和正文内容，根据视图模式创建对应的文本页面。
   * @param {{ id: number }} config
   */
  async onActivate({ id }) {
    /** @type {string} */
    this.langTag = await config.get("cjk_lang_tag", "und");
    /** @type {'flip' | 'scroll'} */
    this.renderStyle = await config.get("view_mode", "flip");
    /** @type {'normal' | 'speech' | 'disable'} */
    this.autoLockConfig = await config.get("auto_lock", "speech");

    // EXPERT_CONFIG 当索引页以侧边栏形式显示时的屏幕宽度阈值
    this.screenWidthSideIndex = await config.expert(
      "appearance.screen_width_side_index",
      "number",
      960,
    );

    this.articleId = id;
    const [meta, index, content] = await Promise.all([
      file.getMeta(id),
      file.getIndex(id),
      file.content(id),
    ]);

    if (this.autoLockConfig === "disable") {
      wakelock.request();
    }

    this.meta = meta;
    this.content = content;
    this.index = index;
    if (!this.meta || !this.content) {
      this.gotoList();
      return;
    }
    await file.setMeta(this.meta);

    await this.speech.init();
    this.speech.metaLoad(this.meta);

    this.readIndex = new ReadIndex(this);
    if (this.renderStyle === "flip") {
      this.textPage = new FlipTextPage(this);
      this.container.classList.add(ReadPage.CSS_FLIP);
    } else {
      this.textPage = new ScrollTextPage(this);
      this.container.classList.add(ReadPage.CSS_SCROLL);
    }
    await this.textPage.onActivate({ id });

    document.addEventListener("keydown", this.keyboardEvents);
    this.router.setTitle(this.meta.title, this.getLang());

    this.forEachSubPage((page) => page.onActivate());
    this.updateSideIndex();
  }

  /**
   * @description 切换到另一篇文章：先停用当前页面，再以新文章 ID 重新激活。
   * @param {{ id: number }} config
   */
  async onUpdate({ id }) {
    this.onInactivate();
    this.onActivate({ id });
  }

  /**
   * @description 停用阅读页面，释放所有资源和事件监听。
   */
  async onInactivate() {
    if (this.autoLockConfig === "disable") {
      wakelock.release();
    }
    this.meta = null;
    this.index = null;
    this.content = null;
    this.pages = null;
    this.readIndex = null;
    this.useSideIndex = null;
    document.removeEventListener("keydown", this.keyboardEvents);
    this.forEachSubPage((page) => page.onInactivate());
    this.speech.stop();
    this.speech.metaUnload();
    this.textPage.onInactivate();
    this.textPage = null;
    this.container.classList.remove(ReadPage.CSS_SCROLL, ReadPage.CSS_FLIP);
    this.router.setTitle();
  }

  // ---- 显示 / 隐藏 ----
  /**
   * @description 显示阅读页面。注意：某些文本页渲染需要实测 DOM 元素尺寸，因此放在 show() 之后调用。
   */
  show() {
    super.show();
    // Some text page render requires rendered dom to meansure its element size
    // So we have to put it after show().
    this.textPage.initUpdatePage();
    this.indexPage.initUpdatePage();
    onResize.addListener(this.onResize);
  }

  /**
   * @description 隐藏阅读页面，移除窗口尺寸变化监听器。
   */
  hide() {
    super.hide();
    onResize.removeListener(this.onResize);
  }

  // ---- 窗口尺寸变化 ----
  /**
   * @description 窗口尺寸变化时的回调：更新侧边栏索引布局，并通知所有子页面重新布局。
   */
  onResize() {
    this.updateSideIndex();
    this.forEachSubPage((page) => page.onResize());
  }

  // ---- 键盘事件 ----
  /**
   * @description 处理键盘事件：Esc 键用于在控制面板和子页面之间切换焦点/隐藏。
   * @param {KeyboardEvent} event
   */
  keyboardEvents(event) {
    if (event.code === "Escape") {
      const current = this.activeSubPage();
      if (current) current.hide();
      else if (this.controlPage.hasFocus) this.controlPage.hide();
      else this.controlPage.focus();
    }
  }

  // ---- 导航 ----
  /**
   * @description 跳转回文章列表页。
   */
  gotoList() {
    this.router.go("list");
  }

  // ---- 索引页管理 ----
  /**
   * @description 判断目录/索引页是否正在显示。
   */
  isIndexActive() {
    return this.indexPage?.isCurrent;
  }

  /**
   * @description 判断侧边栏形式的索引页是否正在显示。
   */
  isSideIndexActive() {
    return this.useSideIndex && this.indexPage.isCurrent;
  }

  /**
   * @description 以滑动动画显示或隐藏索引页。
   * @param {'show' | 'hide'} action - 滑动动作（显示/隐藏）
   * @param {number} offset - 滑动的像素偏移量
   */
  slideIndexPage(action, offset) {
    this.indexPage.slideShow(action, offset);
  }

  /**
   * @description 切换索引页的显示状态：如果正在显示且子页面匹配则隐藏，否则显示该子页面。
   * @param {*} page - 要显示的子页面
   */
  toggleIndexPage(page) {
    if (this.isIndexActive() && this.indexPage.isSubPageCurrent(page)) {
      this.indexPage.hide();
    } else {
      this.indexPage.show(page);
    }
  }

  /**
   * @description 根据索引页激活状态更新 DOM 样式和子页面可见性。
   *              全屏索引（非侧边栏）会隐藏文本页并禁用控制面板。
   * @param {boolean} resized - 是否因窗口尺寸变化触发，需要重新测量布局
   */
  updateIndexRender(resized = this.useSideIndex) {
    const active = this.isIndexActive();
    if (active) {
      this.container.classList.add(ReadPage.CSS_SHOW_INDEX);
    } else {
      this.container.classList.remove(ReadPage.CSS_SHOW_INDEX);
    }
    if (active && !this.useSideIndex) {
      this.controlPage.disable();
      this.textPage.hide();
    } else {
      this.controlPage.enable();
      this.textPage.show();
    }
    if (resized) {
      window.requestAnimationFrame(() => {
        this.onResize();
      });
      this.textPage.onResize();
    }
  }

  /**
   * @description 响应式侧边栏切换逻辑：
   *              根据当前窗口宽度与配置阈值比较，决定索引页显示为侧边栏还是全屏浮层。
   *              当窗口宽度 >= 阈值：索引页显示为侧边栏（WIDE 模式），CSS_SHOW_INDEX 控制侧边栏可见性。
   *              当窗口宽度 <  阈值：索引页显示为全屏浮层（THIN 模式），覆盖整个阅读区域。
   *              模式切换时，如果索引页正在显示则触发 updateIndexRender 刷新布局。
   */
  updateSideIndex() {
    const [pageWidth, pageHeight] = onResize.currentSize();
    const sideIndex = pageWidth >= this.screenWidthSideIndex;
    if (sideIndex === this.useSideIndex) return;
    this.useSideIndex = sideIndex;
    if (sideIndex) {
      // 切换为侧边栏模式：添加宽屏样式类，移除窄屏样式类
      this.container.classList.add(ReadPage.CSS_WIDE);
      this.container.classList.remove(ReadPage.CSS_THIN);
    } else {
      // 切换为全屏浮层模式：移除宽屏样式类，添加窄屏样式类
      this.container.classList.remove(ReadPage.CSS_WIDE);
      this.container.classList.add(ReadPage.CSS_THIN);
    }
    if (this.isIndexActive()) {
      // 模式切换时若索引页正在显示，重新渲染以适应新布局
      this.updateIndexRender(true);
    }
  }

  // ---- 活动子页面检测 ----
  /**
   * @description 返回当前处于活动状态的子页面，优先级：索引页 > 控制面板 > 跳转页。
   * @returns {import("./index/indexpage.js").default | import("./control/controlpage.js").default | import("./jump/jumppage.js").default | null}
   */
  activeSubPage() {
    if (this.isIndexActive()) return this.indexPage;
    if (this.isControlActive()) return this.controlPage;
    if (this.isJumpActive()) return this.jumpPage;
    return null;
  }

  // ---- 控制面板代理 ----
  /**
   * @description 判断控制面板是否正在显示。
   */
  isControlActive() {
    return this.controlPage.isShow;
  }

  /**
   * @description 隐藏并禁用控制面板。
   */
  disableControlPage() {
    this.controlPage.hide();
    this.controlPage.disable();
  }

  /**
   * @description 启用控制面板（恢复点击交互）。
   */
  enableControlPage() {
    this.controlPage.enable();
  }

  /**
   * @description 显示控制面板，可选是否自动聚焦。
   * @param {boolean} focus - 是否自动聚焦到控制面板
   */
  showControlPage(focus) {
    if (focus) {
      this.controlPage.focus();
    } else {
      this.controlPage.show();
    }
  }

  /**
   * @description 隐藏控制面板。
   */
  hideControlPage() {
    this.controlPage.hide();
  }

  /**
   * @description 切换控制面板的显示/隐藏状态。
   */
  toggleControlPage() {
    if (this.controlPage.isShow) this.controlPage.hide();
    else this.controlPage.show();
  }

  // ---- 跳转页代理 ----
  /**
   * @description 判断跳转页是否正在显示。
   */
  isJumpActive() {
    return this.jumpPage.isCurrent;
  }

  /**
   * @description 显示跳转页，用于输入页码/章节进行快速跳转。
   */
  showJumpPage() {
    return this.jumpPage.show();
  }

  // ---- 文本页状态查询 ----
  /**
   * @description 判断文本页是否位于最上层（未被控制面板、跳转页或全屏索引页遮挡）。
   *              侧边栏索引页不影响文本页的上层状态。
   */
  isTextPageOnTop() {
    if (this.isControlActive() || this.isJumpActive()) return false;
    if (this.isIndexActive()) return this.isSideIndexActive();
    return true;
  }

  /**
   * @description 获取当前页面渲染位置的 cursor。
   * @returns 文本页当前渲染位置的 cursor
   */
  getRenderCursor() {
    return this.textPage.getRenderCursor();
  }

  // ---- 语音朗读代理 ----
  /**
   * @description 切换语音朗读的播放/暂停状态。
   */
  async toggleSpeech() {
    this.speech.toggle();
  }

  /**
   * @description 判断语音朗读是否正在播放。
   */
  isSpeaking() {
    return this.speech.isWorking();
  }

  // ---- Cursor / 元数据 ----
  /**
   * @description 获取用户已阅读到的 cursor 位置（存储在元数据中的持久化阅读进度）。
   * @returns {number} 用户阅读进度 cursor
   */
  getRawCursor() {
    return this.meta.cursor;
  }

  /**
   * @description 设置新的阅读进度 cursor，并沿传播路径同步给所有相关组件。
   *
   *              传播路径：
   *              1. file.setMeta     - 将新的 cursor 持久化到元数据存储
   *              2. textPage        - 通知文本页更新渲染位置
   *              3. forEachSubPage  - 通知所有子页面（索引页、控制面板、跳转页）更新进度
   *              4. speech          - 通知语音朗读组件同步进度
   *
   * @param {number} cursor - 新的 cursor 位置
   * @param {{resetSpeech: boolean, resetRender: boolean}} config - 控制是否重置朗读/渲染
   */
  setCursor(cursor, config) {
    if (this.meta.cursor === cursor) return;
    this.meta.cursor = cursor;
    file.setMeta(this.meta);
    this.textPage.cursorChange(cursor, config);
    this.forEachSubPage((page) => page.cursorChange(cursor, config));
    this.speech.cursorChange(cursor, config);
  }

  /**
   * @description 获取文章正文内容。
   */
  getContent() {
    return this.content;
  }

  /**
   * @description 获取文章元数据。
   */
  getMeta() {
    return this.meta;
  }

  /**
   * @description 获取当前文章的语言标签（如 zh-CN、en-US）。
   */
  getLang() {
    return this.langTag;
  }

  /**
   * @description 获取文章书签列表。
   */
  getBookmarks() {
    return this.index.bookmarks;
  }

  /**
   * @description 获取文章目录结构。
   */
  getContents() {
    return this.index.content;
  }

  // ---- 文件操作（分享 / 下载） ----
  /**
   * @description 注册分享和下载操作到控制面板的更多菜单中。
   *              仅在首次激活时调用一次（由 {@link onFirstActivate} 触发）。
   *
   *              判断逻辑：
   *              - 分享：检测浏览器是否支持 Web Share API 且支持分享文件，
   *                      若支持则注册分享菜单项。
   *              - 下载：以下情况需要下载功能：
   *                      1. 浏览器不支持分享，或
   *                      2. 非移动端桌面浏览器（即使支持分享，桌面端也提供下载选项）。
   *                      排除条件是：移动端 UA 标签为 true 或设备为 iPhone/iPad，
   *                      此时仅依赖系统分享而不额外注册下载。
   */
  registerFileActions() {
    const mayShare = this.canShareFile();
    this.shareFile = this.shareFile.bind(this);
    if (mayShare) {
      this.controlPage.registerMoreMenu(
        i18n.getMessage("readMenuShare"),
        this.shareFile,
      );
    }
    this.downloadFile = this.downloadFile.bind(this);
    const maybeNeedDownload =
      !mayShare ||
      (navigator.userAgentData?.mobile !== true &&
        !["iPhone", "iPad"].includes(navigator.platform));
    if (maybeNeedDownload) {
      this.controlPage.registerMoreMenu(
        i18n.getMessage("readMenuDownload"),
        this.downloadFile,
      );
    }
  }

  /**
   * @description 检测浏览器是否支持分享文件（Web Share API Level 2）。
   *              通过构造一个空测试文件并调用 navigator.canShare 来验证。
   */
  canShareFile() {
    try {
      if (!navigator.share) return false;
      if (!navigator.canShare) return false;
      const testFile = new File([""], "file.txt", { type: "text/plain" });
      return navigator.canShare({ files: [testFile] });
    } catch (_ignore) {
      return false;
    }
  }

  /**
   * @description 将文章内容转换为带 BOM 的 UTF-8 字节数组，用于分享和下载。
   *              换行符统一转为 CRLF（\r\n），并在开头添加 BOM（\ufeff）以便记事本识别。
   */
  downloadContent() {
    const text = "\ufeff" + this.content.replace(/\r\n|\r|\n/g, "\r\n");
    return new TextEncoder().encode(text).buffer;
  }

  /**
   * @description 通过系统分享面板分享文章文件。
   */
  shareFile() {
    const file = new File([this.downloadContent()], this.meta.title + ".txt", {
      type: "text/plain",
    });
    return navigator.share({ files: [file] });
  }

  /**
   * @description 下载文章内容为 .txt 文件。通过创建隐藏的 <a> 元素触发下载，
   *              下载完成后延迟释放 Blob URL 以清理内存。
   */
  downloadFile() {
    const blob = new Blob([this.downloadContent()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = this.meta.title + ".txt";
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10e3);
  }

  // ---- 工具方法 ----
  /**
   * @description 对所有子页面（控制面板、索引页、跳转页）执行给定的回调函数。
   * @param {(page: import("./index/indexpage.js").default | import("./control/controlpage.js").default | import("./jump/jumppage.js").default) => void} fn
   */
  forEachSubPage(fn) {
    this.subPages.forEach(fn);
  }
}
