import { ArticleRepository } from './articles.repository'
import type { ArticleCreateDto } from '@app/dtos/article.dto';
import type { Article, PrismaClient } from '@prisma/client';
import { beforeEach, expect, test } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

const prismaMock = mockDeep<PrismaClient>()
const articleRepository = new ArticleRepository(prismaMock);

interface TestCase<I, T, M = null> {
    title: string;
    mock?: M;
    input: I;
    expected?: T
    error?: Error;
}

beforeEach(() => {
    mockReset(prismaMock)
})

test(`创建`, async () => {


    const testCases: Array<TestCase<ArticleCreateDto, Article, Article>> = [
        {
            title: `正常插入`,
            mock: {
                id: 1,
                title: `测试标题`,
                author: `测试作者`,
                serial_name: `测试系列`,
                serial_order: 1.0,
                article_content: `测试文章内容`
            },
            input: {
                title: `测试标题`,
                author: `测试作者`,
                serial_name: `测试系列`,
                serial_order: 1.0,
                article_content: `测试文章内容`
            },
            expected: {
                id: 1,
                title: `测试标题`,
                author: `测试作者`,
                serial_name: `测试系列`,
                serial_order: 1.0,
                article_content: `测试文章内容`
            }
        }
    ]

    const testCasesPromise = testCases.map(async (testCase) => {
        prismaMock.article.create.mockResolvedValue(testCase.mock!);
        await expect(articleRepository.create(testCase.input)).resolves.toEqual(testCase.expected);
    })
    await Promise.all(testCasesPromise)
})

test(`通过ID查询文章`, async () => {
    const testCases: Array<TestCase<number, Article, Article>> = [
        {
            title: `正常查询`,
            mock: {
                id: 1,
                title: `测试标题`,
                author: `测试作者`,
                serial_name: `测试系列`,
                serial_order: 1.0,
                article_content: `测试文章内容`
            },
            input: 1,
            expected: {
                id: 1,
                title: `测试标题`,
                author: `测试作者`,
                serial_name: `测试系列`,
                serial_order: 1.0,
                article_content: `测试文章内容`
            }
        }
    ]

    const testCasesPromise = testCases.map(async testCase => {
        prismaMock.article.findFirstOrThrow.mockResolvedValue(testCase.mock!);
        const result = await articleRepository.getByID(testCase.input)
        expect(result).toStrictEqual(testCase.expected)
    })
    await Promise.all(testCasesPromise);
})

