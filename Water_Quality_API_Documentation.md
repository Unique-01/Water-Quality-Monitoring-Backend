# 🌊 Water Quality Monitoring API & WebSocket Documentation

## 🔐 Authentication

### Login Endpoint

-   **URL**: `POST /api/auth/login`
-   **Body**:

```json
{
    "username": "admin",
    "password": "admin123"
}
```

#### Example:

```
POST /api/auth/login
```

#### Response

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzUyMzQ2ODAzLCJleHAiOjE3NTIzNTA0MDN9.z3a0GbaLGnesytcLmGwXLO6IVhsyL6IxQTDdy4b1fO8"
}
```

## 📥 Endpoints

All API requests require a **Bearer Token** in the `Authorization` header gotten after login.

### 1. Get Sensor Data

-   **URL**: `GET /:sensorId/data`
-   **Query Param**: `limit` (optional, default: `100`)
-   **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Example:

```
GET /api/sensors/fish_tank_1/data?limit=50
```

#### Response:

```json
[
    {
        "_id": "68724acfd0962efc34826848",
        "sensorId": "fish_tank_1",
        "pH": 7.2,
        "temperature": 25,
        "turbidity": 0.01,
        "salinity": 50,
        "waterLevel": 75,
        "blockchainHash": "0xabc123...",
        "createdAt": "2025-07-12T11:45:38.900+00:00",
        "updatedAt": "2025-07-12T11:45:38.900+00:00"
    }
]
```

---

### 2. Update/Create Sensor Thresholds

-   **URL**: `POST /:sensorId/thresholds`
-   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
-   **Body**:

```json
{
    "pHMin": 6.5,
    "pHMax": 8.5,
    "tempMin": 20,
    "tempMax": 30,
    "turbidityMax": 1.0,
    "salinityMax": 100,
    "waterLevelMin": 50
}
```

#### Example:

```
POST /api/sensors/fish_tank_1/thresholds
```

#### Response:

```json
{
    "message": "Thresholds updated successfully"
}
```

---

### 3. Get Sensor Thresholds

-   **URL**: `GET /:sensorId/thresholds`
-   **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Example:

```
GET /api/sensors/fish_tank_1/thresholds
```

#### Response:

```json
{
    "_id": "68724acfd0962efc34826848",
    "sensorId": "fish_tank_1",
    "pHMin": 6.5,
    "pHMax": 8.5,
    "tempMin": 20,
    "tempMax": 30,
    "turbidityMax": 1.0,
    "salinityMax": 100,
    "waterLevelMin": 50,
    "createdAt": "2025-07-12T11:45:38.900+00:00",
    "updatedAt": "2025-07-12T11:45:38.900+00:00"
}
```

---

## 📡 Real-Time Updates (Socket.IO)

### ✨ Overview

The backend emits water quality sensor data from multiple fish tanks in real-time using Socket.IO. Frontend clients can:

-   Receive updates for **all sensors**.
-   Optionally **join a specific sensor room** to receive targeted data only.

### 1. Connect

```js
const socket = io("http://<backend-domain>");
```

---

### 2. Receiving All Sensor Updates (Default)

Every client automatically receives all sensor data upon connection.

```js
socket.on("sensorData", (data) => {
    console.log("Received data from any sensor:", data);
});
```

#### Sample Payload:

```json
{
    "_id": "68724acfd0962efc34826848",
    "sensorId": "fish_tank_1",
    "pH": 7.2,
    "temperature": 25,
    "turbidity": 0.01,
    "salinity": 50,
    "waterLevel": 75,
    "blockchainHash": "0xabc123...",
    "createdAt": "2025-07-12T11:45:38.900+00:00",
    "updatedAt": "2025-07-12T11:45:38.900+00:00"
}
```

---

### 3. Join a Specific Sensor Room

If you only care about data from a particular tank (e.g. `fish_tank_2`):

```js
socket.emit("joinSensor", "fish_tank_2");

socket.on("sensorData", (data) => {
    console.log("Data for joined room only:", data);
});
```

You will still get the same structure of data, but only for the tank you've joined.

### 4. Listen to Alerts

```js
socket.on("alert", ({ sensorId, alerts, timestamp }) => {
    console.warn(`Alerts for ${sensorId}:`, alerts);
});
```

#### Sample Alert:

```json
{
    "sensorId": "fish_tank_1",
    "alerts": ["pH out of range: 9.1", "Temperature out of range: 32.3"],
    "timestamp": "2025-07-12T11:24:32.000Z"
}
```

---

### 5. Leave a Sensor Room

If you no longer need updates from a particular sensor:

```js
socket.emit("leaveSensor", "fish_tank_2");
```

---

### 6. Disconnection Handling

You can listen for disconnection events:

```js
socket.on("disconnect", () => {
    console.log("Disconnected from the backend");
});
```

---
