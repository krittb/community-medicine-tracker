# Community Medicine Tracker
**SE ZG503 — Full Stack Application Development Assignment**

A full-stack web application for managing patient appointments, prescriptions, and medicine inventory at community clinics. Built with React, Node.js/Express, and MongoDB.

---

## Features

- **4 user roles:** Patient, Doctor, Pharmacist, Admin
- **Patient:** Register, book appointments with slot selection, view queue token, view prescriptions
- **Doctor:** View daily patient queue, write prescriptions with medicines + dosage
- **Pharmacist:** Dispense prescriptions, monitor stock levels
- **Admin:** Full medicine inventory CRUD, analytics dashboard, system overview

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |

---

## Project Structure

```
community-medicine-tracker/
├── backend/          ← Express REST API
├── frontend/         ← React + Vite app
└── docs/
    ├── API_DOCUMENTATION.md
    ├── DB_SCHEMA.md
    ├── ARCHITECTURE.md
    └── AI_USAGE_LOG_AND_REFLECTION.md
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017 (or a MongoDB Atlas URI)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set your MONGO_URI and JWT_SECRET
npm run seed        # Load demo data
npm run dev         # Start on port 5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev         # Start on port 5173
```

Open **http://localhost:5173** in your browser.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password123 |
| Doctor | doctor@demo.com | password123 |
| Doctor 2 | doctor2@demo.com | password123 |
| Pharmacist | pharma@demo.com | password123 |
| Patient | patient@demo.com | password123 |

---

## API Overview

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/appointments/doctors
GET    /api/appointments/slots/:doctorId/:date
POST   /api/appointments
GET    /api/appointments/my
GET    /api/appointments/queue
PUT    /api/appointments/:id/status
DELETE /api/appointments/:id

POST   /api/prescriptions
GET    /api/prescriptions/my
GET    /api/prescriptions/pending
PUT    /api/prescriptions/:id/dispense

GET    /api/inventory
POST   /api/inventory
PUT    /api/inventory/:id
DELETE /api/inventory/:id

GET    /api/analytics/summary
GET    /api/analytics/appointments/weekly
GET    /api/analytics/medicines/top
GET    /api/analytics/stock
```

Full API docs: [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

---

## Core Workflow

1. Patient logs in → books appointment → receives queue token
2. Doctor opens queue → calls patient → clicks **Start**
3. Doctor writes prescription (medicines, dosage, duration)
4. Appointment auto-marked **completed**
5. Pharmacist sees pending Rx → reviews → clicks **Dispense**
6. Medicine stock decremented automatically; dispense log created
7. Patient views prescription history anytime

---
## Folder Summary

| Folder | Purpose |
|--------|---------|
| backend/models | Mongoose schemas for all 5 collections |
| backend/controllers | Business logic for each route group |
| backend/routes | Express routers with role-based guards |
| frontend/src/pages | One folder per role (patient/doctor/pharmacist/admin) |
| frontend/src/context | AuthContext — global user state and JWT storage |
| docs/ | API docs, DB schema, architecture, AI reflection |

---

## AI Tool Used
Claude by Anthropic — see [docs/AI_USAGE_LOG_AND_REFLECTION.md](./docs/AI_USAGE_LOG_AND_REFLECTION.md) for full log and reflection.
