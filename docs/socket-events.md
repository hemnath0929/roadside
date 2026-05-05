# Socket Events Reference

Server URL: `ws://localhost:5000`

All events use Socket.IO. Import constants from `socket/socketEvents.js`.

---

## Client → Server Events

### `join-request-room`
Join the tracking room for a specific request.
```json
{
  "requestId": "REQ_001",
  "userId": "USER_123",
  "role": "user"
}
```
- `role` must be `"user"` or `"mechanic"`
- Server responds with `room-joined` on success

---

### `leave-request-room`
Explicitly leave a tracking room.
```json
{ "requestId": "REQ_001" }
```

---

### `mechanic-location-update`
Mechanic sends GPS location (every ~3 seconds).
```json
{
  "requestId": "REQ_001",
  "mechanicId": "MECH_456",
  "lat": 10.9988,
  "lng": 76.9587,
  "heading": 120,
  "speed": 28,
  "updatedAt": 1714900000000
}
```
- `lat` must be in range `[-90, 90]`
- `lng` must be in range `[-180, 180]`
- Broadcasts `mechanic-location-live` to all room members

---

### `request-status-update`
Broadcast a status change to the room.
```json
{
  "requestId": "REQ_001",
  "status": "on_the_way"
}
```

---

### `mechanic-arrived`
Signal that the mechanic has physically arrived.
```json
{
  "requestId": "REQ_001",
  "mechanicId": "MECH_456"
}
```

---

### `service-completed`
Signal that the service has been completed.
```json
{
  "requestId": "REQ_001",
  "mechanicId": "MECH_456",
  "summary": "Flat tyre repaired successfully."
}
```
- Also clears mechanic's location from the in-memory store

---

## Server → Client Events

### `mechanic-location-live`
Broadcast to all room members when mechanic position updates.
```json
{
  "requestId": "REQ_001",
  "mechanicId": "MECH_456",
  "lat": 10.9988,
  "lng": 76.9587,
  "heading": 120,
  "speed": 28,
  "updatedAt": 1714900000000
}
```

---

### `request-status-live`
Broadcast when the request status changes.
```json
{
  "requestId": "REQ_001",
  "status": "on_the_way",
  "updatedAt": 1714900000000
}
```

---

### `mechanic-arrived-live`
Notify room that mechanic has arrived.
```json
{
  "requestId": "REQ_001",
  "mechanicId": "MECH_456",
  "message": "Mechanic has arrived at your location.",
  "arrivedAt": 1714900000000
}
```

---

### `service-completed-live`
Notify room that service is complete.
```json
{
  "requestId": "REQ_001",
  "mechanicId": "MECH_456",
  "summary": "Flat tyre repaired successfully.",
  "completedAt": 1714900000000
}
```

---

### `tracking-error`
Sent to the offending socket when validation fails.
```json
{
  "code": "INVALID_COORDINATES",
  "message": "lat must be [-90, 90] and lng must be [-180, 180].",
  "timestamp": 1714900000000
}
```

#### Error Codes
| Code | Cause |
|------|-------|
| `INVALID_REQUEST_ID` | requestId missing or not a string |
| `INVALID_USER_ID` | userId missing |
| `INVALID_ROLE` | role is not "user" or "mechanic" |
| `INVALID_MECHANIC_ID` | mechanicId missing |
| `INVALID_COORDINATES` | lat/lng out of range or not numbers |
| `INVALID_STATUS` | status is not a valid string |

---

## Room Model

- Each request gets its own Socket.IO room named by `requestId`
- `socket.join(requestId)` on `join-request-room`
- Latest mechanic location stored in memory via `locationStore.js`
- All members removed from room registry on disconnect

---

## Testing

Open `socket/testClient.html` in a browser (no server needed for the HTML).
It provides a full UI to test all events.
