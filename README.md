# UPI Offline Payment System

Complete MERN stack implementation of decentralized offline payments using encrypted packets and mesh networks.

## Features

✅ User authentication with bcryptjs
✅ Encrypted offline payment packets (AES-256)
✅ HMAC signature verification
✅ Mesh network simulation
✅ Payment settlement with deduplication
✅ Double-spend prevention
✅ Modern fintech UI
✅ Real-time updates
✅ Transaction history
✅ Network statistics

## Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose
**Frontend:** React 18, Vite, Axios
**Security:** bcryptjs, crypto (AES-256-CBC, HMAC-SHA256)
**Database:** MongoDB with 4 collections

## Getting Started

See SETUP.md for quick start instructions.

## Project Structure

- `backend/` - Express.js server
- `frontend/` - React application
- `SETUP.md` - Setup guide
- `README.md` - This file

## How It Works

1. **Create Packet:** User creates payment locally, encrypts with device key
2. **Mesh Routing:** Packet travels through mesh network (encrypted, unreadable)
3. **Settle:** Bridge node uploads to backend, backend decrypts and verifies
4. **Transfer:** Money transferred if valid, packet marked settled

## Security

- Payments encrypted with AES-256-CBC
- Signatures verified with HMAC-SHA256
- Passwords hashed with bcryptjs
- Nonce included to prevent replay attacks
- Balance checked at settlement time
- Packet status checked to prevent double-settle

## Learn More

Each file has detailed comments explaining:
- What it does
- How it works
- Security considerations
- Implementation details

Study the code to understand full-stack development!
