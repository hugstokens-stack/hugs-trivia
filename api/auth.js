const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '5m';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { address } = req.body;
    if (!address || !address.startsWith('r')) {
        return res.status(400).json({ error: 'Invalid XRP Ledger address' });
    }
    try {
        const token = jwt.sign({ address, iat: Date.now() }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
        res.status(200).json({ token, expiresIn: JWT_EXPIRY });
    } catch (error) {
        res.status(500).json({ error: 'Token generation failed' });
    }
};