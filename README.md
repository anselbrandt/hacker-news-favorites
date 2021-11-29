# Hacker News Favorites

[Hacker News BigQuery Dataset](https://console.cloud.google.com/marketplace/details/y-combinator/hacker-news)

[Hacker News post about dataset](https://news.ycombinator.com/item?id=19304326)

SQL query:

```
  #standardSQL
    SELECT
     `by`,
     COUNT(DISTINCT id) as `num_comments`
    FROM `bigquery-public-data.hacker_news.full`
    WHERE id IS NOT NULL AND `by` != ''
    AND type='comment'
    GROUP BY 1
    ORDER BY num_comments DESC
    LIMIT 10000

```
