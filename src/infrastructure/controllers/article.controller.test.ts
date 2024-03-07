import { describe, expect, it } from 'bun:test'
import { ArticleController, articleModule } from './article.controller'
import { ArticleMockRepository, articlesMock } from '../mock/article.mock.repository'
import { ArticleService } from '@src/core/article/article.service'
import { Elysia } from 'elysia'

describe('Articles', () => {
  it('返回单个', async () => {

    const articleMockRepository = new ArticleMockRepository();
    const articleM = articleModule(articleMockRepository)

    const app = new Elysia();
    app.use(articleM);

    const mockResponse = {
      type: "success",
      title: "Article Find By ID",
      data: {
        detail: articlesMock[0]
      }
    }

    app.listen(3001)


    const response = await app
      .handle(new Request('http://localhost:3001/articles/1'))
      .then(async (res) => await res.json());

    expect(response)
      .toEqual(mockResponse);
  })
})
