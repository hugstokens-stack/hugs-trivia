const express = require('express');
const jwt = require('jsonwebtoken');
const { Client, Wallet, xrpToDrops } = require('xrpl');

const router = express.Router();
const client = new Client('wss://s.altnet.rippletest.net:51233'); // Testnet for XRPL
const SECRET_KEY = 'your_secret_key'; // Replace with your actual secret key

// Middleware to validate JWT tokens
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// POST endpoint to handle reward distribution
router.post('/reward', authenticateToken, async (req, res) => {
    const { recipientAddress, amount } = req.body;

    if (!recipientAddress || !amount) {
        return res.status(400).json({ error: 'Recipient address and amount are required.' });
    }

    try {
        const wallet = Wallet.fromSeed('your_wallet_seed'); // Replace with your wallet seed
        await client.connect();

        const preparedTx = await client.autofill({
            TransactionType: 'Payment',
            Destination: recipientAddress,
            Amount: xrpToDrops(amount),
            Account: wallet.classicAddress,
        });

        const signedTx = wallet.sign(preparedTx);
        const result = await client.submitAndWait(signedTx.tx_blob);

        if (result.result.meta.TransactionResult === 'tesSUCCESS') {
            res.status(200).json({ success: 'Reward distributed successfully!', result });
        } else {
            res.status(500).json({ error: 'Transaction failed.', result });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await client.disconnect();
    }
});

module.exports = router;