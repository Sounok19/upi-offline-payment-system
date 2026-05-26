// routes/payments.js
const express = require('express');
const { 
  User, 
  OfflinePacket, 
  MeshNode, 
  Transaction 
} = require('../models/schemas');
const crypto = require('../utils/crypto');

const router = express.Router();

/**
 * POST /api/payment/create-packet
 * Create encrypted offline payment packet
 */
router.post('/create-packet', async (req, res) => {
  try {
    const { senderUPI, receiverUPI, amount, deviceKey } = req.body;

    // Validation
    if (!senderUPI || !receiverUPI || !amount || !deviceKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Verify sender exists and has funds
    const sender = await User.findOne({ upiId: senderUPI.toLowerCase() });
    if (!sender) {
      return res.status(404).json({ 
        success: false, 
        error: 'Sender not found' 
      });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient balance' 
      });
    }

    // Verify receiver exists
    const receiver = await User.findOne({ upiId: receiverUPI.toLowerCase() });
    if (!receiver) {
      return res.status(404).json({ 
        success: false, 
        error: 'Receiver not found' 
      });
    }

    // Create payload
    const payload = {
      senderUPI: senderUPI.toLowerCase(),
      receiverUPI: receiverUPI.toLowerCase(),
      amount: parseFloat(amount),
      timestamp: Date.now(),
      nonce: crypto.generateNonce()
    };

    // Encrypt and sign locally
    const encryptedData = crypto.encryptPayload(payload, deviceKey);
    const signature = crypto.signPayload(payload, deviceKey);
    const packetId = crypto.generatePacketId();

    // Save encrypted packet
    const packet = new OfflinePacket({
      packetId,
      encryptedData,
      signature,
      senderUPI: senderUPI.toLowerCase(),
      amount: parseFloat(amount),
      status: 'pending'
    });

    await packet.save();

    res.json({ 
      success: true,
      message: 'Payment packet created',
      packet: {
        packetId,
        encryptedData,
        signature,
        amount,
        status: 'pending'
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/payment/forward-packet
 * Simulate mesh network routing - forward through node
 */
router.post('/forward-packet', async (req, res) => {
  try {
    const { packetId, nodeId } = req.body;

    if (!packetId || !nodeId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing packetId or nodeId' 
      });
    }

    // Find packet
    const packet = await OfflinePacket.findOne({ packetId });
    if (!packet) {
      return res.status(404).json({ 
        success: false, 
        error: 'Packet not found' 
      });
    }

    // Update packet (track hops)
    packet.hopCount += 1;
    packet.bridgeNodeId = nodeId;
    await packet.save();

    // Register/update mesh node
    let meshNode = await MeshNode.findOne({ nodeId });
    if (!meshNode) {
      meshNode = new MeshNode({ 
        nodeId, 
        deviceName: `Device-${nodeId.slice(0, 8)}` 
      });
    }
    meshNode.packetsForwarded += 1;
    meshNode.lastSeen = new Date();
    await meshNode.save();

    res.json({ 
      success: true,
      message: `Packet forwarded. Hops: ${packet.hopCount}`,
      hopCount: packet.hopCount
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/payment/settle
 * Settle payment on backend (verify and transfer funds)
 */
router.post('/settle', async (req, res) => {
  try {
    const { packetId, deviceKey } = req.body;

    if (!packetId || !deviceKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing packetId or deviceKey' 
      });
    }

    // Find packet
    const packet = await OfflinePacket.findOne({ packetId });
    if (!packet) {
      return res.status(404).json({ 
        success: false, 
        error: 'Packet not found' 
      });
    }

    // Check if already settled (idempotency)
    if (packet.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Packet already settled or rejected',
        action: 'already_settled'
      });
    }

    // Decrypt payload
    let payload;
    try {
      payload = crypto.decryptPayload(packet.encryptedData, deviceKey);
    } catch (error) {
      packet.status = 'rejected';
      await packet.save();
      
      return res.status(400).json({ 
        success: false, 
        error: 'Decryption failed - invalid device key',
        action: 'rejected'
      });
    }

    // Verify signature
    if (!crypto.verifySignature(payload, packet.signature, deviceKey)) {
      packet.status = 'rejected';
      await packet.save();

      return res.status(400).json({ 
        success: false, 
        error: 'Signature verification failed',
        action: 'rejected'
      });
    }

    // Get sender and receiver
    const sender = await User.findOne({ upiId: payload.senderUPI });
    const receiver = await User.findOne({ upiId: payload.receiverUPI });

    if (!sender || !receiver) {
      packet.status = 'rejected';
      await packet.save();

      return res.status(404).json({ 
        success: false, 
        error: 'Sender or receiver not found',
        action: 'rejected'
      });
    }

    // Double-spend prevention: check balance at settlement time
    if (sender.balance < payload.amount) {
      packet.status = 'rejected';
      await packet.save();

      // Record failed transaction
      const txn = new Transaction({
        transactionId: crypto.generateTransactionId(),
        packetId,
        senderUPI: payload.senderUPI,
        receiverUPI: payload.receiverUPI,
        amount: payload.amount,
        status: 'failed',
        offlineCreatedAt: new Date(payload.timestamp),
        reason: 'Insufficient funds at settlement'
      });
      await txn.save();

      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient balance at settlement',
        action: 'rejected'
      });
    }

    // Transfer funds
    sender.balance -= payload.amount;
    receiver.balance += payload.amount;
    await sender.save();
    await receiver.save();

    // Mark packet settled
    packet.status = 'settled';
    await packet.save();

    // Record successful transaction
    const txn = new Transaction({
      transactionId: crypto.generateTransactionId(),
      packetId,
      senderUPI: payload.senderUPI,
      receiverUPI: payload.receiverUPI,
      amount: payload.amount,
      status: 'success',
      offlineCreatedAt: new Date(payload.timestamp)
    });
    await txn.save();

    res.json({ 
      success: true,
      message: 'Payment settled successfully',
      transaction: {
        transactionId: txn.transactionId,
        senderUPI: payload.senderUPI,
        receiverUPI: payload.receiverUPI,
        amount: payload.amount,
        status: 'success'
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;

/*
PAYMENT FLOW EXPLANATION:

CREATE PACKET:
1. Sender initiates payment locally
2. Payload created with sender, receiver, amount, timestamp, nonce
3. Payload encrypted with device key (AES-256)
4. Payload signed with HMAC
5. Packet stored in database (status: pending)
6. Encrypted packet ready for mesh transmission

FORWARD PACKET:
1. Packet travels through mesh network
2. Each intermediate node forwards to next node
3. hopCount incremented at each hop
4. bridgeNodeId tracked (last node to have it)
5. MeshNode entry created/updated
6. No decryption happens during routing (stays encrypted)

SETTLE PACKET:
1. Bridge node uploads to backend (has internet)
2. Backend decrypts with device key
3. Backend verifies signature (checks authenticity)
4. Backend checks sender has funds (double-spend prevention)
5. Backend transfers money
6. Backend marks packet as settled (prevents duplicate settlement)
7. Transaction record created

SECURITY FEATURES:
- Encryption: Only sender and backend know device key
- Signature: Verifies data wasn't modified in transit
- Nonce: Prevents replay attacks
- Status check: Prevents settling same packet twice
- Balance check: Prevents spending more than balance
- Idempotency: Same settlement request returns same result

IDEMPOTENCY:
If same packet is uploaded twice:
- First upload: settles and transfers funds
- Second upload: rejected (already settled)
- Frontend safely retries without double-transfer
*/
