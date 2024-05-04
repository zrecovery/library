

export interface PageQuery {
  [property: string]: string| string[] | number | undefined;
  // page: current page.
  page?: number;
  size?: number;
}

export interface Query extends PageQuery {
  keywords?: string[];
  author_id?: number;
  article_id?: number;
  name?: string;
}
