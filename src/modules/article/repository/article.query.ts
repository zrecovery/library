export const articleEntitySelect = {
  id: true,
  title: true,
  body: true,
  love: true,
  author: {
    select: {
      id: true,
      name: true,
    },
  },
  chapter: {
    select: {
      chapter_order: true,
      book: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  },
};

export interface queryArticle {
  id: number;
  title: string;
  body: string;
  author: {
    id: number;
    name: string;
  };
  chapter: {
    chapter_order: number;
    book: {
      id: number;
      title: string;
    };
  } | null;
  love: boolean;
}

export const queryToArticleEntity = (article: queryArticle) => {
  return {
    id: article.id,
    title: article.title,
    body: article.body,
    author: article.author.name,
    author_id: article.author.id,
    order: article.chapter!.chapter_order,
    book: article.chapter!.book.title,
    book_id: article.chapter!.book.id,
    love: article.love,
  };
};
