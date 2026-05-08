# Community Medicine Tracker — API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

## Auth Routes `/api/auth`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/register` | No | Any | Register new user |
| POST | `/auth/login` | No | Any | Login, get JWT |
| GET | `/auth/me` | Yes | Any | Get current user profile |
| PUT | `/auth/profile` | Yes | Any | Update profile |

### POST `/auth/register`
```json
Request:
{ "name": "Rahul Kumar", "email": "rahul@example.com", "password": "password123",
  "role": "patient", "phone": "9876543210", "age": 30, "gender": "male" }

Response 201:
{ "success": true, "token": "eyJ...", "user": { "id": "...", "name": "Rahul Kumar", "role": "patient" } }
```

### POST `/auth/login`
```json
Request: { "email": "rahul@example.com", "password": "password123" }
Response 200: { "success": true, "token": "eyJ...", "user": { "id": "...", "role": "patient" } }
```

---

## Appointment Routes `/api/appointments`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/appointments/doctors` | Yes | Any | List all active doctors |
| GET | `/appointments/slots/:doctorId/:date` | Yes | Any | Get available slots |
| POST | `/appointments` | Yes | patient | Book an appointment |
| GET | `/appointments/my` | Yes | patient | Get own appointments |
| GET | `/appointments/queue?date=YYYY-MM-DD` | Yes | doctor | Get doctor's queue |
| PUT | `/appointments/:id/status` | Yes | doctor | Update appointment status |
| DELETE | `/appointments/:id` | Yes | patient | Cancel appointment |

### POST `/appointments`
```json
Request:
{ "doctorId": "64abc...", "date": "2026-05-10", "timeSlot": "10:00 AM", "symptoms": "Fever and cold" }

Response 201:
{ "success": true, "appointment": { "_id": "...", "tokenNumber": 3, "status": "scheduled", ... } }
```

### PUT `/appointments/:id/status`
```json
Request: { "status": "in-consultation", "notes": "Patient seems anxious" }
Response: { "success": true, "appointment": { "status": "in-consultation", ... } }
```

---

## Prescription Routes `/api/prescriptions`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/prescriptions` | Yes | doctor | Create prescription |
| GET | `/prescriptions/my` | Yes | patient | Patient's own prescriptions |
| GET | `/prescriptions/pending` | Yes | pharmacist, admin | Undispensed prescriptions |
| GET | `/prescriptions/patient/:patientId` | Yes | doctor | Patient history |
| GET | `/prescriptions/:id` | Yes | Any | Get single prescription |
| PUT | `/prescriptions/:id/dispense` | Yes | pharmacist, admin | Dispense prescription |

### POST `/prescriptions`
```json
Request:
{
  "appointmentId": "64abc...",
  "diagnosis": "Acute pharyngitis",
  "instructions": "Take with food, rest well",
  "medicines": [
    { "medicine": "64med...", "dosage": "1 tablet twice daily", "duration": "5 days", "quantity": 10 }
  ]
}
Response 201: { "success": true, "prescription": { "_id": "...", "dispensed": false, ... } }
```

### PUT `/prescriptions/:id/dispense`
```json
Request: { "remarks": "Dispensed all items" }
Response: { "success": true, "message": "Prescription dispensed successfully", ... }
```

---

## Inventory Routes `/api/inventory`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/inventory` | Yes | Any | List medicines (supports ?search=, ?category=, ?lowStock=true) |
| GET | `/inventory/:id` | Yes | Any | Get single medicine |
| POST | `/inventory` | Yes | admin | Add medicine |
| PUT | `/inventory/:id` | Yes | admin, pharmacist | Update medicine |
| DELETE | `/inventory/:id` | Yes | admin | Deactivate medicine |

### POST `/inventory`
```json
Request:
{ "name": "Paracetamol 500mg", "category": "analgesic", "quantity": 500,
  "unit": "tablets", "threshold": 50, "manufacturer": "Sun Pharma", "price": 2 }

Response 201: { "success": true, "medicine": { "_id": "...", "isLowStock": false, ... } }
```

---

## Analytics Routes `/api/analytics`

All analytics routes require `admin`, `doctor`, or `pharmacist` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary` | System-wide counts |
| GET | `/analytics/appointments/weekly` | Last 7 days appointment counts |
| GET | `/analytics/medicines/top` | Top 10 most prescribed medicines |
| GET | `/analytics/stock` | Stock grouped by critical / low / adequate |

### GET `/analytics/summary` Response
```json
{
  "success": true,
  "summary": {
    "totalPatients": 42, "totalDoctors": 5, "todayAppointments": 12,
    "totalMedicines": 48, "lowStockMedicines": 3, "pendingPrescriptions": 7
  }
}
```

---

## Error Responses

All errors follow this format:
```json
{ "success": false, "message": "Description of what went wrong" }
```

| Code | Meaning |
|------|---------|
| 400 | Validation error / bad request |
| 401 | Missing or invalid JWT |
| 403 | Insufficient role permissions |
| 404 | Resource not found |
| 500 | Internal server error |

---
## Notes
- All dates use ISO format: `YYYY-MM-DD`
- All responses include a `success: true/false` field
- Token expiry is set to 7 days by default (configurable via JWT_EXPIRE in .env)
