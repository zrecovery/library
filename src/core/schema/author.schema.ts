export interface BookEntity {
  id: number;
  title: string;
}

export interface AuthorEntity {
  id: number;
  name: string;
  books: BookEntity[];
}


