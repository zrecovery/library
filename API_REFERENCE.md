# API Reference

## Overview

The Library API provides endpoints for managing articles, authors, and chapters. All API endpoints follow REST principles and return JSON responses. The API uses standard HTTP status codes and follows a consistent error handling pattern.

## Base URL

```
http://localhost:3000/api
```

> Note: The actual port may vary based on your environment configuration

## Authentication

Most endpoints do not require authentication. Authentication mechanisms can be added as needed based on your specific requirements.

## Common Response Format

Successful responses return the requested data directly. Error responses follow this format:

```json
{
  "message": "Error description"
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content to return
- `400 Bad Request` - Validation error or invalid request
- `404 Not Found` - Requested resource does not exist
- `500 Internal Server Error` - Server error

## Articles API

### List Articles

`GET /api/articles`

Retrieve a paginated list of articles with optional search functionality.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (0-indexed) |
| `size` | number | No | 10 | Number of items per page |
| `keyword` | string | No | - | Search keywords (supports + for required, - for excluded) |

#### Example Request

```
GET /api/articles?page=1&size=5&keyword=test
```

#### Example Response

```json
{
  "items": [
    {
      "id": 1,
      "title": "Sample Article",
      "body": "Article content...",
      "author": {
        "id": 1,
        "name": "Author Name"
      },
      "chapter": {
        "id": 1,
        "title": "Chapter 1",
        "order": 1
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "size": 5,
  "hasNext": true
}
```

#### Response Codes

- `200` - Success
- `400` - Invalid query parameters
- `500` - Server error

### Get Article Detail

`GET /api/articles/:id`

Retrieve a specific article by ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Article ID |

#### Example Request

```
GET /api/articles/1
```

#### Example Response

```json
{
  "id": 1,
  "title": "Sample Article",
  "body": "Article content...",
  "author": {
    "id": 1,
    "name": "Author Name"
  },
  "chapter": {
    "id": 1,
    "title": "Chapter 1",
    "order": 1
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Response Codes

- `200` - Success
- `404` - Article not found
- `500` - Server error

### Create Article

`POST /api/articles`

Create a new article.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Article title |
| `body` | string | Yes | Article content |
| `author` | object | Yes | Author information |
| `author.name` | string | Yes | Author name |
| `chapter` | object | No | Chapter information (optional) |
| `chapter.title` | string | No | Chapter title |
| `chapter.order` | number | No | Chapter order |

#### Example Request

```json
{
  "title": "New Article",
  "body": "Article content here...",
  "author": {
    "name": "John Doe"
  },
  "chapter": {
    "title": "Introduction",
    "order": 1
  }
}
```

#### Response

- `201 Created` - Article created successfully
- `400` - Validation error
- `500` - Server error

### Update Article

`PUT /api/articles/:id`

Update an existing article.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Article ID |

#### Request Body

Same as Create Article, all fields are optional for updates.

#### Example Request

```json
{
  "title": "Updated Article Title",
  "body": "Updated content...",
  "author": {
    "name": "Jane Smith"
  }
}
```

#### Response

- `204 No Content` - Article updated successfully
- `400` - Validation error
- `404` - Article not found
- `500` - Server error

### Delete Article

`DELETE /api/articles/:id`

Delete an article by ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Article ID |

#### Response

- `204 No Content` - Article deleted successfully
- `404` - Article not found
- `500` - Server error

## Authors API

### Get Author Detail

`GET /api/authors/:id`

Retrieve detailed information about an author including their articles and series.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Author ID |

#### Example Request

```
GET /api/authors/1
```

#### Example Response

```json
{
  "id": 1,
  "name": "John Doe",
  "articles": [
    {
      "id": 1,
      "title": "Sample Article"
    }
  ],
  "series": [
    {
      "id": 1,
      "name": "Book Series"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Response Codes

- `200` - Success
- `404` - Author not found
- `500` - Server error

## Chapters API

### Get Chapter Detail

`GET /api/chapters/:id`

Retrieve detailed information about a chapter.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Chapter ID |

#### Example Request

```
GET /api/chapters/1
```

#### Example Response

```json
{
  "id": 1,
  "title": "Chapter 1",
  "order": 1,
  "articleId": 1,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Response Codes

- `200` - Success
- `404` - Chapter not found
- `500` - Server error

## Data Types

### Article

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique identifier |
| `title` | string | Article title |
| `body` | string | Article content |
| `author` | Author | Associated author |
| `chapter` | Chapter? | Associated chapter (optional) |
| `createdAt` | string | Creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |

### Author

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique identifier |
| `name` | string | Author name |
| `articles` | Article[] | List of associated articles |
| `series` | Series[] | List of associated series |
| `createdAt` | string | Creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |

### Chapter

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique identifier |
| `title` | string | Chapter title |
| `order` | number | Chapter order in sequence |
| `articleId` | number | Associated article ID |
| `createdAt` | string | Creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |

## Search Keywords Format

The articles list endpoint supports advanced search with keyword formatting:

- `+word` - Include articles that contain this word
- `-word` - Exclude articles that contain this word
- `word` - Articles that contain this word (optional inclusion)

Example: `+javascript +react -angular` will find articles containing both "javascript" and "react" but not containing "angular".

## Common Headers

All requests should include:

```
Content-Type: application/json
Accept: application/json
```