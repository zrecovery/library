/**
 * Mock 数据导出模块
 * 提供示例数据用于开发和测试
 */

// 导出新的命名（推荐使用）
export * from "./articles";
export * from "./authors";
export * from "./chapters";
export * from "./people";
export * from "./series";

// 兼容旧命名（已废弃，建议迁移到新命名）
import { type Article, sampleArticles } from "./articles";
import { type Author, sampleAuthors } from "./authors";
import { type Chapter, sampleChapters } from "./chapters";
import { type Person, samplePeople } from "./people";
import { type Series, sampleSeries } from "./series";

/**
 * @deprecated 请使用 sampleArticles
 */
export const mockArticles = sampleArticles;

/**
 * @deprecated 请使用 sampleAuthors
 */
export const mockAuthors = sampleAuthors;

/**
 * @deprecated 请使用 sampleChapters
 */
export const mockChapters = sampleChapters;

/**
 * @deprecated 请使用 samplePeople
 */
export const mockPeople = samplePeople;

/**
 * @deprecated 请使用 sampleSeries
 */
export const mockSeries = sampleSeries;
