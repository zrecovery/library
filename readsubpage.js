/*!
 * @license MPL-2.0-no-copyleft-exception
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as
 * defined by the Mozilla Public License, v. 2.0.
 */

import ReadPage from "./readpage.js";
import dom from "../../ui/util/dom.js";

/**
 * ReadSubPage — 所有阅读器子页面的基类。
 * 子页面（如目录、搜索、书签等）共享统一的可见性切换、无障碍和生命周期管理。
 * 每个子页面在同一时刻最多只有一个处于活跃（isCurrent）状态。
 *
 * ReadSubPage — base class for all reader sub-pages.
 * Sub-pages (contents, search, bookmarks, etc.) share unified visibility toggle,
 * accessibility, and lifecycle management. Only one sub-page can be current at a time.
 */
export default class ReadSubPage {
  /**
   * @param {HTMLElement} container
   * @param {ReadPage} readPage
   */
  constructor(container, readPage) {
    this.container = container;
    this.readPage = readPage;

    this.isCurrent = false;
    this.hide();
  }

  // ---- visibility 可见性切换 ----

  /**
   * 显示当前子页面：
   * - 添加 CSS 类标记为当前页
   * - 移除 aria-hidden 使其对屏幕阅读器可见
   * - 启用容器内的键盘焦点，同时禁用主控制页的键盘焦点
   */
  show() {
    this.isCurrent = true;
    this.container.classList.add("read-sub-page-current");
    this.container.removeAttribute("aria-hidden");
    dom.enableKeyboardFocus(this.container);
    dom.disableKeyboardFocus(this.readPage.controlPage.container);
  }

  /**
   * 隐藏当前子页面：
   * - 移除 CSS 类标记
   * - 设置 aria-hidden="true" 对屏幕阅读器隐藏
   * - 禁用容器内的键盘焦点，恢复主控制页的键盘焦点
   */
  hide() {
    this.isCurrent = false;
    this.container.classList.remove("read-sub-page-current");
    this.container.setAttribute("aria-hidden", "true");
    dom.disableKeyboardFocus(this.container);
    dom.enableKeyboardFocus(this.readPage.controlPage.container);
  }

  // ---- lifecycle 生命周期钩子 ----

  /** 返回当前子页面是否处于活跃状态 */
  isActive() {
    return this.isCurrent;
  }

  /** 首次激活时的回调，子类可按需覆盖 */
  onFirstActivate() {}

  /**
   * 每次激活时的回调。
   * 默认行为：先隐藏自身（子类应在覆盖时调用 super.onActivate() 或自行处理）。
   */
  onActivate() {
    this.hide();
  }

  /** 失去激活状态时的回调 */
  onInactivate() {}

  /** 窗口尺寸变化时的回调 */
  onResize() {}

  /** 阅读进度变化时的回调，参数为当前光标位置和配置对象 */
  cursorChange(cursor, config) {}
}
