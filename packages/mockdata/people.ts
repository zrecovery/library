/**
 * 示例人员数据
 * 用于开发和测试目的
 */

/**
 * 人员接口
 */
export interface Person {
  id: number;
  name: string;
}

/**
 * 示例人员列表
 */
export const samplePeople: Person[] = [
  {
    id: 1,
    name: "John Doe",
  },
  {
    id: 2,
    name: "Jane Smith",
  },
  {
    id: 3,
    name: "Alice Johnson",
  },
];
