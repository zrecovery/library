export type ColumnType = "integer" | "text" | "real";

export interface ColumnDef {
  readonly name: string;
  readonly type: ColumnType;
}

export interface ArticlesColumns {
  readonly id: ColumnDef;
  readonly createdAt: ColumnDef;
  readonly updatedAt: ColumnDef;
  readonly title: ColumnDef;
  readonly body: ColumnDef;
}

export interface PeopleColumns {
  readonly id: ColumnDef;
  readonly createdAt: ColumnDef;
  readonly updatedAt: ColumnDef;
  readonly name: ColumnDef;
}

export interface AuthorsColumns {
  readonly id: ColumnDef;
  readonly createdAt: ColumnDef;
  readonly updatedAt: ColumnDef;
  readonly personId: ColumnDef;
  readonly articleId: ColumnDef;
}

export interface SeriesColumns {
  readonly id: ColumnDef;
  readonly createdAt: ColumnDef;
  readonly updatedAt: ColumnDef;
  readonly title: ColumnDef;
}

export interface ChaptersColumns {
  readonly id: ColumnDef;
  readonly createdAt: ColumnDef;
  readonly updatedAt: ColumnDef;
  readonly order: ColumnDef;
  readonly articleId: ColumnDef;
  readonly seriesId: ColumnDef;
}

export interface SettingsColumns {
  readonly id: ColumnDef;
  readonly userId: ColumnDef;
  readonly key: ColumnDef;
  readonly value: ColumnDef;
  readonly type: ColumnDef;
  readonly description: ColumnDef;
  readonly createdAt: ColumnDef;
  readonly updatedAt: ColumnDef;
}

export interface TableSchema<TColumns> {
  readonly name: string;
  readonly columns: TColumns;
}

const createTable = <TColumns>(
  name: string,
  columns: TColumns,
): TableSchema<TColumns> =>
  Object.freeze({
    name,
    columns: Object.freeze(columns),
  });

export const articlesTable = createTable<ArticlesColumns>("articles", {
  id: { name: "id", type: "integer" },
  createdAt: { name: "created_at", type: "integer" },
  updatedAt: { name: "updated_at", type: "integer" },
  title: { name: "title", type: "text" },
  body: { name: "body", type: "text" },
});

export const peopleTable = createTable<PeopleColumns>("people", {
  id: { name: "id", type: "integer" },
  createdAt: { name: "created_at", type: "integer" },
  updatedAt: { name: "updated_at", type: "integer" },
  name: { name: "name", type: "text" },
});

export const authorsTable = createTable<AuthorsColumns>("authors", {
  id: { name: "id", type: "integer" },
  createdAt: { name: "created_at", type: "integer" },
  updatedAt: { name: "updated_at", type: "integer" },
  personId: { name: "person_id", type: "integer" },
  articleId: { name: "article_id", type: "integer" },
});

export const seriesTable = createTable<SeriesColumns>("series", {
  id: { name: "id", type: "integer" },
  createdAt: { name: "created_at", type: "integer" },
  updatedAt: { name: "updated_at", type: "integer" },
  title: { name: "title", type: "text" },
});

export const chaptersTable = createTable<ChaptersColumns>("chapters", {
  id: { name: "id", type: "integer" },
  createdAt: { name: "created_at", type: "integer" },
  updatedAt: { name: "updated_at", type: "integer" },
  order: { name: "order", type: "integer" },
  articleId: { name: "article_id", type: "integer" },
  seriesId: { name: "series_id", type: "integer" },
});

export const settingsTable = createTable<SettingsColumns>("settings", {
  id: { name: "id", type: "integer" },
  userId: { name: "user_id", type: "integer" },
  key: { name: "key", type: "text" },
  value: { name: "value", type: "text" },
  type: { name: "type", type: "text" },
  description: { name: "description", type: "text" },
  createdAt: { name: "created_at", type: "integer" },
  updatedAt: { name: "updated_at", type: "integer" },
});

export const schema = Object.freeze({
  articles: articlesTable,
  people: peopleTable,
  authors: authorsTable,
  series: seriesTable,
  chapters: chaptersTable,
  settings: settingsTable,
});

export type Schema = typeof schema;
