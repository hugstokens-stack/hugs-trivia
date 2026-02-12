// client/src/App.tsx
import React, { useEffect, useState } from "react";
import "./App.css";
import QuestionCard from "./QuestionCard";

const API = `${window.location.protocol}//${window.location.hostname}:5000`;

type Wallet = { address?: string; seed?: string } | null;

export default function App() {
  // XRPL / UI
  const [wallet, setWallet] = useState<Wallet>(null);
  const [balance, setBalance] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [round] = useState(1);

  // End-of-round state
  const [awaitNext, setAwaitNext] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  // ────────────────────────────────────────────────────────────────────────────
  // Global Enter key: start game or advance to next level (when not typing)
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    function isTypingTarget(el: EventTarget | null) {
      const t = el as HTMLElement | null;
      if (!t) return false;
      const tag = (t.tagName || "").toUpperCase();
      return tag === "INPUT" || tag === "TEXTAREA" || (t as any).isContentEditable;
    }

    function onKey(ev: KeyboardEvent) {
      if (ev.key !== "Enter") return;
      if (isTypingTarget(ev.target)) return;        // don't steal Enter from inputs
      if (!wallet?.address) return;                 // need a wallet
      if (gameStarted) return;                      // while playing, QuestionCard handles Enter

      ev.preventDefault();
      if (awaitNext) toNextLevel();
      else startGame();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [awaitNext, gameStarted, wallet]);

  // ────────────────────────────────────────────────────────────────────────────
  // Backend helpers
  // ────────────────────────────────────────────────────────────────────────────
  async function createWallet() {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch(`${API}/api/create_wallet`, { method: "POST" });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "create_wallet failed");
      setWallet({ address: d.address, seed: d.seed });
      setMsg("Wallet created! Press Enter to start.");
      setTimeout(() => void refreshBalance(), 1200);
    } catch (e: any) {
      setMsg(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function refreshBalance() {
    if (!wallet?.address) {
      setMsg("No wallet yet.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch(
        `${API}/api/get_balance?account=${encodeURIComponent(wallet.address)}`
      );
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "get_balance failed");
      setBalance(Number(d.hugs ?? d.balance ?? 0));
    } catch (e: any) {
      setMsg(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function startGame() {
    if (!wallet?.address) {
      setMsg("Create a wallet first.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch(`${API}/api/start_game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: wallet.address }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "start_game failed");
      setGameStarted(true);
      setAwaitNext(false);
      setLastScore(null);
    } catch (e: any) {
      setMsg(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  function toNextLevel() {
    setAwaitNext(false);
    setLevel((n) => n + 1);
    setLastScore(null);
    void startGame();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // JSX
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="overlay">
        <header className="bar">
          <div className="brand">🎯 22 Seconds — 100 Levels</div>
          <div className="controls">
            <span>
              <strong>Wallet:</strong> {wallet?.address ?? "None"}
            </span>
            <span>
              <strong>HUGS:</strong> {balance}
            </span>
            <button disabled={busy} onClick={createWallet}>
              Create Wallet
            </button>
            <button disabled={busy} onClick={refreshBalance}>
              Refresh
            </button>
          </div>
        </header>

        <main className="panel">
          <h3>Level {level} • Round {round}</h3>
          <p>7 questions • 22 seconds each. Earn HUGS for correct rounds.</p>

          {/* Start / Continue button (also works with Enter due to key handler) */}
          {!gameStarted && !awaitNext && (
            <button
              className="start"
              disabled={busy || !wallet?.address}
              onClick={startGame}
              aria-label="Start Game"
              title={wallet?.address ? "Press Enter to Start" : "Create a wallet first"}
            >
              {busy ? "Working..." : "Start Game (Enter)"}
            </button>
          )}

          {/* The game */}
          {gameStarted && (
            <div className="game-box">
              <QuestionCard
                level={level}
                onFinish={(correctCount: number) => {
                  setGameStarted(false);
                  setLastScore(correctCount);
                  setMsg(
                    `Round finished — you got ${correctCount}/7 correct! (Press Enter for next level)`
                  );
                  setAwaitNext(true);
                }}
              />
            </div>
          )}

          {/* Level complete overlay (click or Enter to advance) */}
          {!gameStarted && awaitNext && (
            <div className="finish-card" role="dialog" aria-modal="true">
              <h2>🎉 Level Complete!</h2>
              <p>
                You answered <strong>{lastScore ?? 0} of 7</strong> correctly.
              </p>
              <p>
                Press <strong>Enter</strong> or click:
              </p>
              <button className="start" onClick={toNextLevel}>
                Next Level →
              </button>
            </div>
          )}

          {msg && <div className="note">{msg}</div>}

          {wallet?.seed && (
            <details style={{ marginTop: 12 }}>
              <summary>Show seed (testnet only)</summary>
              <code>{wallet.seed}</code>
            </details>
          )}
        </main>
      </div>
    </div>
  );
}
