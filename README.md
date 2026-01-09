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

# 💳 Mini FinTech Wallet Application

A full-stack **Mini FinTech Wallet** web application that allows users to view wallet balance, manage transactions, add money, and transfer funds while applying real-world business rules such as transaction fees and limits.

This project was developed as part of a **Full-Stack Developer Assignment** to demonstrate frontend–backend integration, business logic handling, UI/UX design, and documentation skills.

---

## 📌 Assignment Objective

Build a fintech-themed wallet application that showcases:

- API integration
- State management
- Business rules (fees & limits)
- Error handling and UI states
- Clear documentation and testing

---

## 🚀 Features

### Dashboard

- Displays **current wallet balance**
- Shows **last 10 transactions**
- Loading and empty states implemented

### Add Money

- Add funds using a validated form
- Records a **credit transaction**
- Updates wallet balance after API call

### Transfer Money

- Transfer money to another user
- **2% transaction fee** applied
- **Maximum per-transaction limit: ₹10,000**
- Confirmation modal before transfer
- Records **debit + fee transactions**

### Transaction History

- View all transactions
- Filter by:
  - Date range
  - Transaction status (success / failed)
- Soft delete transactions

### Error Handling & UX

- Toasts / inline error messages
- Global loading indicators
- Clear empty states
- Input validation

---

## 🧠 Business Rules

- **Transaction Fee:** 2% of transfer amount (configurable)
- **Transaction Limit:** ₹10,000 per transaction
- **Transaction Status Flow:**
  - `pending` → `success` or `failed`
  - Failed transactions include reason

---

## 🛠 Tech Stack

### Frontend

- React (Hooks)
- React Router
- Axios / Fetch API

### Backend

- Node.js
- Express.js
- Mock API using `json-server`

### Storage

- JSON-based mock database

### Testing

- Jest
- React Testing Library

---

## 📂 Project Structure
