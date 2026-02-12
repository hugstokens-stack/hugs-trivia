// hugs.js  — XRPL Testnet demo for the HUGS token
// Runs on Node 18+
// CommonJS version (because package.json has "type": "commonjs")

const xrpl = require("xrpl")

const WS = "wss://s.altnet.rippletest.net:51233" // XRPL Testnet endpoint
const CURRENCY = Buffer.from("HUGS").toString("hex").toUpperCase().padEnd(40, "0")                        // 3–6 letters, shown in wallets

async function main() {
  const client = new xrpl.Client(WS)
  await client.connect()

  // 1) Reuse existing Testnet wallets instead of creating new ones
const issuer = xrpl.Wallet.fromSeed("sEd7AfLoPmT3EJohXLUGhtj1rWSGJXb")
const distro = xrpl.Wallet.fromSeed("sEd7uUjdYnnahehrKyorxSSe5twzoq6")
const user   = xrpl.Wallet.fromSeed("sEdTJ8YSgbLbvTMyRnwPzpSsFwBtH29")

  console.log("Issuer     :", issuer.address)
  console.log("Distributor:", distro.address)
  console.log("User       :", user.address)

  // 2) Enable DefaultRipple so HUGS can move peer-to-peer between holders
  await client.submitAndWait({
    TransactionType: "AccountSet",
    Account: issuer.address,
    SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple
  }, { wallet: issuer })

 // 3) Trust lines
// Distributor accepts up to 20,000,000 HUGS
await client.submitAndWait({
  TransactionType: "TrustSet",
  Account: distro.address,
  LimitAmount: { currency: CURRENCY, issuer: issuer.address, value: "20000000" }
}, { wallet: distro })

// User accepts up to 1,000 HUGS
await client.submitAndWait({
  TransactionType: "TrustSet",
  Account: user.address,
  LimitAmount: { currency: CURRENCY, issuer: issuer.address, value: "1000" }
}, { wallet: user })


  // 4) Issue 10000000 HUGS from issuer -> distributor (this is "minting" on XRPL)
  await client.submitAndWait({
    TransactionType: "Payment",
    Account: issuer.address,
    Destination: distro.address,
    Amount: { currency: CURRENCY, issuer: issuer.address, value: "10000000" }
  }, { wallet: issuer })

  // 5) Pay the user 5 HUGS as a quiz reward (distro -> user)
  await client.submitAndWait({
    TransactionType: "Payment",
    Account: distro.address,
    Destination: user.address,
    Amount: { currency: CURRENCY, issuer: issuer.address, value: "5" }
  }, { wallet: distro })

  // 6) Show the user's HUGS balance
  const lines = await client.request({ command: "account_lines", account: user.address })
  const hugsLine = lines.result.lines.find(l => l.currency === CURRENCY && l.account === issuer.address)
  console.log("User HUGS balance:", hugsLine ? hugsLine.balance : "0")// Also show distributor's HUGS balance
const distroLines = await client.request({ command: "account_lines", account: distro.address })
const distroHugs = distroLines.result.lines.find(l => l.currency === CURRENCY && l.account === issuer.address)
console.log("Distributor HUGS balance:", distroHugs ? distroHugs.balance : "0")

// 7) Calculate total HUGS supply (sum of all trust lines for this issuer)
const allLines = await client.request({
  command: "account_lines",
  account: issuer.address
})

let totalSupply = 0
for (const line of allLines.result.lines) {
  if (line.currency === CURRENCY) {
    // Balances on issuer's side are negative (IOUs issued)
    totalSupply += Math.abs(parseFloat(line.balance))
  }
}

console.log("Total HUGS in circulation:", totalSupply)

// === Check wallet addresses and balances ===
async function showBalances() {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()

  const issuer = xrpl.Wallet.fromSeed("sEd7AfLoPmT3EJohXLUGhtj1rWSGJXb")
  const distro = xrpl.Wallet.fromSeed("sEd7uUjdYnnahehrKyorxSSe5twzoq6")
  const user   = xrpl.Wallet.fromSeed("sEdTJ8YSgbLBvTMyRnwPzpSsFwBtH29")

  // Log the public addresses
  console.log("Issuer address:", issuer.address)
  console.log("Distributor address:", distro.address)
  console.log("User address:", user.address)

  // Query balances
  const issuer_bal = await client.request({
    command: "account_info",
    account: issuer.address,
    ledger_index: "validated"
  })
  const distro_bal = await client.request({
    command: "account_info",
    account: distro.address,
    ledger_index: "validated"
  })
  const user_bal = await client.request({
    command: "account_info",
    account: user.address,
    ledger_index: "validated"
  })

  console.log("\nBalances (in XRP):")
  console.log("Issuer:", issuer_bal.result.account_data.Balance / 1_000_000, "XRP")
  console.log("Distributor:", distro_bal.result.account_data.Balance / 1_000_000, "XRP")
  console.log("User:", user_bal.result.account_data.Balance / 1_000_000, "XRP")

  client.disconnect()
}

showBalances()



  await client.disconnect()
}

main().catch(e => {
  console.error("Error:", e)
})
