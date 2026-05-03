/**
 * 存储层错误标签（与 TaggedError 配合使用）。
 *
 * @deprecated 建议直接使用各 usecase 层的 ErrorEnum (如 ArticleSaverErrorEnum)
 *             或 DomainErrorTag。此模块为向后兼容保留。
 */
export const StoreErrorTag = {
  NotFound: "NOT FOUND",
  UnknownError: "UNKNOWN_ERROR",
  Invalidation: "INVALIDATION",
} as const;

export type StoreErrorTag = (typeof StoreErrorTag)[keyof typeof StoreErrorTag];
