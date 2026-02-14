/**
 * 示例文章数据
 * 用于开发和测试目的
 */

/**
 * 文章接口
 */
export interface Article {
  id: number;
  title: string;
  body: string;
}

/**
 * 示例文章列表
 */
export const sampleArticles: Article[] = [
  {
    title: "How to Learn TypeScript",
    body: "TypeScript is a superset of JavaScript that adds static typing. It helps in building large applications with better scalability and maintainability.",
    id: 1,
  },
  {
    title: "Understanding React Hooks",
    body: "React Hooks are functions that let you use state and other React features without writing a class. They provide more efficient and flexible ways to manage component logic.",
    id: 2,
  },
  {
    title: "The Power of CSS-in-JS",
    body: "CSS-in-JS allows you to write CSS styles directly within your JavaScript code. It provides better modularity, encapsulation, and dynamic styling capabilities.",
    id: 3,
  },
];
