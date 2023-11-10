SELECT
  articles_view.id,
  articles_view.author,
  articles_view.title,
  articles_view.body,
  articles_view.book,
  articles_view.chapter_order,
  articles_view.book_id,
  articles_view.author_id,
  articles_view.love
FROM
  articles_view
WHERE
  (NULL :: unknown IS NOT NULL);