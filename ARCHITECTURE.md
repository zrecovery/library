# Architecture Overview

## Project Structure

The library project is organized as a monorepo with multiple applications and shared packages:

```
library/
├── apps/
│   ├── backend/          # Backend services
│   ├── command-client/   # Command line client
│   ├── web-api/         # Web API layer
│   └── web-client/      # Web frontend
├── packages/
│   ├── epub/            # EPUB handling utilities
│   ├── mockdata/        # Mock data generation
│   ├── result/          # Result type implementation
│   ├── tag-error/       # Tagged error utilities
│   └── tsconfig/        # Shared TypeScript configuration
├── docs/                # Documentation files
└── shared/              # Shared utilities across modules
```

## Domain Architecture

### Articles Module

The articles module follows a functional architecture pattern with clear separation of concerns:

```
Domain Layer
├── Services (business logic)
│   ├── create.ts    # Article creation
│   ├── detail.ts    # Article details retrieval
│   ├── edit.ts      # Article editing
│   ├── list.ts      # Article listing with search
│   └── remove.ts    # Article deletion
└── Interfaces (type definitions)
    ├── article.ts   # Article domain types
    ├── store.ts     # Store interface
    └── service.ts   # Service interface

Infrastructure Layer
├── Store (data access)
│   ├── dto.ts       # Data transfer objects
│   ├── find.ts      # Article retrieval by ID
│   ├── findMany.ts  # Article search and listing
│   ├── remove.ts    # Article deletion
│   ├── save.ts      # Article creation
│   └── update.ts    # Article updating
└── Interfaces (data access types)
    ├── result.ts    # Query result types
    └── query.ts     # Query parameter types
```

## Functional Programming Patterns

### Factory Functions
Instead of classes with mutable state, the codebase uses factory functions:

```typescript
export const createDrizzleSaver = (db: Database): Saver => ({
  save: executeSave(db),
});
```

### Currying for Dependency Injection
Dependencies are injected using currying:

```typescript
const executeOperation = (logger: Logger, store: Store) => 
  async (data: Data) => {
    // Implementation here
  };
```

### Pure Functions
All business logic is implemented as pure functions with no side effects:

```typescript
const calculateOffset = (page: number, size: number): number =>
  (page - 1) * size;
```

### Error Handling with Result Type
Errors are handled using Result<T, E> pattern:

```typescript
import { Ok, Err } from "result";

const operation = async (): Promise<Result<SuccessType, ErrorType>> => {
  // Implementation
};
```

## Data Flow

### Request Processing Pipeline
```
API Endpoint
    ↓
Validation (TypeBox)
    ↓
Service Layer (Business Logic)
    ↓
Store Layer (Data Access)
    ↓
Database (PostgreSQL via Drizzle)
```

### Error Propagation
```
Store Layer (Store Error)
    ↓
Service Layer (Transform to Domain Error)
    ↓
API Layer (HTTP Response)
```

## Technology Stack

### Backend
- **Runtime**: Bun (fast JavaScript/TypeScript runtime)
- **Framework**: Elysia (lightweight web framework)
- **ORM**: Drizzle ORM (type-safe SQL toolkit)
- **Database**: PostgreSQL (primary database)
- **Language**: TypeScript (strongly typed)

### Frontend
- **Framework**: Solid (reactive UI library)
- **Styling**: UnoCSS (utility-first CSS)
- **Routing**: Solid Router

### Testing
- **Runner**: Bun Test (built-in test runner)
- **Assertions**: Built-in expect
- **Mocking**: Bun's vi (built-in mocking)

### Development
- **Formatter**: Biome (fast JavaScript toolchain)
- **Packaging**: Workspaces (monorepo management)

## Error Handling Strategy

### Store Errors
- `NotFoundStoreError` - When requested entity doesn't exist
- `UnknownStoreError` - General database errors
- `ConstraintError` - Database constraint violations

### Domain Errors
- `NotFoundError` - Domain-level not found
- `UnknownError` - General domain errors
- `ValidationError` - Data validation failures

## Logging Strategy

The system uses structured logging with different levels:
- `debug` - Detailed information for debugging
- `info` - General operational information
- `warn` - Warning conditions
- `error` - Error conditions

## Testing Approach

### Unit Tests
- Pure functions are tested in isolation
- Input/output behavior verification
- Edge cases coverage

### Integration Tests
- Component integration validation
- Database transaction testing
- API endpoint testing

### End-to-End Tests
- Complete user journey validation
- Cross-module functionality testing
- Performance validation

## Deployment Considerations

### Environment Configuration
The application uses environment variables for configuration:

```
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/library

# Application
PORT=3000
NODE_ENV=production
```

### Scaling Strategy
- Stateless services for horizontal scaling
- Connection pooling for database
- Caching for frequently accessed data

## Security Considerations

### Input Validation
- All inputs validated using TypeBox
- SQL injection prevention via ORM parameterization
- XSS prevention in frontend rendering

### Authentication & Authorization
- Session-based or token-based authentication
- Role-based access control
- Rate limiting for API endpoints