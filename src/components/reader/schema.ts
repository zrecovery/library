import Type, { Static } from "typebox";

export const Id = Type.Integer({ minimum: 0 });
export type Id = Static<typeof Id>;

/**
 * 字数游标，用于表示文字在文本的位置，必定为大于等于1的整数
 */
export const Cursor = Type.Integer({ minimum: 1 });
export type Cursor = Static<typeof Cursor>;

/**
 * 用于表示章节层级和各级章节格式
 */
export const ChapterFormat = Type.Array(
    Type.Object({
        level: Type.Integer({ minimum: 1 }),
        format: Type.String(),
    }),
);
export type ChapterFormat = Static<typeof ChapterFormat>;

/**
 * 用于表示各个章节的字符范围、层级和章节标题
 */
export const ChapterCursor = Type.Object({
    start: Type.Number({ minimum: 1 }),
    end: Type.Number({ minimum: 1 }),
    chapter: Type.String(),
    level: Type.Integer({ minimum: 1 }),
});
export type ChapterCursor = Static<typeof ChapterCursor>;

/**
 * 用于表示导入书籍的信息
 */
export type Book = {
    title: string;
    author: string;
    content: string;
    chapter: ChapterCursor[];
};

/**
 * 用于记录每页和对应的字符游标
 */
type Pagination = {
    page: number;
    start: number;
    end: number;
}[];
