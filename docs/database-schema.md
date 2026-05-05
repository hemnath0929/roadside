# Database Schema Reference

Database: MongoDB (local)
ODM: Mongoose 8
Connection: `mongodb://127.0.0.1:27017/roadside_db`

---

## Collection: `users`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | MongoDB auto-generated |
| `name` | String | ✅ | Max 80 chars |
| `email` | String | ✅ | Unique, lowercase |
| `phone` | String | ✅ | 10–15 digits |
| `password` | String | ✅ | bcrypt hash, hidden in queries |
| `role` | String | — | `"user"` or `"admin"`, default `"user"` |
| `profilePhoto` | String | — | URL string |
| `location` | GeoJSON Point | — | `[lng, lat]`, 2dsphere indexed |
| `isActive` | Boolean | — | Default `true` |
| `createdAt` | Date | auto | Mongoose timestamps |
| `updatedAt` | Date | auto | Mongoose timestamps |

---

## Collection: `mechanics`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | — |
| `name` | String | ✅ | Max 80 chars |
| `email` | String | ✅ | Unique, lowercase |
| `phone` | String | ✅ | 10–15 digits |
| `password` | String | ✅ | bcrypt hash, hidden in queries |
| `role` | String | — | Always `"mechanic"`, immutable |
| `profilePhoto` | String | — | URL string |
| `specializations` | [String] | — | e.g. `["flat_tyre","towing"]` |
| `rating.average` | Number | — | 0–5, updated on rating |
| `rating.count` | Number | — | Total ratings received |
| `isAvailable` | Boolean | — | Default `true`, `false` when on a job |
| `isApproved` | Boolean | — | Default `false`, admin must approve |
| `isActive` | Boolean | — | Default `true` |
| `currentLocation` | GeoJSON Point | — | `[lng, lat]`, 2dsphere indexed |
| `vehicleDetails.type` | String | — | e.g. `"Bike"`, `"Van"` |
| `vehicleDetails.plateNumber` | String | — | e.g. `"TN 32 AB 1234"` |
| `activeRequestId` | ObjectId ref | — | Links to active `ServiceRequest` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

---

## Collection: `servicerequests`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | — |
| `user` | ObjectId ref | ✅ | References `users` |
| `mechanic` | ObjectId ref | — | References `mechanics`, null until accepted |
| `serviceType` | String | ✅ | See types below |
| `description` | String | — | Max 500 chars |
| `userLocation.coordinates` | [Number] | ✅ | `[lng, lat]`, 2dsphere indexed |
| `userLocation.address` | String | — | Human-readable address |
| `status` | String | — | See status flow below |
| `statusHistory` | Array | — | Auto-appended on every status change |
| `estimatedCost` | Number | — | Optional |
| `finalCost` | Number | — | Optional, filled after completion |
| `acceptedAt` | Date | — | Set when mechanic accepts |
| `arrivedAt` | Date | — | Set when mechanic arrives |
| `completedAt` | Date | — | Set when service completes |
| `cancelledAt` | Date | — | Set when cancelled |
| `cancellationReason` | String | — | — |
| `rating.score` | Number | — | 1–5 |
| `rating.comment` | String | — | — |
| `rating.givenAt` | Date | — | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

### Service Types
```
flat_tyre | battery_jump | fuel_delivery | towing
lockout   | engine_trouble | accident_support | other
```

### Status Flow
```
pending → accepted → on_the_way → nearby → arrived → in_progress → completed
        ↘ cancelled (from any active state)
```

### Indexes
| Index | Purpose |
|-------|---------|
| `userLocation` 2dsphere | Geo-proximity queries |
| `status` | Filter by status |
| `user + status` | User's requests by status |
| `mechanic + status` | Mechanic's jobs by status |

---

## Relationships

```
User (1) ──────────── (many) ServiceRequest
Mechanic (1) ────────── (many) ServiceRequest
ServiceRequest (many) ── (1) User
ServiceRequest (many) ── (0..1) Mechanic
```
