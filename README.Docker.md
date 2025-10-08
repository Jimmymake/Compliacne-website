# Docker Configuration for Compliance Web Application

This document explains how to use Docker with the Compliance Web application.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Docker Setup

### 1. Build Docker Images

#### Development Image
```bash
npm run docker:build:dev
```

#### Production Image
```bash
npm run docker:build:prod
```

#### Build All Targets
```bash
npm run docker:build
```

### 2. Run with Docker

#### Development Mode
```bash
# Using Docker directly
npm run docker:run:dev

# Using Docker Compose (recommended)
npm run docker:compose:dev
```

#### Production Mode
```bash
# Using Docker directly
npm run docker:run:prod

# Using Docker Compose (recommended)
npm run docker:compose:prod
```

## Docker Compose Profiles

### Development Profile
- Runs the application in development mode
- Hot reloading enabled
- Source code mounted as volume
- Accessible at `http://localhost:5173`

```bash
docker-compose -f docker-compose.dev.yml up
```

### Production Profile
- Runs the application in production mode
- Optimized build with nginx
- Accessible at `http://localhost:80`

```bash
docker-compose --profile prod up
```

## Environment Variables

Copy `env.example` to `.env.local` and adjust the values:

```bash
cp env.example .env.local
```

Key environment variables:
- `VITE_API_URL`: Backend API URL
- `NODE_ENV`: Environment (development/production)
- `PORT`: Application port

## Docker Commands Reference

### Building
```bash
# Build development image
docker build --target development -t compliance-web:dev .

# Build production image
docker build --target production -t compliance-web:prod .
```

### Running
```bash
# Run development container
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules compliance-web:dev

# Run production container
docker run -p 80:80 compliance-web:prod
```

### Docker Compose
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start production environment
docker-compose --profile prod up

# Build services
docker-compose build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### Cleanup
```bash
# Clean up Docker system
npm run docker:clean

# Remove all containers and images
docker-compose down --rmi all --volumes --remove-orphans
```

## Multi-Stage Build Explanation

The Dockerfile uses a multi-stage build approach:

1. **Builder Stage**: Installs dependencies and builds the application
2. **Development Stage**: Sets up development environment with hot reloading
3. **Production Stage**: Serves the built application with nginx

## Nginx Configuration

The production build uses nginx with the following features:
- Gzip compression
- Security headers
- Client-side routing support (React Router)
- Static asset caching
- API proxy configuration
- Health check endpoint

## Troubleshooting

### Port Conflicts
If ports are already in use, modify the port mappings in docker-compose files:
```yaml
ports:
  - "3000:5173"  # Change 5173 to available port
```

### Volume Issues
If you encounter permission issues with volumes:
```bash
# Fix ownership (Linux/Mac)
sudo chown -R $USER:$USER .
```

### Build Issues
If build fails, try cleaning Docker cache:
```bash
docker builder prune
docker system prune -a
```

## Production Deployment

For production deployment:

1. Build the production image:
   ```bash
   docker build --target production -t compliance-web:prod .
   ```

2. Run with environment variables:
   ```bash
   docker run -p 80:80 --env-file .env.production compliance-web:prod
   ```

3. Or use Docker Compose with production profile:
   ```bash
   docker-compose --profile prod up -d
   ```

## Integration with Backend

To integrate with your backend service:

1. Update the `backend` service in `docker-compose.yml`
2. Modify the nginx configuration to proxy API requests
3. Set the correct `VITE_API_URL` environment variable

Example backend service configuration:
```yaml
backend:
  build:
    context: ./backend
  ports:
    - "4000:4000"
  environment:
    - NODE_ENV=production
  networks:
    - compliance-network
```
