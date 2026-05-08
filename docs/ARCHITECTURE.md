# Architecture & Component Hierarchy
## Community Medicine Tracker

---

## System Architecture

```
┌─────────────────────────────────────────────┐
│           React Frontend (Vite)              │
│   Port 5173 — served separately             │
│   Communicates via HTTP + Axios              │
└──────────────────┬──────────────────────────┘
                   │ REST API (JSON)
                   ▼
┌─────────────────────────────────────────────┐
│         Node.js + Express Backend            │
│   Port 5000                                 │
│   JWT Auth Middleware                        │
│   Rate Limiter (100 req/15min)              │
│                                             │
│  Routes:                                    │
│  /api/auth          → auth.routes.js        │
│  /api/appointments  → appointment.routes.js │
│  /api/prescriptions → prescription.routes.js│
│  /api/inventory     → inventory.routes.js   │
│  /api/analytics     → analytics.routes.js   │
└──────────────────┬──────────────────────────┘
                   │ Mongoose ODM
                   ▼
┌─────────────────────────────────────────────┐
│              MongoDB Database                │
│   Collections:                              │
│   users, appointments, prescriptions        │
│   medicines, dispenselogs                   │
└─────────────────────────────────────────────┘
```

---

## Backend File Structure

```
backend/
├── server.js               ← Express app, middleware setup, route mounting
├── config/
│   └── db.js               ← Mongoose connect()
├── middleware/
│   ├── auth.js             ← verifyToken, authorizeRole()
│   └── errorHandler.js     ← Centralised error formatting
├── models/
│   ├── User.js             ← Schema + bcrypt pre-save hook
│   ├── Appointment.js      ← Auto token-number pre-save hook
│   ├── Prescription.js     ← Embedded medicines sub-schema
│   ├── Medicine.js         ← isLowStock virtual field
│   └── DispenseLog.js      ← Audit trail for dispensing
├── controllers/
│   ├── auth.controller.js
│   ├── appointment.controller.js
│   ├── prescription.controller.js
│   ├── inventory.controller.js
│   └── analytics.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── appointment.routes.js
│   ├── prescription.routes.js
│   ├── inventory.routes.js
│   └── analytics.routes.js
└── seed.js                 ← Demo data seeder
```

---

## Frontend Component Hierarchy

```
main.jsx
└── App.jsx  [AuthProvider, BrowserRouter]
    ├── Navbar.jsx              ← role-aware nav links
    └── Routes
        ├── /login              → Login.jsx
        ├── /register           → Register.jsx
        │
        ├── /patient            → PatientDashboard.jsx
        ├── /patient/book       → BookAppointment.jsx
        ├── /patient/appointments → MyAppointments.jsx
        └── /patient/prescriptions → MyPrescriptions.jsx
        │
        ├── /doctor             → DoctorDashboard.jsx
        └── /doctor/queue       → DoctorQueue.jsx
        │                           └── [Modal] WritePrescription (inline)
        │
        ├── /pharmacist         → PharmacistDashboard.jsx
        ├── /pharmacist/dispense → DispenseView.jsx
        └── /pharmacist/stock   → StockView.jsx
        │
        ├── /admin              → AdminDashboard.jsx
        ├── /admin/inventory    → InventoryManager.jsx
        └── /admin/analytics    → Analytics.jsx
```

---

## Role-Based Access Control

| Feature | Patient | Doctor | Pharmacist | Admin |
|---------|---------|--------|------------|-------|
| Book appointment | ✅ | ❌ | ❌ | ❌ |
| View own appointments | ✅ | ❌ | ❌ | ❌ |
| View patient queue | ❌ | ✅ | ❌ | ❌ |
| Write prescription | ❌ | ✅ | ❌ | ❌ |
| Dispense medicines | ❌ | ❌ | ✅ | ✅ |
| View stock | ❌ | ❌ | ✅ | ✅ |
| Add/edit medicines | ❌ | ❌ | ❌ | ✅ |
| View analytics | ❌ | ✅ | ✅ | ✅ |

---

## Core Workflow

```
1. Patient registers → logs in → books appointment with available slot
2. Appointment gets auto-assigned a token number
3. Doctor sees queue for today → clicks "Start" → status: in-consultation
4. Doctor writes prescription (medicines + dosage) → status: completed
5. Pharmacist sees pending Rx → reviews → clicks Dispense
6. Stock quantity auto-decremented → DispenseLog created
7. Patient can view their prescription history anytime
```

---

## Technology Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Auth | JWT (stateless) | Simple, scalable, no session store needed |
| DB | MongoDB | Flexible schema, good for evolving medical data |
| Password | bcryptjs | Industry standard, salted hashing |
| API style | REST | Simpler to test, widely understood |
| Frontend state | React Context | Lightweight; no Redux overhead for this scale |
| Validation | express-validator | Declarative, integrates cleanly with Express |
| Rate limiting | express-rate-limit | Prevents brute-force on auth endpoints |

---

## Assumptions

1. Clinic operates in a single timezone; dates stored as YYYY-MM-DD strings
2. Token numbers reset per doctor per day
3. Slot availability is based on a fixed 13-slot template per doctor per day
4. Medicine stock deduction happens atomically on dispense (no partial dispense)
5. Soft delete used for medicines (isActive: false) to preserve prescription history
6. No real payment integration — price field is informational only
