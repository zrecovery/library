/**
 * 示例作者关联数据
 * 用于开发和测试目的
 */

/**
 * 作者关联接口
 * 表示文章与作者之间的关联关系
 */
export interface Author {
  id: number;
  personId: number;
  articleId: number;
}

/**
 * 示例作者关联列表
 */
export const sampleAuthors: Author[] = [
  { id: 1, personId: 1, articleId: 1 },
  { id: 2, personId: 2, articleId: 2 },
  { id: 3, personId: 3, articleId: 3 },
];
