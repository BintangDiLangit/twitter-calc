# Calculation Tree - Mathematical Communication Platform

A unique social platform where people communicate through numbers and mathematical operations, creating beautiful trees of calculations.

## Features

- 🔢 Start discussions with numbers
- ➕➖✖️➗ Respond with mathematical operations
- 🌳 Visualize calculation trees
- 🔐 User authentication and authorization
- 💎 Premium UI/UX with modern design
- 🧪 Comprehensive testing coverage

## Tech Stack

- **Backend**: Node.js, TypeScript, Express, PostgreSQL
- **Frontend**: React, TypeScript, Vite
- **Infrastructure**: Docker Compose
- **Testing**: Jest, React Testing Library

## Quick Start

### Using Docker (Recommended)

```bash
# Build and start all services
npm run docker:build

# Or just start (after first build)
npm run docker:up

# Stop services
npm run docker:down
```

Access the application at `http://localhost:3000`

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp backend/.env.example backend/.env
```

3. Start PostgreSQL (or use Docker for just the DB)

4. Run development servers:
```bash
npm run dev
```

## Project Structure

```
.
├── backend/          # Node.js + TypeScript API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── types/
│   └── tests/
├── frontend/         # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── contexts/
│   └── tests/
└── docker-compose.yml
```

## Business Scenarios

1. ✅ Unregistered users can view calculation trees
2. ✅ Users can create accounts
3. ✅ Authentication system
4. ✅ Registered users can start calculations
5. ✅ Users can add operations to calculations
6. ✅ Users can respond to any calculation

## API Documentation

See [API.md](./backend/API.md) for detailed API documentation.

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## License

MIT

