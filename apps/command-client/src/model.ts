export enum FileFormat {
  plain = "txt",
  epub = "epub",
}
export interface Config {
  root: string;
  reg: RegExp;
  format: FileFormat;
}
export type Raw = {
  filename: string;
  title: string;
  body: string;
  author: string;
  author_id: string;
  series?: string;
  order: string;
};

export type Created = {
  filename: string;
  title: string;
  body: string;
  author: {
    name: string;
    author_id: number;
  };
  chapter?: {
    title: string;
    order: number;
  };
};

export const format = (raw: Raw): Created => {
  return {
    filename: raw.filename,
    title: raw.title,
    body: raw.body,
    author: {
      name: raw.author,
      author_id: Number(raw.author_id),
    },
    chapter: raw.series
      ? {
          title: raw.series,
          order: Number(raw.order),
        }
      : undefined,
  };
};
