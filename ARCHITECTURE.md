# Architecture Documentation

## System Overview

The Calculation Tree application is built using a modern three-tier architecture:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │ ───▶ │   Backend   │ ───▶ │  Database   │
│   (React)   │ ◀─── │  (Node.js)  │ ◀─── │ (PostgreSQL)│
└─────────────┘      └─────────────┘      └─────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

### Folder Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx
│   ├── CalculationNode.tsx
│   └── CreateCalculationModal.tsx
│
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   └── Register.tsx
│
├── contexts/           # React contexts
│   └── AuthContext.tsx
│
├── hooks/              # Custom React hooks
│   └── useCalculations.ts
│
├── services/           # API integration
│   └── api.ts
│
├── types/              # TypeScript definitions
│   └── index.ts
│
├── styles/             # Global styles
│   └── index.css
│
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

### State Management

#### Local State
- Component-level state using `useState`
- Form inputs and UI state

#### Context API
- **AuthContext**: User authentication state
  - Current user information
  - JWT token
  - Login/logout functions
  - Authentication status

#### Custom Hooks
- **useCalculations**: Calculation data management
  - Fetches calculation trees
  - Creates new calculations
  - Deletes calculations
  - Handles loading and error states

### Component Architecture

#### Component Hierarchy
```
App
├── AuthProvider
│   ├── BrowserRouter
│   │   ├── Navbar
│   │   └── Routes
│   │       ├── Home
│   │       │   ├── CalculationNode (recursive)
│   │       │   └── CreateCalculationModal
│   │       ├── Login
│   │       └── Register
```

#### Component Patterns
- **Container/Presenter**: Separation of logic and presentation
- **Composition**: Components composed together
- **Render Props**: Flexible component APIs
- **Higher-Order Components**: Route protection

### Routing Strategy

#### Public Routes
- `/` - Home (visible to all)
- `/login` - Login page (redirects if authenticated)
- `/register` - Register page (redirects if authenticated)

#### Route Protection
- `PublicRoute`: Redirects authenticated users to home
- Authentication-required features show prompts

### API Communication

#### HTTP Client Configuration
```typescript
axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})
```

#### Request Interceptor
- Automatically attaches JWT token to requests
- Reads token from localStorage

#### Error Handling
- Centralized error handling in hooks
- User-friendly error messages
- Network error detection

## Backend Architecture

### Technology Stack
- **Node.js 20**: JavaScript runtime
- **Express.js**: Web framework
- **TypeScript**: Type-safe development
- **PostgreSQL**: Relational database
- **pg**: PostgreSQL client
- **JWT**: Authentication
- **bcrypt**: Password hashing

### Folder Structure

```
backend/src/
├── config/             # Configuration
│   └── database.ts
│
├── controllers/        # Request handlers
│   ├── authController.ts
│   └── calculationController.ts
│
├── middleware/         # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validation.ts
│
├── models/            # Data models
│   ├── User.ts
│   └── Calculation.ts
│
├── routes/            # API routes
│   ├── authRoutes.ts
│   └── calculationRoutes.ts
│
├── types/             # TypeScript definitions
│   └── index.ts
│
└── index.ts          # Entry point
```

### Layered Architecture

```
┌─────────────────────────────────────┐
│         Routes Layer                │
│  (Routing, Validation, Auth)        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      Controllers Layer              │
│  (Business Logic, Error Handling)   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│        Models Layer                 │
│  (Data Access, Database Operations) │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│       Database Layer                │
│      (PostgreSQL)                   │
└─────────────────────────────────────┘
```

### Request Flow

1. **Request**: Client sends HTTP request
2. **Middleware**: Express middleware processes request
   - CORS handling
   - Body parsing
   - Compression
   - Security headers (Helmet)
3. **Routing**: Request matched to route
4. **Validation**: Input validation (express-validator)
5. **Authentication**: JWT verification (if required)
6. **Controller**: Business logic execution
7. **Model**: Database operations
8. **Response**: JSON response sent to client

### Authentication System

#### Registration Flow
```
User Registration
    │
    ├─▶ Validate input
    │
    ├─▶ Check if username exists
    │
    ├─▶ Hash password (bcrypt)
    │
    ├─▶ Create user in database
    │
    ├─▶ Generate JWT token
    │
    └─▶ Return token + user info
```

#### Login Flow
```
User Login
    │
    ├─▶ Validate input
    │
    ├─▶ Find user by username
    │
    ├─▶ Verify password (bcrypt)
    │
    ├─▶ Generate JWT token
    │
    └─▶ Return token + user info
```

#### JWT Token
```typescript
{
  id: number,
  username: string,
  iat: number,      // Issued at
  exp: number       // Expiration
}
```

### Calculation System

#### Data Model
```typescript
interface Calculation {
  id: number;
  user_id: number;
  parent_id: number | null;
  operation_type: OperationType | null;
  operand: number;
  result: number;
  depth: number;
  created_at: Date;
}
```

#### Tree Structure
- **Root Nodes**: `parent_id = NULL`, `operation_type = NULL`
- **Child Nodes**: `parent_id` references parent, has `operation_type`
- **Recursive Traversal**: PostgreSQL recursive CTE

#### Operation Processing
```typescript
result = calculate(parent.result, operation_type, operand)

Examples:
- ADD: 10 + 5 = 15
- SUBTRACT: 10 - 5 = 5
- MULTIPLY: 10 * 5 = 50
- DIVIDE: 10 / 5 = 2
```

### Error Handling

#### Strategy
- Try-catch blocks in controllers
- Centralized error handler middleware
- Consistent error response format

#### Error Response Format
```json
{
  "error": "Error message here"
}
```

#### HTTP Status Codes
- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `404` Not Found
- `409` Conflict
- `500` Internal Server Error

## Database Architecture

### Schema Design

#### Users Table
```sql
users
├── id (PK, SERIAL)
├── username (UNIQUE, NOT NULL)
├── password_hash (NOT NULL)
└── created_at (TIMESTAMP)

Indexes:
- PRIMARY KEY (id)
- UNIQUE (username)
```

#### Calculations Table
```sql
calculations
├── id (PK, SERIAL)
├── user_id (FK → users.id, NOT NULL)
├── parent_id (FK → calculations.id, NULL)
├── operation_type (VARCHAR, NULL)
├── operand (DECIMAL, NOT NULL)
├── result (DECIMAL, NOT NULL)
├── depth (INTEGER, NOT NULL)
└── created_at (TIMESTAMP)

Indexes:
- PRIMARY KEY (id)
- INDEX (parent_id)
- INDEX (user_id)

Constraints:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (parent_id) REFERENCES calculations(id) ON DELETE CASCADE
- CHECK (operation_type IN ('add', 'subtract', 'multiply', 'divide') OR NULL)
- CHECK ((parent_id IS NULL AND operation_type IS NULL) OR
         (parent_id IS NOT NULL AND operation_type IS NOT NULL))
```

### Relationships

```
users (1) ─────── (N) calculations
                        │
calculations (1) ─────── (N) calculations
    (parent)                 (children)
```

### Query Patterns

#### Get Calculation Tree (Recursive CTE)
```sql
WITH RECURSIVE tree AS (
  -- Base case: root node
  SELECT * FROM calculations WHERE id = ?
  
  UNION ALL
  
  -- Recursive case: children
  SELECT c.* 
  FROM calculations c
  JOIN tree t ON c.parent_id = t.id
)
SELECT * FROM tree;
```

#### Get All Trees
```sql
WITH RECURSIVE tree AS (
  -- Base case: all roots
  SELECT * FROM calculations WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Recursive case: all children
  SELECT c.* 
  FROM calculations c
  JOIN tree t ON c.parent_id = t.id
)
SELECT * FROM tree ORDER BY depth, created_at;
```

### Database Connection

#### Connection Pooling
```typescript
Pool Configuration:
- max: 20 connections
- idleTimeoutMillis: 30000
- connectionTimeoutMillis: 2000
```

#### Transaction Management
- Used for operations requiring multiple queries
- ACID compliance
- Automatic rollback on error

## Infrastructure Architecture

### Docker Compose Setup

```yaml
Services:
├── db (PostgreSQL)
│   ├── Port: 5432
│   ├── Volume: postgres_data
│   └── Health Check
│
├── backend (Node.js)
│   ├── Port: 5000
│   ├── Depends on: db
│   └── Environment variables
│
└── frontend (Nginx)
    ├── Port: 3000 → 80
    ├── Depends on: backend
    └── Serves static files
```

### Network Communication

#### Development Mode
```
Browser → Frontend (Vite:3000) → Backend (Express:5000) → Database (PostgreSQL:5432)
```

#### Production Mode (Docker)
```
Browser → Nginx:80 → Backend:5000 → Database:5432
          │
          └─▶ Static files (React build)
```

### Nginx Configuration

#### Static File Serving
- React build files served from `/usr/share/nginx/html`
- SPA routing with `try_files`

#### Reverse Proxy
- `/api` proxied to backend:5000
- Headers forwarded correctly
- WebSocket upgrade support (future)

#### Caching
- Static assets cached for 1 year
- Cache-Control headers
- Gzip compression

#### Security Headers
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

## Security Architecture

### Authentication & Authorization

#### Password Security
- bcrypt hashing (10 rounds)
- Salt automatically generated
- No plain text storage

#### JWT Security
- Signed with secret key
- Expiration time (7 days default)
- Stored in localStorage (frontend)
- Sent in Authorization header

### API Security

#### CORS
- Configured allowed origins
- Credentials support
- Preflight request handling

#### Input Validation
- express-validator on all inputs
- Type checking with TypeScript
- SQL injection prevention (parameterized queries)
- XSS prevention (no HTML rendering)

#### Rate Limiting
- Ready to implement
- Can use express-rate-limit
- Per-IP or per-user limits

### Data Security

#### SQL Injection Prevention
- Parameterized queries only
- No string concatenation in queries
- pg library automatic escaping

#### Cascade Delete
- Proper foreign key constraints
- Automatic cleanup of orphaned records
- Maintains referential integrity

## Performance Considerations

### Backend Optimizations
- Connection pooling
- Database indexing
- Gzip compression
- Efficient queries (CTEs)

### Frontend Optimizations
- Code splitting (Vite)
- Lazy loading
- Memoization
- Virtual DOM (React)

### Database Optimizations
- Indexed foreign keys
- Recursive CTE for trees
- EXPLAIN ANALYZE for query tuning

### Network Optimizations
- HTTP/2 ready
- Compression enabled
- Static asset caching
- CDN ready

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- JWT tokens (no server sessions)
- Database connection pooling
- Load balancer ready

### Vertical Scaling
- Efficient database queries
- Memory-efficient code
- Proper resource cleanup

### Caching Strategy
- Redis ready architecture
- Cache calculation trees
- Cache user sessions
- Invalidation on updates

### Future Enhancements
- Read replicas for database
- Microservices architecture
- Message queue (RabbitMQ)
- Elasticsearch for search

