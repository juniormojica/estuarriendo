/**
 * API Endpoints Documentation for Container Architecture
 * 
 * This document describes all available endpoints for managing containers and units
 */

## Container Endpoints

### 1. Create Container
**POST** `/api/containers`
**Auth:** Required
**Description:** Create a new container (pension, apartment, aparta-estudio)

**Request Body:**
```json
{
    "typeId": 3,
    "locationId": 1,
    "title": "Pensión Universitaria Central",
    "description": "Pensión cerca de universidades",
    "monthlyRent": 0,
    "currency": "COP",
    "status": "pending",
    "rentalMode": "by_unit",
    "requiresDeposit": true,
    "minimumContractMonths": 6,
    "services": [
        {
            "serviceType": "breakfast",
            "isIncluded": true,
            "additionalCost": 0,
            "description": "Desayuno incluido"
        }
    ],
    "rules": [
        {
            "ruleType": "curfew",
            "isAllowed": true,
            "value": "23:00",
            "description": "Hora límite 11pm"
        }
    ],
    "commonAreaIds": [1, 2, 3]
}
```

**Response:**
```json
{
    "success": true,
    "message": "Container created successfully",
    "data": {
        "id": 1,
        "title": "Pensión Universitaria Central",
        "isContainer": true,
        "rentalMode": "by_unit",
        "totalUnits": 0,
        "availableUnits": 0
    }
}
```

---

### 2. Get Container
**GET** `/api/containers/:id`
**Auth:** Not required
**Description:** Get container with all units and associations

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "Pensión Universitaria Central",
        "isContainer": true,
        "rentalMode": "by_unit",
        "totalUnits": 3,
        "availableUnits": 2,
        "units": [...],
        "services": [...],
        "rules": [...],
        "commonAreas": [...],
        "location": {...},
        "contact": {...}
    }
}
```

---

### 3. Update Container
**PUT** `/api/containers/:id`
**Auth:** Required (Owner or Admin)
**Description:** Update container information

**Request Body:**
```json
{
    "title": "Pensión Universitaria Central - Actualizada",
    "description": "Nueva descripción",
    "services": [...],
    "rules": [...],
    "commonAreaIds": [1, 2, 3, 4]
}
```

---

### 4. Delete Container
**DELETE** `/api/containers/:id`
**Auth:** Required (Owner or Admin)
**Description:** Delete container and all its units

**Response:**
```json
{
    "success": true,
    "message": "Container deleted successfully"
}
```

---

### 5. Rent Complete Container
**POST** `/api/containers/:id/rent-complete`
**Auth:** Required
**Description:** Rent entire container (all units marked as rented)

**Response:**
```json
{
    "success": true,
    "message": "Container rented completely",
    "data": {
        "id": 1,
        "rentalMode": "complete",
        "availableUnits": 0
    }
}
```

---

### 6. Change Rental Mode
**POST** `/api/containers/:id/change-mode`
**Auth:** Required
**Description:** Change rental mode from complete to by_unit

**Request Body:**
```json
{
    "mode": "by_unit"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Rental mode changed to by_unit",
    "data": {
        "id": 1,
        "rentalMode": "by_unit",
        "availableUnits": 3
    }
}
```

---

### 7. Create Unit in Container
**POST** `/api/containers/:containerId/units`
**Auth:** Required
**Description:** Add a new unit (room) to a container

**Request Body:**
```json
{
    "title": "Habitación 1 - Con baño privado",
    "description": "Habitación individual con baño",
    "monthlyRent": 800000,
    "deposit": 800000,
    "currency": "COP",
    "area": 15,
    "roomType": "individual",
    "bedsInRoom": 1,
    "status": "pending"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Unit created successfully",
    "data": {
        "id": 10,
        "parentId": 1,
        "title": "Habitación 1 - Con baño privado",
        "roomType": "individual",
        "bedsInRoom": 1,
        "monthlyRent": "800000"
    }
}
```

---

### 8. Get Container Units
**GET** `/api/containers/:containerId/units`
**Auth:** Not required
**Description:** Get all units of a specific container

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 10,
            "parentId": 1,
            "title": "Habitación 1",
            "roomType": "individual",
            "bedsInRoom": 1,
            "monthlyRent": "800000",
            "isRented": false,
            "images": [...],
            "amenities": [...]
        },
        {
            "id": 11,
            "parentId": 1,
            "title": "Habitación 2",
            "roomType": "shared",
            "bedsInRoom": 2,
            "monthlyRent": "550000",
            "isRented": false,
            "images": [...],
            "amenities": [...]
        }
    ]
}
```

---

## Unit Endpoints

### 9. Update Unit
**PUT** `/api/units/:id`
**Auth:** Required
**Description:** Update unit information

**Request Body:**
```json
{
    "title": "Habitación 1 - Actualizada",
    "monthlyRent": 850000,
    "description": "Nueva descripción"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Unit updated successfully",
    "data": {
        "id": 10,
        "title": "Habitación 1 - Actualizada",
        "monthlyRent": "850000"
    }
}
```

---

### 10. Delete Unit
**DELETE** `/api/units/:id`
**Auth:** Required
**Description:** Delete a unit and update container counters

**Response:**
```json
{
    "success": true,
    "message": "Unit deleted successfully"
}
```

---

### 11. Update Unit Rental Status
**PATCH** `/api/units/:id/rental-status`
**Auth:** Required
**Description:** Update rental status of a unit

**Request Body:**
```json
{
    "isRented": true
}
```

**Response:**
```json
{
    "success": true,
    "message": "Unit rental status updated",
    "data": {
        "id": 10,
        "isRented": true
    }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "success": false,
    "message": "Error message describing what went wrong"
}
```

### 401 Unauthorized
```json
{
    "success": false,
    "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
    "success": false,
    "message": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
    "success": false,
    "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "message": "Error message",
    "error": "Detailed error (only in development)"
}
```

---

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Testing with cURL

### Create Container
```bash
curl -X POST http://localhost:3000/api/containers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "typeId": 3,
    "locationId": 1,
    "title": "Test Pension",
    "rentalMode": "by_unit",
    "services": [],
    "rules": [],
    "commonAreaIds": [1, 2, 3]
  }'
```

### Get Container
```bash
curl http://localhost:3000/api/containers/1
```

### Create Unit
```bash
curl -X POST http://localhost:3000/api/containers/1/units \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Habitación 1",
    "monthlyRent": 800000,
    "roomType": "individual",
    "bedsInRoom": 1
  }'
```

### Update Unit Rental Status
```bash
curl -X PATCH http://localhost:3000/api/units/10/rental-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"isRented": true}'
```
