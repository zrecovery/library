// 文件名: packages/backend/src/domain/model/person.ts

import type { Id, Identity } from "./common";

// 具有姓名的人
export type PersonProps = Readonly<{
  name: string; // 人名
}>;
