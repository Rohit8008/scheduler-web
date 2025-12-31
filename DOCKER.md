# Docker Setup Guide for Scheduler

This guide explains how to run the Scheduler application using Docker and Docker Compose for easy local development or deployment.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+

Check your installation:
```bash
docker --version
docker-compose --version
```

## Quick Start with Docker

### Automated Setup (Easiest)

For the simplest setup, use the provided startup script:

**macOS/Linux:**
```bash
./docker-start.sh
```

**Windows:**
```powershell
.\docker-start.ps1
```

The script will:
- Check for Docker installation
- Create `.env` from template if needed
- Verify Firebase service account exists
- Build and start all services
- Display status and access URLs

### Manual Setup

If you prefer manual setup or the script doesn't work for your environment:

#### 1. Prepare Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.docker.example .env

# Edit with your actual credentials
nano .env
```

Fill in your Firebase credentials and other optional settings.

### 2. Prepare Firebase Service Account

Place your Firebase service account JSON file in the root directory:

```bash
# The file should be named: firebase-service-account.json
# It should be in the same directory as docker-compose.yml
ls firebase-service-account.json
```

**Security Note:** This file is already in `.gitignore` and will not be committed.

### 3. Build and Start All Services

```bash
# Build and start all services (Postgres, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **PostgreSQL:** localhost:5432

### 5. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This deletes all data!)
docker-compose down -v
```

## Docker Commands Reference

### Building

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache (fresh build)
docker-compose build --no-cache
```

### Running

```bash
# Start services in detached mode
docker-compose up -d

# Start services with logs
docker-compose up

# Start specific service
docker-compose up -d backend

# Restart a service
docker-compose restart backend
```

### Monitoring

```bash
# View all running containers
docker-compose ps

# View logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs backend

# View last 100 lines of logs
docker-compose logs --tail=100 backend
```

### Troubleshooting

```bash
# Check service health
docker-compose ps

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres -d scheduler_db

# View container resource usage
docker stats

# Inspect a service
docker-compose exec backend env

# Restart services
docker-compose restart
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes (deletes database data!)
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all

# Clean up unused Docker resources
docker system prune -a
```

## Individual Service Setup

### Backend Only

```bash
# Build backend image
docker build -t scheduler-backend ./scheduler-backend

# Run backend (requires PostgreSQL)
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/scheduler_db \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  -v $(pwd)/firebase-service-account.json:/app/config/firebase-service-account.json:ro \
  scheduler-backend
```

### Frontend Only

```bash
# Build frontend image
docker build -t scheduler-frontend ./scheduler-frontend

# Run frontend
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080 \
  -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/scheduler_db \
  scheduler-frontend
```

## Production Deployment

### Environment Variables

For production, set these environment variables:

```bash
# Production database
SPRING_DATASOURCE_URL=jdbc:postgresql://your-prod-db:5432/scheduler_db
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_secure_password

# CORS (set to your production domain)
CORS_ALLOWED_ORIGINS=https://your-domain.com

# Frontend API URL
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Docker Compose Override

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    environment:
      SPRING_DATASOURCE_URL: ${PROD_DATABASE_URL}
      CORS_ALLOWED_ORIGINS: https://your-domain.com
      LOGGING_LEVEL_COM_SCHEDULER: WARN
    restart: always

  frontend:
    environment:
      NEXT_PUBLIC_API_URL: https://api.your-domain.com
      NODE_ENV: production
    restart: always
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Health Checks

The services include health checks:

- **Backend:** http://localhost:8080/actuator/health
- **Frontend:** Built-in Node.js health check
- **PostgreSQL:** `pg_isready` command

Monitor health:
```bash
docker-compose ps
# Shows health status for each service
```

## Common Issues

### Port Already in Use

```bash
# Find process using the port
lsof -i :3000
lsof -i :8080
lsof -i :5432

# Kill the process or change ports in docker-compose.yml
```

### Permission Denied on Firebase File

```bash
# Fix file permissions
chmod 644 firebase-service-account.json
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# Access database directly
docker-compose exec postgres psql -U postgres -d scheduler_db

# View backend logs for connection errors
docker-compose logs backend | grep -i "connection"
```

### Build Failures

```bash
# Clear Docker build cache
docker-compose build --no-cache

# Remove all containers and rebuild
docker-compose down
docker-compose up -d --build
```

### Container Keeps Restarting

```bash
# Check logs for errors
docker-compose logs backend

# Check health status
docker-compose ps

# Inspect container
docker inspect scheduler-backend
```

## Volume Management

### Backup Database

```bash
# Create a backup
docker-compose exec postgres pg_dump -U postgres scheduler_db > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres scheduler_db < backup.sql
```

### Persistent Data

Database data is stored in a Docker volume: `postgres_data`

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect scheduler_postgres_data

# Backup volume
docker run --rm -v scheduler_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore volume
docker run --rm -v scheduler_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz
```

## Development Workflow

### Hot Reload Development

For development with hot reload:

```bash
# Start only database
docker-compose up -d postgres

# Run backend locally
cd scheduler-backend
mvn spring-boot:run

# In another terminal, run frontend locally
cd scheduler-frontend
npm run dev
```

### Debugging

```bash
# Enable debug mode for backend
docker-compose up -d
docker-compose exec backend sh
# Then check logs, environment variables, etc.

# Or run with debug logs
docker-compose logs -f backend
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build images
        run: docker-compose build

      - name: Run tests
        run: |
          docker-compose up -d postgres
          docker-compose run backend mvn test
```

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best Practices for Docker](https://docs.docker.com/develop/dev-best-practices/)

## Support

If you encounter issues with Docker setup:
1. Check this guide's troubleshooting section
2. Review Docker logs: `docker-compose logs`
3. Ensure Docker is running: `docker ps`
4. Check [GitHub Issues](https://github.com/rohit8008/scheduler/issues)

---

**Note:** For detailed application setup (Firebase, Google Calendar, etc.), refer to [SETUP.md](./SETUP.md)
