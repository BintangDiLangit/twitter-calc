# Setup Guide

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL (for local development without Docker)

## Quick Start with Docker (Recommended)

This is the easiest way to run the entire application:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

## Local Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Setup PostgreSQL Database

Install PostgreSQL and create a database:

```bash
createdb calculation_tree
```

Or use Docker for just the database:

```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=calculation_tree -p 5432:5432 -d postgres:16-alpine
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=calculation_tree
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
```

### 4. Start Development Servers

From the root directory:

```bash
# Start both backend and frontend concurrently
npm run dev

# Or start them separately:
npm run dev:backend    # Backend runs on port 5000
npm run dev:frontend   # Frontend runs on port 3000
```

The database tables will be automatically created on first run.

## Testing

### Run All Tests

```bash
# Run all tests in both backend and frontend
npm test
```

### Backend Tests

```bash
cd backend
npm test

# With coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test

# With coverage
npm run test:coverage
```

## Building for Production

### Build Both Projects

```bash
npm run build
```

### Build Separately

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Project Structure

```
.
├── backend/                 # Node.js + TypeScript backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   └── index.ts        # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── styles/        # CSS styles
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml     # Docker Compose configuration
├── package.json           # Root package.json
└── README.md             # Project documentation
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Calculations Table

```sql
CREATE TABLE calculations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES calculations(id) ON DELETE CASCADE,
  operation_type VARCHAR(20),  -- 'add', 'subtract', 'multiply', 'divide'
  operand DECIMAL(20, 10) NOT NULL,
  result DECIMAL(20, 10) NOT NULL,
  depth INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Documentation

See [API.md](./backend/API.md) for detailed API documentation.

## Troubleshooting

### Port Already in Use

If ports 3000, 5000, or 5432 are already in use, you can change them:

1. Backend port: Edit `backend/.env` and `docker-compose.yml`
2. Frontend port: Edit `frontend/vite.config.ts` and `docker-compose.yml`
3. Database port: Edit `docker-compose.yml`

### Database Connection Issues

1. Make sure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify the database exists: `psql -l`

### CORS Issues

Make sure the `CORS_ORIGIN` in backend `.env` matches your frontend URL.

### Docker Issues

```bash
# Clean up Docker resources
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose up --build --force-recreate
```

## Performance Optimization

### Backend

- Use connection pooling (already configured)
- Add Redis for caching (optional)
- Enable gzip compression (already configured)

### Frontend

- Code splitting is automatic with Vite
- Images are optimized through Nginx
- Static assets are cached

## Security Considerations

⚠️ **Important for Production:**

1. Change the `JWT_SECRET` to a strong, random value
2. Use HTTPS in production
3. Set proper CORS origins
4. Use environment-specific configurations
5. Enable rate limiting
6. Regular security updates

## License

MIT

