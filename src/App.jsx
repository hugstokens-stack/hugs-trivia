import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { CONFIG } from "./config";
import { getWallet, setWallet, clearWallet, createTestWallet } from "./wallet";

export default function App() {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctInRound, setCorrectInRound] = useState(0);
  const [wallet, setWalletState] = useState(getWallet());

  const roundTarget = useMemo(() => CONFIG.questionsPerRound, []);

  // Global key handling
  useEffect(() => {
    const onKey = (e) => {
      if (CONFIG.startOnEnter && !started && e.key === "Enter") setStarted(true);
      if (CONFIG.submitOnEnter && started && e.key === "Enter" && answer.trim()) submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, answer]);

  // Fetch question when level changes and game started
  useEffect(() => {
    if (!started) return;
    fetch(`/api/question?level=${level}`)
      .then((r) => r.json())
      .then((data) => setQuestion(data));
  }, [level, started]);

  const submit = () => {
    if (!question) return;
    const ok = answer.trim().toLowerCase() === question.answer.toLowerCase();
    if (ok) {
      setCorrectInRound((c) => c + 1);
      setFeedback("✅ Correct! +5 HUG Tokens (pending)!");
      setTimeout(() => {
        setFeedback("");
        setAnswer("");
        setLevel((prev) => prev + 1);
      }, 900);
    } else {
      setFeedback("❌ Try again!");
      setTimeout(() => setFeedback(""), 800);
    }
  };

  // When a round is completed, trigger reward
  useEffect(() => {
    if (!started) return;
    if (correctInRound > 0 && correctInRound % roundTarget === 0) {
      rewardTokens(wallet?.address || "", CONFIG.tokensPerCorrectRound)
        .then(() => setFeedback(`🎉 Level Complete! +${CONFIG.tokensPerCorrectRound} ${CONFIG.tokenCode} awarded.`))
        .catch(() => setFeedback("⚠️ Reward queued. (Configure XRPL to enable payouts)"));
      // next round continues automatically
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctInRound]);

  async function rewardTokens(address, amount) {
    if (!address) throw new Error("No wallet address");
    // Server endpoint (mock by default; upgrade to XRPL later)
    const res = await fetch("/api/reward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, amount, token: CONFIG.tokenCode }),
    });
    if (!res.ok) throw new Error("reward failed");
    return res.json();
  }

  async function makeWallet() {
    const w = await createTestWallet();
    setWalletState(w);
  }

  function resetWallet() {
    clearWallet();
    setWalletState(null);
  }

  return (
    <>
      <div className="app-bg" />
      <div className="app-overlay" />
      <main className="app-wrap">
        <section className="card">
          <header className="hud" style={{ justifyContent: "space-between" }}>
            <div className="hud">

# 1) Config with your preferences
cat > src/config.ts <<'TS'
export const CONFIG = {
  questionsPerRound: 7,
  secondsPerQuestion: 22,
  tokensPerCorrectRound: 5,
  tokenCode: "HUGS",
  startOnEnter: true,
  submitOnEnter: true,
  network: "testnet", // "testnet" | "mainnet"
  mockRewards: true,  // set false when you switch to real XRPL payouts
};
TS

# 2) Lightweight wallet helper (browser-side)
cat > src/wallet.ts <<'TS'
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
TS

# 3) Updated App with start/submit on Enter, round logic, rewards hook, wallet UI
cat > src/App.jsx <<'JSX'
import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { CONFIG } from "./config";
import { getWallet, setWallet, clearWallet, createTestWallet } from "./wallet";

export default function App() {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctInRound, setCorrectInRound] = useState(0);
  const [wallet, setWalletState] = useState(getWallet());

  const roundTarget = useMemo(() => CONFIG.questionsPerRound, []);

  // Global key handling
  useEffect(() => {
    const onKey = (e) => {
      if (CONFIG.startOnEnter && !started && e.key === "Enter") setStarted(true);
      if (CONFIG.submitOnEnter && started && e.key === "Enter" && answer.trim()) submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, answer]);

  // Fetch question when level changes and game started
  useEffect(() => {
    if (!started) return;
    fetch(`/api/question?level=${level}`)
      .then((r) => r.json())
      .then((data) => setQuestion(data));
  }, [level, started]);

  const submit = () => {
    if (!question) return;
    const ok = answer.trim().toLowerCase() === question.answer.toLowerCase();
    if (ok) {
      setCorrectInRound((c) => c + 1);
      setFeedback("✅ Correct! +5 HUG Tokens (pending)!");
      setTimeout(() => {
        setFeedback("");
        setAnswer("");
        setLevel((prev) => prev + 1);
      }, 900);
    } else {
      setFeedback("❌ Try again!");
      setTimeout(() => setFeedback(""), 800);
    }
  };

  // When a round is completed, trigger reward
  useEffect(() => {
    if (!started) return;
    if (correctInRound > 0 && correctInRound % roundTarget === 0) {
      rewardTokens(wallet?.address || "", CONFIG.tokensPerCorrectRound)
        .then(() => setFeedback(`🎉 Level Complete! +${CONFIG.tokensPerCorrectRound} ${CONFIG.tokenCode} awarded.`))
        .catch(() => setFeedback("⚠️ Reward queued. (Configure XRPL to enable payouts)"));
      // next round continues automatically
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctInRound]);

  async function rewardTokens(address, amount) {
    if (!address) throw new Error("No wallet address");
    // Server endpoint (mock by default; upgrade to XRPL later)
    const res = await fetch("/api/reward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, amount, token: CONFIG.tokenCode }),
    });
    if (!res.ok) throw new Error("reward failed");
    return res.json();
  }

  async function makeWallet() {
    const w = await createTestWallet();
    setWalletState(w);
  }

  function resetWallet() {
    clearWallet();
    setWalletState(null);
  }

  return (
    <>
      <div className="app-bg" />
      <div className="app-overlay" />
      <main className="app-wrap">
        <section className="card">
          <header className="hud" style={{ justifyContent: "space-between" }}>
            <div className="hud">
              <span className="badge">Level {level}</span>
              <span className="badge">{CONFIG.secondsPerQuestion}s • {CONFIG.questionsPerRound} Q/Round</span>
            </div>
            <div className="hud">
              <span className="badge">Wallet: {wallet?.address ? wallet.address : "—"}</span>
              {wallet?.address ? (
                <button className="primary" onClick={resetWallet}>Remove</button>
              ) : (
                <button className="primary" onClick={makeWallet}>Create Wallet</button>
              )}
            </div>
          </header>

          <h1 className="title">Hugs Trivia</h1>

          {!started ? (
            <div className="start-wrap">
              <p className="subtitle">
                {CONFIG.questionsPerRound} questions • {CONFIG.secondsPerQuestion} seconds each.
                Earn {CONFIG.tokensPerCorrectRound} {CONFIG.tokenCode} per correct round.
              </p>
              <p>Press <span className="kbd">Enter</span> to start</p>
              <div style={{ marginTop: "1rem" }}>
                <button className="primary" onClick={() => setStarted(true)}>Start Game</button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="level">Question</h3>
              <p className="subtitle">{question?.question ?? "Loading…"}</p>

              <div className="controls">
                <input
                  type="text"
                  value={answer}
                  placeholder="Your answer…"
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <button className="primary" onClick={submit}>Submit</button>
              </div>

              {feedback && <div className="feedback">{feedback}</div>}
            </>
          )}
        </section>
      </main>
    </>
  );
}
