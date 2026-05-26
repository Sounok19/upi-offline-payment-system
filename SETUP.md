# UPI Offline Payment - Setup Guide

## ⚡ Quick Start (10 minutes)

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
✅ Backend runs on http://localhost:5000

### Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend runs on http://localhost:5173

## 📁 Project Structure

```
backend/
├── server.js              # Main server (entry point)
├── package.json           # Dependencies
├── .env                   # Configuration
├── models/
│   └── schemas.js         # MongoDB schemas (User, Packet, etc.)
├── routes/
│   ├── auth.js           # Login/Register
│   ├── payments.js       # Payment operations
│   └── queries.js        # Data queries
└── utils/
    └── crypto.js         # Encryption/signatures

frontend/
├── src/
│   ├── App.jsx           # Main app
│   ├── App.css           # Global styles
│   ├── main.jsx          # React entry
│   ├── index.html        # HTML entry
│   └── pages/
│       ├── AuthPage.jsx  # Login/Register
│       ├── AuthPage.css
│       ├── Dashboard.jsx # Balance & Transactions
│       ├── Dashboard.css
│       ├── PaymentFlow.jsx # Send Money
│       └── PaymentFlow.css
├── package.json
├── .env
└── index.html
```

## 🔑 Demo Users

- UPI ID: `john@upi`, Password: `password123`
- UPI ID: `jane@upi`, Password: `password123`

Register new users via the registration page.

## 📡 API Endpoints

POST   /api/auth/register     - Register user
POST   /api/auth/login        - Login user
GET    /api/user/:upiId/balance - Get balance
POST   /api/payment/create-packet - Create payment
POST   /api/payment/forward-packet - Route through node
POST   /api/payment/settle    - Settle payment
GET    /api/transactions/:upiId - Get transactions
GET    /api/mesh/stats        - Get network stats

## 🐛 Troubleshooting

**Port already in use:**
- Backend: Kill process on port 5000
- Frontend: Kill process on port 5173

**MongoDB connection error:**
- Ensure MongoDB is running: `mongod`
- Or change MONGODB_URI in .env to MongoDB Atlas

**CORS errors:**
- Check REACT_APP_API_URL in frontend/.env
- Ensure backend is running

## 🚀 Deployment

See README.md inside each folder for deployment instructions.
