import type { Article, ArticleDetail } from "model/domain";

export interface ArticleDetailEntity {
	id: number;
	title: string;
	body: string;
	series_id: number | null;
	chapter: string | null;
	order: number | null;
	person_id: number | null;
	person: string | null;
}
//Todo
export const ArticleDetailEntityToModel = (
	entity: ArticleDetailEntity,
): ArticleDetail => {
	// 使用对象解构和剩余参数来创建 Article 基础对象
	const { id, title, body, ...rest } = entity;

	// 创建 Article 对象，并添加 Timestamp 属性
	const article: Article = { id, title, body };

	// 处理 chapter 属性
	const chapter = entity.chapter
		? { id: entity.series_id!, order: entity.order!, title: entity.chapter }
		: undefined;

	// 处理 author 属性
	const author = entity.person_id
		? { id: entity.person_id, name: entity.person! }
		: undefined;

	// 返回合并后的 ArticleDetail 对象
	return { ...article, chapter, author };
};
