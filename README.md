# Mini FinTech Wallet (Option B: React + Express + JSON storage)

This project implements the assignment requirements using:
- **Frontend:** React (Vite) + Hooks
- **Backend:** Node.js (Express) with **JSON-file persistence** (no MongoDB)
- **Business rules:** configurable fee (default 2%) + per-transaction limit (default 10,000)
- **API:** GET/POST/PATCH/DELETE transactions + GET users + config endpoint

## Prerequisites
- Node.js 18+

## Quick start (2 terminals)

### 1) Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:4000`

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## API (required endpoints)
- `GET /users`
- `GET /transactions`
- `POST /transactions`
- `PATCH /transactions/:id`
- `DELETE /transactions/:id` (soft delete)

Extra (useful):
- `GET /config` (fee + limit)

## Notes
- Balance is **derived** from successful transactions only:
  - credits add to balance
  - debits subtract (amount + fee)
- Transfers validate:
  - amount > 0
  - amount <= limit
  - recipient exists
  - sufficient balance
- Status flow:
  - created as `pending` then updated to `success` / `failed`



## Routing
Frontend uses **react-router-dom**:
- `/` Dashboard
- `/add` Add Money
- `/transfer` Transfer
- `/history` History
