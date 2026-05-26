# ⚡ Quick Start - 5 Minutes

## Prerequisites
- Node.js 16+ installed
- MongoDB running locally (or MongoDB Atlas connection string)

## Step 1: Start MongoDB (Skip if using Atlas)
```bash
# macOS: 
brew services start mongodb-community

# Ubuntu:
sudo service mongodb start

# Or just run:
mongod
```

## Step 2: Start Backend
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 UPI OFFLINE PAYMENT SERVER RUNNING
Server: http://localhost:5000
```

## Step 3: Start Frontend (New Terminal Window)
```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  VITE v4.x.x ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## Step 4: Open Browser
Go to: `http://localhost:5173/`

You should see the **OfflineUPI** login page!

## Step 5: Test

### Create First User
1. Click "Register here"
2. Fill in:
   - UPI ID: `john@upi`
   - Name: `John Doe`
   - Phone: `9999999999`
   - Password: `password123`
   - Confirm: `password123`
3. Click "Register"
4. Click "Login here"
5. Login with `john@upi` / `password123`

You should see the **Dashboard** with ₹10,000 balance!

### Create Second User
1. Click "Logout"
2. Click "Register here"
3. Fill in:
   - UPI ID: `jane@upi`
   - Name: `Jane Smith`
   - Phone: `9888888888`
   - Password: `password123`
4. Click "Register"

### Send Money
1. Login as `john@upi`
2. Click "Send Money"
3. Enter:
   - Receiver: `jane@upi`
   - Amount: `500`
4. Click "Continue"
5. Review and click "Send Payment →"
6. Watch the animation!
7. See "Payment Successful"
8. Click "Back to Dashboard"

You should see:
- Your balance: ₹9,500 (reduced by 500)
- Transaction history showing "-500 → jane@upi"
- Network stats updated

### Verify Receiver
1. Click "Logout"
2. Login as `jane@upi`
3. See balance: ₹10,500 (increased by 500)
4. See transaction: "+500 ← john@upi"

## 🎉 Success!

Your UPI offline payment app is working! 

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB is running
- Or use MongoDB Atlas connection string in backend/.env

### "API not working"
- Check backend is running (should see "✅ MongoDB connected")
- Check frontend .env has correct API URL

### "Port already in use"
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)  
lsof -ti:5173 | xargs kill -9
```

### Page is blank/white
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check if http://localhost:5173 is loading
4. Hard refresh (Ctrl+Shift+R)

## 📚 Project Structure

```
backend/
├── server.js                    # Main server entry
├── models/schemas.js            # MongoDB schemas
├── routes/
│   ├── auth.js                 # Login/Register
│   ├── payments.js             # Payment logic
│   └── queries.js              # Get data
├── utils/crypto.js             # Encryption
└── package.json

frontend/
├── src/
│   ├── App.jsx                 # Main app
│   ├── pages/AuthPage.jsx      # Login page
│   ├── pages/Dashboard.jsx     # Balance page
│   └── pages/PaymentFlow.jsx   # Send money
├── vite.config.js
├── index.html
└── package.json
```

## 🔑 Test Accounts (After Registration)

- john@upi / password123 (₹10,000)
- jane@upi / password123 (₹10,000)

## ✨ Features to Explore

1. **Dashboard**
   - View balance (updates every 5 seconds)
   - Transaction history (sent/received)
   - Network stats (nodes, packets, success rate)

2. **Send Money**
   - Create encrypted payment packet
   - See mesh routing animation
   - Confirm successful settlement

3. **Security**
   - Passwords hashed with bcryptjs
   - Payments encrypted with AES-256
   - Signatures verified with HMAC

## 🚀 Next Steps

1. Study the code in each file
2. Modify the UI colors in App.css
3. Add new features (notifications, filtering, etc.)
4. Deploy to cloud (Render + Vercel)
5. Add to your GitHub portfolio

## 📖 Learn More

- `SETUP.md` - Full setup guide
- `README.md` - Complete documentation
- Study each code file - Heavy comments explain everything

Happy coding! 🎉
