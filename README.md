# UPI Offline Payment System

A full-stack MERN application that simulates decentralized offline UPI-style payments using encrypted payment packets, mesh-network routing, and secure transaction settlement.

---

## Features

- Secure user authentication with bcryptjs
- Offline payment packet creation
- AES-256-CBC encrypted payment payloads
- HMAC-SHA256 signature verification
- Mesh-network routing simulation
- Secure payment settlement flow
- Double-spend prevention
- Replay attack prevention using nonces
- Transaction history tracking
- Real-time balance updates
- MongoDB Atlas integration
- Modern fintech-inspired UI

---

## Tech Stack

### Frontend
- React 18
- Vite
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Security & Cryptography
- bcryptjs
- Node.js crypto module
- AES-256-CBC encryption
- HMAC-SHA256 signatures

---

## System Architecture

```text
Frontend (React + Vite)
        ↓
Express.js API Server
        ↓
MongoDB Atlas

Payment Flow:
Sender → Encrypted Packet → Mesh Nodes → Settlement → Transaction Record
```

---

## Project Structure

```text
backend/
├── server.js
├── package.json
├── .env
├── models/
│   └── schemas.js
├── routes/
│   ├── auth.js
│   ├── payments.js
│   └── queries.js
└── utils/
    └── crypto.js

frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── pages/
│       ├── AuthPage.jsx
│       ├── Dashboard.jsx
│       └── PaymentFlow.jsx
├── package.json
└── .env
```

---

## Database Collections

### users
Stores registered users and balances.

### offlinepackets
Stores encrypted payment packets before settlement.

### meshnodes
Tracks intermediate devices forwarding encrypted packets.

### transactions
Stores successful and failed payment transactions.

---

# Installation & Setup

## 1. Clone Repository

```bash
git clone <your-repository-url>
cd upi-offline-payment-system
```

---

## 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
```

Start backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

---

## Payments

```http
POST /api/payment/create-packet
POST /api/payment/forward-packet
POST /api/payment/settle
```

---

## Queries

```http
GET /api/user/:upiId/balance
GET /api/transactions/:upiId
GET /api/mesh/stats
GET /api/health
```

---

# Payment Flow

## 1. Create Packet
The sender creates an encrypted payment packet locally.

- Payload encrypted using AES-256-CBC
- HMAC signature generated
- Packet stored with `pending` status

---

## 2. Mesh Routing
The encrypted packet travels through simulated mesh nodes.

- Intermediate nodes cannot decrypt packet data
- Hop count is tracked
- Mesh node statistics updated

---

## 3. Settlement
Backend decrypts and validates packet data.

Validation checks include:
- Signature verification
- Sender balance verification
- Replay protection
- Double-settlement prevention

---

## 4. Transfer
If validation succeeds:

- Sender balance decreases
- Receiver balance increases
- Transaction stored permanently
- Packet marked as `settled`

---

# Security Features

- AES-256-CBC encrypted payloads
- HMAC-SHA256 signature verification
- bcrypt password hashing
- Replay attack prevention using nonce
- Double-spend prevention
- Idempotent settlement handling
- Input validation on all APIs

---

# Demo Accounts

```text
john@upi / password123
jane@upi / password123
```

---

# Screenshots

Add screenshots here:

- Login Page
- Dashboard
- Payment Flow
- Successful Transaction
- MongoDB Collections

---

# Future Improvements

- JWT authentication
- Real Bluetooth/WiFi Direct mesh networking
- QR-based payments
- WebSocket real-time synchronization
- Docker deployment
- Kubernetes scaling
- End-to-end encrypted device pairing

---

# Learning Outcomes

This project demonstrates:

- Full-stack MERN development
- REST API design
- MongoDB schema modeling
- Authentication systems
- Cryptography fundamentals
- Offline-first architecture
- Distributed system concepts
- Frontend-backend integration
- Debugging complex systems

---

# License

This project is for educational and demonstration purposes.