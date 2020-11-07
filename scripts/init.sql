CREATE DATABASE library;

CREATE TABLE public.authors
(
    id integer NOT NULL DEFAULT nextval('authors_id_seq'::regclass),
    name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT authors_pkey PRIMARY KEY (id),
    CONSTRAINT authors_name_unique UNIQUE (name)
)

TABLESPACE pg_default;

ALTER TABLE public.authors
    OWNER to postgres;

CREATE TABLE public.books
(
    id integer NOT NULL DEFAULT nextval('books_id_seq'::regclass),
    author text COLLATE pg_catalog."default" NOT NULL,
    title text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT books_pkey PRIMARY KEY (id),
    CONSTRAINT books_title_key UNIQUE (title),
    CONSTRAINT books_author_fkey FOREIGN KEY (author)
        REFERENCES public.authors (name) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE public.books
    OWNER to postgres;
-- Index: author_index

-- DROP INDEX public.author_index;

CREATE INDEX author_index
    ON public.books USING btree
    (author COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;


CREATE TABLE public.articles
(
    id integer NOT NULL DEFAULT nextval('articles_id_seq'::regclass),
    article text COLLATE pg_catalog."default" NOT NULL,
    serial_sections real,
    title text COLLATE pg_catalog."default",
    book text COLLATE pg_catalog."default",
    CONSTRAINT articles_pkey PRIMARY KEY (id),
    CONSTRAINT articles_book_fkey FOREIGN KEY (book)
        REFERENCES public.books (title) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE public.articles
    OWNER to postgres;
-- Index: book_index

-- DROP INDEX public.book_index;

CREATE INDEX book_index
    ON public.articles USING btree
    (book COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE OR REPLACE VIEW public.articles_view
 AS
 SELECT articles.id,
    articles.book,
    books.author,
    articles.title,
    articles.serial_sections,
    articles.article
   FROM articles,
    books
  WHERE (articles.book = books.title)
  ORDER BY books.author, articles.book, articles.serial_sections;

ALTER TABLE public.articles_view
    OWNER TO postgres;