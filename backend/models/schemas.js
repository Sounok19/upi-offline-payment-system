// models/schemas.js
const mongoose = require('mongoose');

// ===== USER SCHEMA =====
const userSchema = new mongoose.Schema({
  upiId: { 
    type: String, 
    unique: true, 
    required: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  balance: { 
    type: Number, 
    default: 10000,
    min: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// ===== OFFLINE PAYMENT PACKET SCHEMA =====
// This stores encrypted payment packets in transit
const offlinePacketSchema = new mongoose.Schema({
  packetId: { 
    type: String, 
    unique: true, 
    required: true,
    index: true
  },
  encryptedData: {
    type: String,
    required: true
  },
  signature: {
    type: String,
    required: true
  },
  senderUPI: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 86400  // Auto-delete after 24 hours
  },
  status: { 
    type: String, 
    enum: ['pending', 'settled', 'rejected'], 
    default: 'pending',
    index: true
  },
  hopCount: { 
    type: Number, 
    default: 0 
  },
  bridgeNodeId: String
});

// ===== MESH NODE SCHEMA =====
// Tracks intermediate nodes in the mesh network
const meshNodeSchema = new mongoose.Schema({
  nodeId: { 
    type: String, 
    unique: true, 
    required: true,
    index: true
  },
  deviceName: {
    type: String,
    required: true
  },
  lastSeen: { 
    type: Date, 
    default: Date.now 
  },
  packetsForwarded: { 
    type: Number, 
    default: 0 
  }
});

// ===== TRANSACTION SCHEMA =====
// Settlement records for completed or failed transactions
const transactionSchema = new mongoose.Schema({
  transactionId: { 
    type: String, 
    unique: true, 
    required: true,
    index: true
  },
  packetId: {
    type: String,
    required: true,
    index: true
  },
  senderUPI: {
    type: String,
    required: true,
    index: true
  },
  receiverUPI: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  status: { 
    type: String, 
    enum: ['success', 'failed', 'pending'], 
    default: 'pending',
    index: true
  },
  offlineCreatedAt: {
    type: Date,
    required: true
  },
  settledAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  reason: String  // For failures: insufficient funds, decryption failed, etc.
});

// Create models
const User = mongoose.model('User', userSchema);
const OfflinePacket = mongoose.model('OfflinePacket', offlinePacketSchema);
const MeshNode = mongoose.model('MeshNode', meshNodeSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
  User,
  OfflinePacket,
  MeshNode,
  Transaction,
  userSchema,
  offlinePacketSchema,
  meshNodeSchema,
  transactionSchema
};

/*
DATABASE STRUCTURE EXPLANATION:

1. USER COLLECTION
   - Stores user accounts with balance
   - balance = amount available in account
   - Example: { upiId: "john@upi", balance: 10000 }

2. OFFLINEPACKET COLLECTION
   - Stores encrypted payment packets in transit
   - Encrypted before leaving user's device
   - signature = HMAC for verification
   - status: pending → settled/rejected
   - Example: { packetId: "abc123...", encryptedData: "xyz...", status: "pending" }

3. MESHNODE COLLECTION
   - Tracks devices that forward packets
   - Used to see active network nodes
   - packetsForwarded = count of packets routed through this node
   - Example: { nodeId: "node-abc", packetsForwarded: 5 }

4. TRANSACTION COLLECTION
   - Final settlement record
   - Created when packet is settled
   - Records who paid whom and when
   - Example: { senderUPI: "john@upi", receiverUPI: "jane@upi", amount: 500, status: "success" }

INDEXES:
- Speeds up lookups by UPI ID, packet ID, transaction ID, status
- Helps find all transactions for a user quickly
- Important for large datasets
*/
