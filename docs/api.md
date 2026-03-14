# InfraLink API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

Interactive Swagger UI: `http://localhost:5000/api-docs`

---

## Modules

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/auth` | Registration, login, token refresh, KYC |
| Users | `/users` | User profile management |
| Workers | `/workers` | Worker profiles & portfolio |
| Jobs | `/jobs` | Job posting & management |
| Applications | `/applications` | Job applications |
| Matching | `/matching` | AI-powered worker-job matching |
| Messaging | `/messages` | Real-time chat |
| Notifications | `/notifications` | In-app notifications |
| Reviews | `/reviews` | Ratings & reviews |
| Marketplace | `/marketplace` | Materials listing |
| Equipment | `/equipment` | Equipment rental |
| Projects | `/projects` | Project tracking |
| Payments | `/payments` | Payment processing |
| Search | `/search` | Global search |
| Health | `/health` | Health checks |

---

## Authentication

All protected routes require a Bearer token:

```
Authorization: Bearer <access_token>
```

---

## Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": []
  }
}
```

---

## Pagination

Paginated endpoints accept:

| Query Param | Default | Description |
|-------------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 20 | Items per page |
| `sort` | `-createdAt` | Sort field |

Response includes:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```
