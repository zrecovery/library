
describe("Articles", () => {
  const articleMockRepository = new ArticleMockRepository();
  const articleM = articleModule(articleMockRepository);

  const app = new Elysia();
  app.use(articleM);
  app.listen(3001);

  it("返回单个", async () => {
    const mockResponse = {
      type: "success",
      title: "Article Find By ID",
      data: {
        detail: articlesMock[0],
      },
    };

    const response = await app
      .handle(new Request("http://localhost:3001/articles/1"))
      .then(async (res) => await res.json());

    expect(response).toEqual(mockResponse);
  });

  it("返回列表", async () => {
    const mockResponse = {
      type: "success",
      title: "Article List",
      data: {
        detail: articlesMock,
        paging: articlePageMock,
      },
    };

    const response = await app
      .handle(new Request("http://localhost:3001/articles"))
      .then(async (res) => await res.json());

    expect(response).toEqual(mockResponse);
  });
});
