SELECT
  ar.id,
  ar.title,
  au.name AS author,
  ar.author_id,
  ar.serial_id AS book_id,
  bo.title AS book,
  ar.serial_order,
  ar.article_content AS body
FROM
  (
    (
      "Article" ar
      JOIN "Author" au ON ((ar.author_id = au.id))
    )
    JOIN "Book" bo ON (
      (
        (bo.author_id = au.id)
        AND (ar.serial_id = bo.id)
      )
    )
  );