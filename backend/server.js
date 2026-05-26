// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== DATABASE CONNECTION =====
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/upi-offline',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// ===== ROUTES =====
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const queryRoutes = require('./routes/queries');

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', queryRoutes);

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server running',
    timestamp: new Date()
  });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         🚀 UPI OFFLINE PAYMENT SERVER RUNNING                 ║
║                                                                ║
║         Server:  http://localhost:${PORT}                        ║
║         DB:      ${process.env.MONGODB_URI || 'mongodb://localhost:27017/upi-offline'}
║                                                                ║
║         Available Endpoints:                                  ║
║         - POST   /api/auth/register                           ║
║         - POST   /api/auth/login                              ║
║         - GET    /api/user/:upiId/balance                     ║
║         - POST   /api/payment/create-packet                   ║
║         - POST   /api/payment/forward-packet                  ║
║         - POST   /api/payment/settle                          ║
║         - GET    /api/transactions/:upiId                     ║
║         - GET    /api/mesh/stats                              ║
║         - GET    /api/health                                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

/*
SERVER ARCHITECTURE:

MIDDLEWARE STACK:
1. CORS - Allow frontend to call backend
2. Express.json() - Parse JSON request bodies

DATABASE:
- MongoDB via Mongoose
- 4 collections: Users, OfflinePackets, MeshNodes, Transactions
- Auto-connects on startup

ROUTE ORGANIZATION:
/api/auth/*        → Authentication (login, register)
/api/payment/*     → Payment operations
/api/*             → User queries and stats

ERROR HANDLING:
- Try-catch in all route handlers
- Proper HTTP status codes
- Consistent error response format

STARTUP SEQUENCE:
1. Load environment variables
2. Create Express app
3. Connect to MongoDB
4. Mount route handlers
5. Start server on specified port
6. Display banner with endpoints

PROJECT STRUCTURE:
upi-offline-complete/
├── backend/
│   ├── server.js (this file - entry point)
│   ├── package.json (dependencies)
│   ├── .env (configuration)
│   ├── models/
│   │   └── schemas.js (MongoDB schemas)
│   ├── routes/
│   │   ├── auth.js (login/register)
│   │   ├── payments.js (payment operations)
│   │   └── queries.js (data retrieval)
│   └── utils/
│       └── crypto.js (encryption/signatures)
└── frontend/ (React app)
*/
