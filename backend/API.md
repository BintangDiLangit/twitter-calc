# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register

Create a new user account.

```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Login

Authenticate and receive a JWT token.

```http
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Validate Token

Check if a token is valid.

```http
GET /auth/validate
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true
}
```

### Calculations

#### Get All Trees

Retrieve all calculation trees (public).

```http
GET /calculations/trees
```

**Response:**
```json
{
  "trees": [
    {
      "id": 1,
      "user_id": 1,
      "parent_id": null,
      "operation_type": null,
      "operand": 10,
      "result": 10,
      "depth": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "username": "johndoe",
      "children": [
        {
          "id": 2,
          "user_id": 2,
          "parent_id": 1,
          "operation_type": "add",
          "operand": 5,
          "result": 15,
          "depth": 1,
          "created_at": "2024-01-01T00:01:00Z",
          "username": "janedoe",
          "children": []
        }
      ]
    }
  ]
}
```

#### Get Tree by ID

Retrieve a specific calculation tree.

```http
GET /calculations/trees/:id
```

**Response:**
```json
{
  "tree": {
    "id": 1,
    "user_id": 1,
    "parent_id": null,
    "operation_type": null,
    "operand": 10,
    "result": 10,
    "depth": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "username": "johndoe",
    "children": []
  }
}
```

#### Get All Roots

Retrieve all root calculations (starting numbers).

```http
GET /calculations/roots
```

**Response:**
```json
{
  "calculations": [
    {
      "id": 1,
      "user_id": 1,
      "parent_id": null,
      "operation_type": null,
      "operand": 10,
      "result": 10,
      "depth": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "username": "johndoe"
    }
  ]
}
```

#### Create Calculation

Create a new root calculation or add an operation to an existing one (authenticated).

**Create Root (Starting Number):**
```http
POST /calculations
Authorization: Bearer <token>
Content-Type: application/json

{
  "operand": 10
}
```

**Add Operation:**
```http
POST /calculations
Authorization: Bearer <token>
Content-Type: application/json

{
  "parent_id": 1,
  "operation_type": "add",
  "operand": 5
}
```

Valid operation types: `add`, `subtract`, `multiply`, `divide`

**Response:**
```json
{
  "message": "Calculation created successfully",
  "calculation": {
    "id": 2,
    "user_id": 1,
    "parent_id": 1,
    "operation_type": "add",
    "operand": 5,
    "result": 15,
    "depth": 1,
    "created_at": "2024-01-01T00:01:00Z",
    "username": "johndoe"
  }
}
```

#### Delete Calculation

Delete a calculation (only the owner can delete, authenticated).

```http
DELETE /calculations/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Calculation deleted successfully"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

