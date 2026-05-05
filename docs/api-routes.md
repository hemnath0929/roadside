# API Routes Reference

Base URL: `http://localhost:5000/api`

---

## Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/register/user` | ❌ | — | Register a new user |
| POST | `/auth/login/user` | ❌ | — | Login as user → returns JWT |
| POST | `/auth/register/mechanic` | ❌ | — | Register mechanic (pending approval) |
| POST | `/auth/login/mechanic` | ❌ | — | Login as mechanic → returns JWT |
| GET | `/auth/me` | ✅ | any | Get current authenticated account |

### Register User — Body
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "phone": "9876543210",
  "password": "secret123"
}
```

### Login Response
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "_id": "...", "name": "...", "role": "user" }
}
```

---

## User Routes — `/api/user`  *(JWT required, role: user)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/profile` | Get own profile |
| PATCH | `/user/profile` | Update name / phone / photo |

---

## Mechanic Routes — `/api/mechanic`  *(JWT required, role: mechanic)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/mechanic/profile` | Get own profile |
| PATCH | `/mechanic/profile` | Update profile fields |
| PATCH | `/mechanic/availability` | Toggle `isAvailable` |
| GET | `/mechanic/jobs` | Paginated job history |

### Toggle Availability — Body
```json
{ "isAvailable": true }
```

---

## Service Request Routes — `/api/requests`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/requests` | ✅ | user | Create a new service request |
| GET | `/requests/my` | ✅ | user | User's own requests (paginated) |
| GET | `/requests/pending` | ✅ | mechanic | All pending requests (geo-filtered) |
| GET | `/requests/:id` | ✅ | any | Get single request |
| PATCH | `/requests/:id/accept` | ✅ | mechanic | Mechanic accepts a request |
| PATCH | `/requests/:id/status` | ✅ | mechanic | Update request status |
| PATCH | `/requests/:id/cancel` | ✅ | user | Cancel own request |
| POST | `/requests/:id/rate` | ✅ | user | Rate completed request |

### Create Request — Body
```json
{
  "serviceType": "flat_tyre",
  "description": "Front left tyre punctured",
  "lat": 10.9988,
  "lng": 76.9587,
  "address": "NH 544, Coimbatore"
}
```

### Service Types
`flat_tyre` | `battery_jump` | `fuel_delivery` | `towing` | `lockout` | `engine_trouble` | `accident_support` | `other`

### Status Flow
```
pending → accepted → on_the_way → nearby → arrived → in_progress → completed
       ↘ cancelled (at any active stage)
```

### Update Status — Body
```json
{ "status": "on_the_way" }
```

### Rate Request — Body
```json
{ "score": 5, "comment": "Great service, very prompt!" }
```

---

## Health Check

```
GET /health
```
```json
{ "success": true, "service": "Roadside Assistance API", "status": "running" }
```

---

## Error Response Format

All errors follow this structure:
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

| Code | Meaning |
|------|---------|
| 400 | Bad request / invalid input |
| 401 | Not authenticated |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, wrong state) |
| 422 | Validation error |
| 500 | Internal server error |
