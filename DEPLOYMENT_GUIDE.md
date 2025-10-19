# Deployment Guide

## Overview

This guide provides instructions for deploying the Library application to various environments, from local development to production.

## Prerequisites

Before deploying the application, ensure you have the following installed:

- **Bun** (version 1.0 or higher) - Fast JavaScript/TypeScript runtime
- **Docker and Docker Compose** - For containerized deployment
- **PostgreSQL** (if deploying without Docker) - Version 13 or higher

## Environment Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://dev_user:dev_password@localhost:5432/dev_postgres"

# Application Configuration
PORT=3000
NODE_ENV=production

# Optional: Logging Configuration
LOG_LEVEL=info
LOG_PRETTY=true
```

Copy the example from `.env.example` if available as a starting point.

## Development Deployment

### Quick Start with Docker

1. **Start the database container:**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Run development servers:**
   ```bash
   # Option 1: Use the provided script
   ./dev.sh
   
   # Option 2: Run manually
   bun run --cwd apps/web-api dev &
   bun run --cwd apps/web-client dev
   ```

### Manual Development Setup

1. **Start PostgreSQL database:**
   - Install PostgreSQL locally or use Docker
   - Create database and user as configured in `compose.yml`

2. **Install and run:**
   ```bash
   # Install dependencies
   bun install
   
   # Run backend API server
   cd apps/web-api
   bun run dev
   
   # Run frontend client in a separate terminal
   cd apps/web-client
   bun run dev
   ```

## Production Deployment

### Docker Compose Deployment

Create a production-ready `docker-compose.yml` file:

```yaml
version: "3.8"
services:
  postgres:
    image: groonga/pgroonga:latest
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-prod_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-prod_password}
      POSTGRES_DB: ${POSTGRES_DB:-prod_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-prod_user}"]
      interval: 10s
      timeout: 5s
      retries: 5

  web-api:
    build:
      context: .
      dockerfile: apps/web-api/Dockerfile
    restart: always
    environment:
      - DATABASE_URL=postgresql://prod_user:prod_password@postgres:5432/prod_db
      - NODE_ENV=production
      - PORT=3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web-client:
    build:
      context: .
      dockerfile: apps/web-client/Dockerfile
    restart: always
    ports:
      - "3001:3001"
    depends_on:
      - web-api

volumes:
  postgres_data:
```

### Building Docker Images

1. **Build the application:**
   ```bash
   # Build backend
   cd apps/web-api
   bun run build
   
   # Build frontend
   cd apps/web-client
   bun run build
   ```

2. **Create Dockerfiles** for each application:

   **apps/web-api/Dockerfile:**
   ```dockerfile
   FROM oven/bun:latest
   
   WORKDIR /app
   
   COPY apps/web-api/package.json .
   RUN bun install --production
   
   COPY . .
   
   EXPOSE 3000
   
   CMD ["bun", "start"]
   ```

   **apps/web-client/Dockerfile:**
   ```dockerfile
   FROM oven/bun:latest
   
   WORKDIR /app
   
   COPY apps/web-client/package.json .
   RUN bun install --production
   
   COPY . .
   
   EXPOSE 3001
   
   CMD ["bun", "start"]
   ```

### Direct Production Deployment

1. **Build the application:**
   ```bash
   # Install dependencies
   bun install
   
   # Build backend
   cd apps/web-api
   bun run build
   
   # Build frontend
   cd ../web-client
   bun run build
   ```

2. **Set environment variables:**
   ```bash
   export DATABASE_URL="postgresql://username:password@host:port/database"
   export NODE_ENV=production
   export PORT=3000
   ```

3. **Run the application:**
   ```bash
   # Start backend
   cd apps/web-api
   bun run start
   
   # Start frontend (in separate process if needed)
   cd apps/web-client
   bun run start
   ```

## Database Migration

### Initial Setup

1. **Install Drizzle Kit:**
   ```bash
   bun install drizzle-kit
   ```

2. **Generate and apply migrations:**
   ```bash
   # Generate migration files
   bunx drizzle-kit generate
   
   # Apply migrations
   bunx drizzle-kit push:mysql  # or push:pg for PostgreSQL
   ```

### Production Migrations

In production, run migrations before starting the application:

```bash
# Run migrations
bunx drizzle-kit push:pg --config=drizzle.config.ts

# Then start the application
bun start
```

## Configuration Management

### Environment-specific Configurations

Create separate environment files:

- `.env.production` - Production configuration
- `.env.staging` - Staging configuration
- `.env.development` - Development configuration

### Database Configuration

The application uses PostgreSQL with PGroonga for full-text search. Ensure your production database has the PGroonga extension installed:

```sql
CREATE EXTENSION IF NOT EXISTS pgroonga;
```

## Health Checks

### API Health Endpoint

The web API includes a health check endpoint:

```
GET /health
```

Expected response: `200 OK` with body `{"status": "healthy"}`

### Custom Health Checks

Add custom health check logic as needed in the API application:

```typescript
app.get('/health', () => {
  // Add database connectivity check
  return { status: 'healthy' };
});
```

## Scaling Considerations

### Horizontal Scaling

- The backend services are stateless and can be scaled horizontally
- Database connection pooling should be configured appropriately
- Use a load balancer to distribute traffic across multiple instances

### Database Scaling

- Consider read replicas for read-heavy operations
- Optimize queries and ensure proper indexing
- Monitor database performance and connection limits

## Security Best Practices

### API Security

- Enable CORS with specific origin restrictions in production
- Implement rate limiting to prevent abuse
- Use HTTPS in production environments
- Validate and sanitize all inputs

### Environment Security

- Never commit sensitive environment variables to version control
- Use secrets management for production credentials
- Regularly rotate database passwords and API keys

### Docker Security

- Use non-root users in containers
- Regularly update base images
- Scan images for vulnerabilities

## Monitoring and Logging

### Application Logging

The application uses structured logging. Configure log aggregation in production:

- Log to stdout/stderr for containerized deployments
- Configure log rotation for file-based logging
- Use centralized logging solutions (ELK, Datadog, etc.)

### Performance Monitoring

- Monitor API response times
- Track database query performance
- Set up alerts for error rates and performance degradation

## Troubleshooting

### Common Issues

#### Database Connection Issues
1. Verify database is running and accessible
2. Check `DATABASE_URL` configuration
3. Ensure database user has proper permissions

#### Build Issues
1. Ensure all dependencies are installed (`bun install`)
2. Check for TypeScript compilation errors
3. Verify environment variables are set

#### Port Conflicts
1. Update PORT environment variable
2. Check if services are already running
3. Use `lsof -i :port` to identify port conflicts

### Debugging Production Issues

1. Enable detailed logging in staging environment
2. Use structured logs for easier analysis
3. Implement proper error tracking and reporting

## Backup and Recovery

### Database Backup

Regular database backups are essential:

```bash
# Create backup
pg_dump -U username -h hostname database_name > backup.sql

# Restore backup
psql -U username -h hostname database_name < backup.sql
```

### Configuration Backup

- Version control all configuration files
- Store environment variables securely
- Document deployment procedures

## Rollback Procedures

In case of deployment issues:

1. Keep previous version artifacts
2. Use environment variables to switch between versions
3. Maintain database migration rollback scripts
4. Test rollback procedures in staging environment

## Continuous Integration/Deployment (CI/CD)

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Bun
      uses: oven-sh/setup-bun@v1
      with:
        bun-version: latest
    
    - name: Install dependencies
      run: bun install
    
    - name: Build
      run: |
        cd apps/web-api
        bun run build
        cd ../web-client
        bun run build
    
    - name: Deploy
      run: |
        # Add deployment commands here
        # e.g., deploy to your hosting platform
```

This guide provides a foundation for deploying the Library application. Adjust the configuration based on your specific hosting environment and requirements.