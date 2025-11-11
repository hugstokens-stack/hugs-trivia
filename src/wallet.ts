export type Wallet = { address: string; seed?: string };

const KEY = "hugs_wallet";

export function getWallet(): Wallet | null {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}
export function setWallet(w: Wallet) { localStorage.setItem(KEY, JSON.stringify(w)); }
export function clearWallet() { localStorage.removeItem(KEY); }

// Dev/test convenience: create a pseudo wallet locally.
// (Later we’ll replace with xrpl.js + faucet funding.)
export async function createTestWallet(): Promise<Wallet> {
  const r = await fetch("https://www.random.org/strings/?num=1&len=29&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new").catch(()=>null);
  const seed = r ? (await r.text()).trim() : Math.random().toString(36).slice(2);
  const address = "r" + seed.replace(/[^a-zA-Z0-9]/g,"").slice(0,33);
  const w = { address, seed };
  setWallet(w);
  return w;
}
