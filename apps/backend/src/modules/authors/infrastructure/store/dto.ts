export const toAuthorModel = (e: { id: number; name: string | null }):
  | { id: number; name: string }
  | undefined => {
  if (e.name !== null) {
    return {
      id: e.id,
      name: e.name,
    };
  }
};

export const toChapterModel = (chapter: {
  id: number | null;
  title: string | null;
  order: number | null;
}): { id: number; title: string; order: number } | undefined => {
  if (chapter.id === null || chapter.title === null || chapter.order === null) {
    return;
  }
  return { id: chapter.id, title: chapter.title, order: chapter.order };
};

export const toChapterMetaModel = (chapter: {
  id: number | null;
  title: string | null;
}): { id: number; title: string } | undefined => {
  if (chapter.id === null || chapter.title === null) {
    return;
  }
  return { id: chapter.id, title: chapter.title };
};

export const toModel = (o: {
  article: { id: number; title: string };
  chapter: { id: number | null; title: string | null; order: number | null };
}): { id: number; title: string; chapter?: object } => {
  return { ...o.article, chapter: toChapterModel(o.chapter) };
};
