import { PrismaClient } from "@prisma/client";
import {
	authorsMock,
	articlesMock,
	peopleMock,
	chaptersMock,
	seriesMock,
} from "mock/data";

const prisma = new PrismaClient();
export const resetDatabase = async () => {
	// 清理数据库
	await prisma.$executeRaw`DELETE FROM "chapters"`;
	await prisma.$executeRaw`DELETE FROM "series"`;
	await prisma.$executeRaw`DELETE FROM "authors"`;
	await prisma.$executeRaw`DELETE FROM "people"`;
	await prisma.$executeRaw`DELETE FROM "articles"`;

	// 插入测试数据
	const result = await prisma.article.createMany({ data: articlesMock });
	await prisma.person.createMany({ data: peopleMock });
	await prisma.series.createMany({ data: seriesMock });
	await prisma.chapter.createMany({ data: chaptersMock });
	await prisma.author.createMany({
		data: authorsMock,
	});
};
