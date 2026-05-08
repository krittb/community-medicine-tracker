# Database Schema — Community Medicine Tracker
**Database:** MongoDB (via Mongoose ODM)

---

## Collection: `users`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| _id | ObjectId | Auto | Primary key |
| name | String | Yes | Max 100 chars |
| email | String | Yes | Unique, lowercase |
| password | String | Yes | bcrypt hashed, min 6 chars |
| role | String | Yes | enum: patient, doctor, pharmacist, admin |
| phone | String | No | |
| age | Number | No | Min 0 |
| gender | String | No | enum: male, female, other |
| specialization | String | No | Doctors only |
| isActive | Boolean | Yes | Default true |
| createdAt | Date | Auto | |
| updatedAt | Date | Auto | |

---

## Collection: `appointments`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| _id | ObjectId | Auto | |
| patient | ObjectId | Yes | Ref: users |
| doctor | ObjectId | Yes | Ref: users |
| date | String | Yes | Format: YYYY-MM-DD |
| timeSlot | String | Yes | e.g. "10:00 AM" |
| tokenNumber | Number | Auto | Auto-incremented per doctor per date |
| status | String | Yes | enum: scheduled, in-consultation, completed, cancelled |
| symptoms | String | No | Patient's reported symptoms |
| notes | String | No | Doctor's notes after consultation |
| createdAt | Date | Auto | |

**Index:** `{ doctor, date }` for queue queries

---

## Collection: `prescriptions`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| _id | ObjectId | Auto | |
| appointment | ObjectId | Yes | Ref: appointments |
| patient | ObjectId | Yes | Ref: users |
| doctor | ObjectId | Yes | Ref: users |
| medicines | Array | Yes | See sub-schema below |
| diagnosis | String | No | |
| instructions | String | No | |
| dispensed | Boolean | Yes | Default false |
| dispensedAt | Date | No | Set on dispense |
| dispensedBy | ObjectId | No | Ref: users (pharmacist) |
| createdAt | Date | Auto | |

**medicines sub-document:**
| Field | Type | Notes |
|-------|------|-------|
| medicine | ObjectId | Ref: medicines |
| medicineName | String | Denormalized for display |
| dosage | String | e.g. "1 tablet twice daily" |
| duration | String | e.g. "5 days" |
| quantity | Number | Units to dispense |

---

## Collection: `medicines`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| _id | ObjectId | Auto | |
| name | String | Yes | Unique |
| category | String | Yes | enum: antibiotic, analgesic, antiviral, antifungal, antacid, antihistamine, vitamin, supplement, other |
| description | String | No | |
| quantity | Number | Yes | Current stock |
| unit | String | No | Default "tablets" |
| threshold | Number | No | Default 10; triggers low-stock alert |
| expiryDate | Date | No | |
| manufacturer | String | No | |
| price | Number | No | In INR |
| isActive | Boolean | Yes | Default true (soft delete) |
| isLowStock | Virtual | — | quantity <= threshold |

---

## Collection: `dispenselogs`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| _id | ObjectId | Auto | |
| prescription | ObjectId | Yes | Ref: prescriptions |
| patient | ObjectId | Yes | Ref: users |
| pharmacist | ObjectId | Yes | Ref: users |
| medicines | Array | Yes | { medicine, medicineName, quantityDispensed } |
| dispensedAt | Date | Yes | Default now |
| remarks | String | No | |

---

## Relationships Diagram (text)
```
users (patient) ──< appointments >── users (doctor)
appointments ──< prescriptions >── users (doctor)
prescriptions >── dispenselogs >── users (pharmacist)
medicines ──< prescription.medicines[]
medicines ──< dispenselogs.medicines[]
```
