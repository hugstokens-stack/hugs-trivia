// wallet.js

// XRP Ledger integration for wallet management

const xrpl = require('xrpl');

/**
 * Create an XRP wallet with a given secret
 * @param {string} secret - The secret of the wallet
 * @returns {object} The created wallet
 */
function createWallet(secret) {
    const wallet = xrpl.Wallet.fromSecret(secret);
    return wallet;
}

/**
 * Get the balance of the wallet
 * @param {string} address - The address of the wallet
 * @returns {Promise<number>} The balance of the wallet in XRP
 */
async function getBalance(address) {
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    const response = await client.getXrpBalance(address);
    await client.disconnect();
    return response.xrp;
}

/**
 * Send XRP from one wallet to another
 * @param {string} secret - The secret of the sender's wallet
 * @param {string} destination - The address of the recipient
 * @param {number} amount - The amount of XRP to send
 * @returns {Promise<string>} The transaction hash
 */
async function sendXRP(secret, destination, amount) {
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    const wallet = createWallet(secret);

    const tx = {
        TransactionType: 'Payment',
        Account: wallet.classicAddress,
        Destination: destination,
        Amount: xrpl.xrpToDrops(amount),
    };

    const preparedTx = await client.autofill(tx);
    const signedTx = wallet.sign(preparedTx);
    const result = await client.submitAndWait(signedTx.tx_blob);
    await client.disconnect();
    return result.transactionHash;
}

module.exports = { createWallet, getBalance, sendXRP };