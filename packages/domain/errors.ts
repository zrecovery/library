/**
 * 领域层统一错误标签。
 *
 * 使用 TaggedError 模式：所有领域错误都通过 `new TaggedError(msg, tag)` 创建，
 * 摒弃传统的 Error 子类继承体系，以获得更好的类型安全和模式匹配能力。
 */
export const DomainErrorTag = {
  NotFound: "Not Found",
  Invalidation: "Invalidation",
  Unknown: "Unknown",
} as const;

export type DomainErrorTag =
  (typeof DomainErrorTag)[keyof typeof DomainErrorTag];
