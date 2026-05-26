// routes/queries.js
const express = require('express');
const { User, Transaction, MeshNode, OfflinePacket } = require('../models/schemas');

const router = express.Router();

/**
 * GET /api/user/:upiId/balance
 * Get user balance
 */
router.get('/user/:upiId/balance', async (req, res) => {
  try {
    const { upiId } = req.params;

    const user = await User.findOne({ upiId: upiId.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      balance: user.balance,
      upiId: user.upiId
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/transactions/:upiId
 * Get all transactions for a user (sent and received)
 */
router.get('/transactions/:upiId', async (req, res) => {
  try {
    const { upiId } = req.params;

    // Verify user exists
    const user = await User.findOne({ upiId: upiId.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Get all transactions (sent or received)
    const transactions = await Transaction.find({
      $or: [
        { senderUPI: upiId.toLowerCase() },
        { receiverUPI: upiId.toLowerCase() }
      ]
    })
    .sort({ settledAt: -1 })
    .limit(50);  // Limit to last 50 transactions

    res.json({ 
      success: true, 
      count: transactions.length,
      transactions 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/mesh/stats
 * Get mesh network statistics
 */
router.get('/mesh/stats', async (req, res) => {
  try {
    // Count nodes and packets
    const totalNodes = await MeshNode.countDocuments();
    const totalPackets = await OfflinePacket.countDocuments();
    const settledPackets = await OfflinePacket.countDocuments({ 
      status: 'settled' 
    });
    const rejectedPackets = await OfflinePacket.countDocuments({ 
      status: 'rejected' 
    });

    // Calculate success rate
    const successRate = totalPackets > 0 
      ? ((settledPackets / totalPackets) * 100).toFixed(2) 
      : '0';

    // Get top nodes by packets forwarded
    const topNodes = await MeshNode.find()
      .sort({ packetsForwarded: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalNodes,
        totalPackets,
        settledPackets,
        rejectedPackets,
        pendingPackets: totalPackets - settledPackets - rejectedPackets,
        successRate: successRate + '%'
      },
      topNodes
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
QUERY ENDPOINTS EXPLANATION:

GET /api/user/:upiId/balance
- Returns current balance for user
- Used by frontend to display balance
- Called after login and after every transaction

GET /api/transactions/:upiId
- Returns all transactions for a user
- Shows both sent (debit) and received (credit)
- Sorted by date (newest first)
- Limited to 50 most recent transactions
- Used to populate transaction history page

GET /api/mesh/stats
- Returns network statistics
- totalNodes: Number of devices in network
- totalPackets: Total payment packets created
- settledPackets: Successfully processed packets
- rejectedPackets: Failed packets
- successRate: Percentage of packets that settled
- topNodes: Most active forwarding devices
- Used to populate network stats on dashboard

PERFORMANCE CONSIDERATIONS:
- Transactions limited to 50 (prevents loading too many)
- Indexes on UPI ID and status for fast queries
- MeshNode queries limited to top 10 nodes
- All queries use proper MongoDB indexing
*/
