/**
 * 带标签的错误类
 * 用于在错误发生时附加额外的上下文信息，便于调试和错误追踪
 *
 * @example
 * ```ts
 * // 在解析 EPUB 时附加上下文信息
 * try {
 *   const epub = new Epub(arrayBuffer);
 * } catch (e) {
 *   throw new TaggedError("Failed to parse EPUB", {
 *     file: "book.epub",
 *     error: e
 *   });
 * }
 * ```
 *
 * @example
 * ```ts
 * // 在数据验证时附加问题字段
 * function validateUser(data: unknown) {
 *   if (!data.name) {
 *     throw new TaggedError("Missing required field", {
 *       field: "name",
 *       received: data
 *     });
 *   }
 * }
 * ```
 */
export class TaggedError extends Error {
  /**
   * 附加在错误上的标签/上下文数据
   * 可以包含任何有助于调试的信息，如文件名、行号、相关数据等
   */
  tag: unknown;

  /**
   * 创建带标签的错误实例
   * @param message - 错误消息描述
   * @param tag - 附加的上下文数据，可以是任意类型
   */
  constructor(message: string, tag: unknown) {
    super(message);
    this.name = "TaggedError";
    this.tag = tag;
  }
}
