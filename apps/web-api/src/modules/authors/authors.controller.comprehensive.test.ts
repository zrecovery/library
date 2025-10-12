import { describe, expect, test, beforeEach, afterEach, vi } from "bun:test";
import { createAuthorController } from "./authors.controller";
import type { AuthorService } from "backend";
import { Ok, Err } from "result";
import { AuthorDetail } from "backend";
import {
  NotFoundError,
  UnknownError,
} from "backend/src/shared/domain/types/errors";
import { Elysia } from "elysia";

// Mock service
const mockAuthorService: AuthorService = {
  detail: vi.fn(),
};

// Create controller with mock service
const authorController = createAuthorController(mockAuthorService);

// Create test app with controller
const app = new Elysia()
  .group("/api", (api) => api.use(authorController))
  .listen(3001);

describe("Authors Controller - Comprehensive Tests", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();
  });

  describe("GET /authors/:id", () => {
    test("should return author detail successfully", async () => {
      const mockResponse: AuthorDetail = {
        id: 1,
        name: "Test Author",
        articles: [
          {
            id: 1,
            title: "Test Article",
            author: { id: 1, name: "Test Author" },
            chapter: { id: 1, title: "Test Chapter", order: 1 },
          },
        ],
        chapters: [
          {
            id: 1,
            title: "Test Chapter",
          },
        ],
      };

      // Mock the service to return Ok result
      (mockAuthorService.detail as jest.Mock).mockImplementation(
        async (id: number) => {
          return Ok(mockResponse);
        },
      );

      const response = await app.handle(
        new Request("http://localhost/api/authors/1", {
          method: "GET",
          headers: { "content-type": "application/json" },
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(mockResponse);
      expect(mockAuthorService.detail).toHaveBeenCalledWith(1);
    });

    test("should handle not found error", async () => {
      // Mock the service to return Err result with NotFoundError
      (mockAuthorService.detail as jest.Mock).mockImplementation(
        async (id: number) => {
          return Err(new NotFoundError("Author not found"));
        },
      );

      const response = await app.handle(
        new Request("http://localhost/api/authors/1", {
          method: "GET",
          headers: { "content-type": "application/json" },
        }),
      );

      expect(response.status).toBe(404);
      expect(await response.text()).toBe("Not Found");
    });

    test("should handle unknown error", async () => {
      // Mock the service to return Err result with UnknownError
      (mockAuthorService.detail as jest.Mock).mockImplementation(
        async (id: number) => {
          return Err(new UnknownError("Database error"));
        },
      );

      const response = await app.handle(
        new Request("http://localhost/api/authors/1", {
          method: "GET",
          headers: { "content-type": "application/json" },
        }),
      );

      expect(response.status).toBe(500);
      expect(await response.text()).toBe("Internal Server Error");
    });
  });
});
