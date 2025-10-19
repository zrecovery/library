# Development Workflow

## Overview

This document outlines the development workflow for the Library project, providing guidelines for contributing code, running the application locally, and following established patterns and practices.

## Project Setup

### Prerequisites

Before starting development, ensure you have:

- **Bun** (version 1.0+) - JavaScript/TypeScript runtime and package manager
- **Node.js** (if using Node.js features) - Though Bun is preferred
- **Docker and Docker Compose** - For running services locally
- **Git** - Version control system
- **Code Editor** - VS Code recommended with TypeScript support

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd library
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with appropriate values
   ```

4. **Start development database:**
   ```bash
   docker-compose up -d
   ```

5. **Run the development servers:**
   ```bash
   # Option 1: Use the development script
   ./dev.sh
   
   # Option 2: Run manually
   bun run --cwd apps/web-api dev
   bun run --cwd apps/web-client dev  # in separate terminal
   ```

## Project Structure

```
library/
├── apps/                 # Application modules
│   ├── backend/          # Backend services
│   ├── command-client/   # Command line tools
│   ├── web-api/          # Web API server
│   └── web-client/       # Web frontend
├── packages/            # Shared packages
│   ├── epub/            # EPUB handling utilities
│   ├── mockdata/        # Mock data generation
│   ├── result/          # Result type utilities
│   ├── tag-error/       # Tagged error utilities
│   └── tsconfig/        # Shared TypeScript configs
├── docs/                # Documentation files
├── .env*                # Environment configuration
└── shared/              # Cross-module utilities
```

## Development Commands

### Running Applications

```bash
# Start development servers
./dev.sh

# Run individual apps in development mode
bun run --cwd apps/web-api dev
bun run --cwd apps/web-client dev

# Build applications
bun run --cwd apps/web-api build
bun run --cwd apps/web-client build

# Run applications in production mode
bun run --cwd apps/web-api start
bun run --cwd apps/web-client start
```

### Testing

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test path/to/test-file.test.ts

# Run tests matching pattern
bun test --test-name-pattern "test-name"
```

### Code Quality

```bash
# Format code
bun run format

# Lint code
bun run lint

# Check code
bun run check
```

## Code Style and Conventions

### Functional Programming Principles

The codebase follows functional programming principles:

1. **Immutability**: Use `const` instead of `let`/`var`, use `readonly` types
2. **Pure Functions**: Functions should have no side effects
3. **Function Composition**: Combine small functions to create complex behavior
4. **Currying**: Use currying for dependency injection
5. **Error Handling**: Use `Result<T, E>` type for explicit error handling

### Naming Conventions

- **Functions**: Use descriptive names, prefer action words (e.g., `createArticle`, `findUser`)
- **Variables**: Use camelCase, be descriptive (e.g., `articleTitle`, `userList`)
- **Types**: Use PascalCase (e.g., `ArticleType`, `UserModel`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `DEFAULT_PAGE_SIZE`)

### File Organization

Each functional module should follow this structure:

```typescript
// ============================================================================
// Types and Interfaces
// ============================================================================

// ============================================================================
// Pure Functions - Data Transformation
// ============================================================================

// ============================================================================
// Database Operations
// ============================================================================

// ============================================================================
// Error Handling
// ============================================================================

// ============================================================================
// Orchestration
// ============================================================================

// ============================================================================
// Public API
// ============================================================================
```

### Error Handling Pattern

```typescript
import { Ok, Err } from "result";

// Define error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Use Result type for operations that can fail
const operation = async (input: InputType): Promise<Result<SuccessType, ErrorType>> => {
  try {
    // Implementation here
    return Ok(result);
  } catch (error) {
    return Err(error);
  }
};
```

## Development Patterns

### Factory Functions

Instead of classes, use factory functions:

```typescript
// Good: Factory function
export const createArticleService = (logger: Logger, store: ArticleStore) => ({
  create: createArticle(logger, store),
  find: findArticle(logger, store),
  update: updateArticle(logger, store),
  remove: removeArticle(logger, store)
});

// Usage
const service = createArticleService(logger, store);
```

### Currying for Dependency Injection

Use currying to inject dependencies:

```typescript
// Dependencies are injected via currying
const saveArticle = (db: Database) => 
  async (article: ArticleCreate) => {
    // Implementation here
    return await db.insert(articles).values(article);
  };

// Usage
const articleSaver = saveArticle(db);
const result = await articleSaver(articleData);
```

### Function Composition

Compose small functions to build complex behavior:

```typescript
const processArticle = (db: Database) => 
  async (input: ArticleInput) => 
    await validateInput(input)
      .andThen(transformInput)
      .andThen(saveArticle(db));
```

## Testing Strategy

### Test Structure

Follow the standard test structure:

```typescript
import { describe, expect, test, beforeEach, afterEach, vi } from "bun:test";

// ============================================================================
// Mock Setup
// ============================================================================
const createMockLogger = () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  trace: vi.fn(),
});

// ============================================================================
// Test Data Factories
// ============================================================================
const createTestArticle = (): ArticleCreate => ({
  title: "Test Article",
  body: "Test Body",
  author: { name: "Test Author" },
});

// ============================================================================
// Tests
// ============================================================================
describe("Article Service", () => {
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockStore: ArticleStore;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockStore = createMockStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Success Cases", () => {
    test("should create article successfully", async () => {
      // Test implementation
    });
  });

  describe("Error Cases", () => {
    test("should handle validation errors", async () => {
      // Test implementation
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty inputs", async () => {
      // Test implementation
    });
  });
});
```

### Test Categories

1. **Unit Tests**: Test pure functions in isolation
2. **Integration Tests**: Test function compositions
3. **Error Path Tests**: Test all error scenarios
4. **Edge Case Tests**: Test boundary conditions
5. **Performance Tests**: Test performance under load

### Test Data Management

Use factories for consistent test data:

```typescript
const createMinimalArticle = (): ArticleCreate => ({
  title: "Test Article",
  body: "Test Body",
  author: { name: "Test Author" },
});

const createCompleteArticle = (): ArticleCreate => ({
  ...createMinimalArticle(),
  chapter: { title: "Chapter 1", order: 1 },
  tags: ["test", "sample"]
});
```

## Database Operations

### Drizzle ORM Usage

Use Drizzle ORM for database operations:

```typescript
import { eq, like, and } from "drizzle-orm";

// Query examples
const findArticle = async (id: number) => {
  return await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
};

const searchArticles = async (keyword: string) => {
  return await db
    .select()
    .from(articles)
    .where(like(articles.title, `%${keyword}%`));
};
```

### Transaction Handling

Use transactions for operations that need atomicity:

```typescript
const createArticleWithRelations = async (data: ArticleCreate) => {
  return await db.transaction(async (trx) => {
    const article = await trx.insert(articles).values(data).returning();
    
    if (data.author) {
      await trx.insert(authors).values({
        articleId: article[0].id,
        name: data.author.name
      });
    }
    
    return article[0];
  });
};
```

## Adding New Features

### 1. Plan the Feature

- Define user stories
- Identify required data models
- Plan API endpoints
- Consider error scenarios

### 2. Create Domain Types

First, define the types in the domain layer:

```typescript
// apps/backend/src/modules/articles/domain/types/article.ts

export interface ArticleCreate {
  title: string;
  body: string;
  author: { name: string };
  chapter?: { title: string; order: number };
}
```

### 3. Implement Infrastructure Layer

Implement data access functionality:

```typescript
// Infrastructure layer implementations
// apps/backend/src/modules/articles/infrastructure/store/
```

### 4. Create Service Layer

Implement business logic:

```typescript
// Service layer implementations
// apps/backend/src/modules/articles/domain/services/
```

### 5. Add API Endpoints

Create API controllers:

```typescript
// API controllers
// apps/web-api/src/modules/articles/
```

### 6. Write Tests

Write comprehensive tests at all levels:

- Unit tests for pure functions
- Integration tests for service operations
- API tests for endpoints
- End-to-end tests for user flows

## Code Review Process

### Pre-push Checklist

Before pushing changes, ensure:

- [ ] All tests pass (`bun test`)
- [ ] Code is formatted (`bun run format`)
- [ ] No linting errors (`bun run lint`)
- [ ] New functionality is well-tested
- [ ] Documentation is updated (if applicable)
- [ ] Error handling is comprehensive
- [ ] Code follows functional programming principles

### Pull Request Guidelines

When creating pull requests:

1. **Title**: Use clear, descriptive titles
2. **Description**: Include context, approach, and testing notes
3. **Changes**: Group related changes in a single PR
4. **Size**: Keep PRs reasonably sized (ideally <500 lines)
5. **Reviewers**: Request review from relevant team members

## Branching Strategy

### Main Branches

- `main` - Production-ready code
- `develop` - Integration branch for features
- `release/*` - Release preparation
- `hotfix/*` - Critical production fixes

### Feature Branches

Create feature branches with descriptive names:

```
feature/user-authentication
feature/article-search-enhancement
bugfix/login-error-handling
```

## Continuous Integration

The CI pipeline includes:

1. **Code Quality Checks**: Linting and formatting
2. **Unit Tests**: All unit tests must pass
3. **Integration Tests**: Integration tests must pass
4. **Security Scans**: Vulnerability detection
5. **Build Verification**: All packages build successfully

## Performance Considerations

### Database Queries

- Use indexes appropriately
- Avoid N+1 query problems
- Use connection pooling
- Implement caching where appropriate

### API Performance

- Implement pagination for large datasets
- Use efficient serialization
- Consider rate limiting
- Implement proper error handling

### Frontend Performance

- Use efficient rendering patterns
- Implement proper state management
- Consider code splitting
- Optimize bundle size

## Debugging Tips

### Backend Debugging

```bash
# Enable debugging
NODE_ENV=development bun run --cwd apps/web-api dev

# Add debug logs
logger.debug("Debug message", { context: data });
```

### Frontend Debugging

Use browser developer tools and Solid.js devtools for debugging UI issues.

## Common Development Tasks

### Adding a New Module

1. Create the module in the appropriate location
2. Define domain types and interfaces
3. Implement infrastructure layer
4. Create service layer
5. Add API endpoints
6. Write tests
7. Update documentation

### Updating Dependencies

```bash
# Update bun dependencies
bun update

# Update specific package
bun update <package-name>

# Check for outdated packages
bun outdated
```

### Database Schema Changes

1. Update Drizzle schema files
2. Generate migration (if needed)
3. Test with development database
4. Update seed data if necessary
5. Document the changes

## Troubleshooting

### Common Issues

**Dependency Issues**:
```bash
# Clean and reinstall
rm -rf node_modules bun.lockb
bun install
```

**Database Connection**:
```bash
# Verify database is running
docker-compose ps
# Check environment variables
echo $DATABASE_URL
```

**TypeScript Errors**:
```bash
# Run type check
bun run --cwd apps/web-api check
# Or run tsc directly
npx tsc --noEmit
```

This workflow ensures consistent, high-quality development practices across the team. Follow these guidelines to maintain code quality and collaboration efficiency.