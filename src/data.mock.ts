export const created_at = new Date();
export const updated_at = new Date();
export const articlesMock = [
  {
    id: 1,
    title: "寂静海洋中的歌声",
    body: "一本描绘深海中神秘生物与海洋奥秘的小说，通过主人公的探险旅程，展现了一个宁静而生动的海底世界。",
    created_at,
    updated_at,
  },
  {
    id: 2,
    title: "时空旅者的日记",
    body: "描绘了一位穿梭于不同历史时期的旅行者的故事，书中记录了他见证的古代文明兴衰和未来世界的变迁，是一次跨越时空的精彩冒险。",
    created_at,
    updated_at,
  },
  {
    id: 3,
    title: "古代人的故事",
    body: "描绘了一位古代人的故事，以及他们在古代文明中的生活方式。",
    created_at,
    updated_at,
  },
  {
    id: 4,
    title: "古代人的故事2",
    body: "描绘了一位古代人的故事，和他们的工作。",
    created_at,
    updated_at,
  },
];

export const authorsMock = [
  {
    id: 1,
    name: "John Doe",
    created_at,
    updated_at,
  },
  {
    id: 2,
    name: "Jane Smith",
    created_at,
    updated_at,
  },
  {
    id: 3,
    name: "David Johnson",
    created_at,
    updated_at,
  },
];

export const seriesMock = [
  {
    id: 1,
    title: "Sample Series 1",
    created_at,
    updated_at,
  },
  {
    id: 2,
    title: "Sample Series 2",
    created_at,
    updated_at,
  },
  {
    id: 3,
    title: "Sample Series 3",
    created_at,
    updated_at,
  },
];

export const chaptersMock = [
  {
    id: 1,
    article_id: 1,
    series_id: 1,
    order: 1,
    created_at,
    updated_at,
  },
  {
    id: 2,
    article_id: 2,
    series_id: 1,
    order: 2,
    created_at,
    updated_at,
  },
  {
    id: 3,
    article_id: 3,
    series_id: 2,
    order: 1,
    created_at,
    updated_at,
  },
];

export const articleAuthorRelationshipsMock = [
  {
    id: 1,
    author_id: 1,
    article_id: 1,
    created_at,
    updated_at,
  },
  {
    id: 2,
    author_id: 2,
    article_id: 2,
    created_at,
    updated_at,
  },
  {
    id: 3,
    author_id: 3,
    article_id: 3,
    created_at,
    updated_at,
  },
];
