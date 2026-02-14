/**
 * 示例章节数据
 * 用于开发和测试目的
 */

/**
 * 章节接口
 */
export interface Chapter {
  id: number;
  seriesId: number;
  title: string;
  order: number;
}

/**
 * 示例章节列表
 */
export const sampleChapters: Chapter[] = [
  {
    id: 1,
    seriesId: 1,
    title: "Chapter 1: The Beginning",
    order: 1,
  },
  {
    id: 2,
    seriesId: 1,
    title: "Chapter 2: The Journey",
    order: 2,
  },
  {
    id: 3,
    seriesId: 2,
    title: "Chapter 1: A New Start",
    order: 1,
  },
];
