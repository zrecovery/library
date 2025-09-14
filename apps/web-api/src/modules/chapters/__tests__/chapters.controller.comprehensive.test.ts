import { describe, expect, test, beforeEach, afterEach, vi } from "bun:test";
import { createChapterController } from "../chapters.controller";
import type { ChapterService } from "backend";
import { Ok, Err } from "result";
import { ChapterDetail } from "backend";
import {
  NotFoundError,
  UnknownError,
} from "backend/src/shared/domain/types/errors";
import { Elysia } from "elysia";

// Mock service
const mockChapterService: ChapterService = {
  detail: vi.fn(),
};

// Create controller with mock service
const chapterController = createChapterController(mockChapterService);

// Create test app with controller
const app = new Elysia()
  .group("/api", (api) => api.use(chapterController))
  .listen(3001);

describe("Chapters Controller - Comprehensive Tests", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();
  });

  describe("GET /chapters/:id", () => {
    test("should return chapter detail successfully", async () => {
      const mockResponse: ChapterDetail = {
        id: 1,
        title: "Test Chapter",
        articles: [
          {
            id: 1,
            title: "Test Article",
            author: {
              id: 1,
              name: "Test Author",
            },
          },
        ],
      };

      // Mock the service to return Ok result
      (mockChapterService.detail as jest.Mock).mockImplementation(async (id: number) => {
        return Ok(mockResponse);
      });

      const response = await app.handle(
        new Request("http://localhost/api/chapters/1")
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(mockResponse);
      expect(mockChapterService.detail).toHaveBeenCalledWith(1);
    });

    test("should handle not found error", async () => {
      // Mock the service to return Err result with NotFoundError
      (mockChapterService.detail as jest.Mock).mockImplementation(async (id: number) => {
        return Err(new NotFoundError("Chapter not found"));
      });

      const response = await app.handle(
        new Request("http://localhost/api/chapters/1")
      );

      expect(response.status).toBe(404);
      expect(await response.text()).toBe("Not Found");
    });

    test("should handle unknown error", async () => {
      // Mock the service to return Err result with UnknownError
      (mockChapterService.detail as jest.Mock).mockImplementation(async (id: number) => {
        return Err(new UnknownError("Database error"));
      });

      const response = await app.handle(
        new Request("http://localhost/api/chapters/1")
      );

      expect(response.status).toBe(500);
      expect(await response.text()).toBe("Internal Server Error");
    });
  });
});