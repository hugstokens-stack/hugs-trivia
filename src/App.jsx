import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { CONFIG } from "./config";
import { getWallet, clearWallet, createTestWallet } from "./wallet";
// ✅ tie in your large bank
import { EXTRA_BANK } from "./extras"; // Vite will happily import .ts from .jsx

export default function App() {
  // ───────────── Game state
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctInRound, setCorrectInRound] = useState(0);
  const [qIndex, setQIndex] = useState(0); // index within a round (0..questionsPerRound-1)
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  // ───────────── Wallet
  const [wallet, setWalletState] = useState(getWallet());

  // ───────────── Sizing
  const roundTarget = useMemo(() => CONFIG.questionsPerRound, []);

  // ───────────── No repeats across the whole session
  const normalize = (s = "") => s.toLowerCase().replace(/\s+/g, " ").trim();
  const keyForQ = (q) => (q?.id ?? normalize(q?.question ?? ""));

  const [askedKeys, setAskedKeys] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("askedKeys") || "[]"));
    } catch {
      return new Set();
    }
  });
  const rememberAsked = (k) => {
    const next = new Set(askedKeys);
    next.add(k);
    setAskedKeys(next);
    localStorage.setItem("askedKeys", JSON.stringify([...next]));
  };

  // ───────────── Auto-focus input on every new question
  const inputRef = useRef(null);
  useEffect(() => {
    if (started && question && !showLevelComplete) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [question, started, showLevelComplete, qIndex]);

  // ───────────── Keyboard: Enter to start / submit / next level
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Enter") return;

      if (!started && CONFIG.startOnEnter) {
        setStarted(true);
        return;
      }

      if (showLevelComplete) {
        // enter starts next level
        setShowLevelComplete(false);
        setCorrectInRound(0);
        setQIndex(0);
        setLevel((L) => L + 1);
        return;
      }

      if (started && CONFIG.submitOnEnter) {
        if (answer.trim()) submit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, showLevelComplete, answer]);

  // ───────────── Helper: level → difficulty (100 levels across 5 difficulties)
  const difficultyForLevel = (L) => Math.min(5, Math.max(1, Math.ceil(L / 20)));

  // ───────────── Fetch a question (API first, fallback to EXTRA_BANK) with no repeats
  useEffect(() => {
    if (!started || showLevelComplete) return;

    let cancelled = false;
    setQuestion(null);

    async function fetchFromAPI() {
      try {
        const res = await fetch(`/api/question?level=${level}&q=${qIndex}`);
        const data = await res.json();
        if (!data) return null;
        const k = keyForQ(data);
        if (askedKeys.has(k)) return null; // duplicate -> reject to try fallback
        return data;
      } catch {
        return null;
      }
    }

    function fetchFromExtras() {
      const diff = difficultyForLevel(level);
      const pool = EXTRA_BANK[diff] || [];
      // try to find a not-yet-asked question in this difficulty
      for (const q of pool) {
        const k = keyForQ({ id: q.id, question: q.q });
        if (!askedKeys.has(k)) {
          return { id: q.id, question: q.q, answer: Array.isArray(q.a) ? q.a[0] : q.a };
        }
      }
      return null;
    }

    (async () => {
      // Try API up to a few times; if duplicates or error, fall back to extras
      let nextQ = null;

      for (let attempt = 0; attempt < 3 && !nextQ; attempt++) {
        nextQ = await fetchFromAPI();
      }
      if (!nextQ) nextQ = fetchFromExtras();

      if (!nextQ) {
        // last resort (no uniques left at this difficulty)
        nextQ = {
          id: `out-${Date.now()}`,
          question: "We’re out of fresh questions at this difficulty. Add more to the pool!",
          answer: "",
        };
      }

      if (!cancelled) {
        rememberAsked(keyForQ(nextQ));
        setQuestion(nextQ);
      }
    })();

    return () => { cancelled = true; };
  }, [started, level, qIndex, showLevelComplete]); // askedKeys persisted via rememberAsked

  // ───────────── Submit answer (advance even if wrong)
  function submit() {
    if (!question) return;
    const user = answer.trim().toLowerCase();
    const expected = (question.answer || "").toString().toLowerCase();
    const ok = user && expected && user === expected;

    if (ok) {
      setCorrectInRound((c) => c + 1);
      setFeedback("✅ Correct! +5 HUG Tokens (pending)"); // visual feedback
    } else {
      setFeedback("❌ Incorrect — moving on…");
    }

    // Advance to next question (or complete the level)
    setTimeout(() => {
      setFeedback("");
      setAnswer("");
      const nextIndex = qIndex + 1;
      if (nextIndex >= roundTarget) {
        // level complete
        setShowLevelComplete(true);
      } else {
        setQIndex(nextIndex);
      }
    }, 600);
  }

  // ───────────── Reward tokens after each completed round
  useEffect(() => {
    if (!started) return;
    if (showLevelComplete && wallet?.address) {
      rewardTokens(wallet.address, CONFIG.tokensPerCorrectRound)
        .then(() =>
          setFeedback(`🎉 Level Complete! +${CONFIG.tokensPerCorrectRound} ${CONFIG.tokenCode} awarded.`)
        )
        .catch(() => setFeedback("⚠️ Reward queued. (Enable XRPL to pay for real)"));
    }
  }, [showLevelComplete, started, wallet]);

  async function rewardTokens(address, amount) {
    if (!address) throw new Error("No wallet address");
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

  // ───────────── Render
  return (
    <div className="page">
      <div className="scrim" />
      <div className="overlay">
        <main className="app-wrap">
          <section className="card">
            {/* HUD */}
            <header className="hud" style={{ justifyContent: "space-between" }}>
              <div className="hud">
                <span className="badge">Level {level}</span>
                <span className="badge">{CONFIG.secondsPerQuestion}s • {CONFIG.questionsPerRound} Q/Round</span>
              </div>
              <div className="hud">
                <span className="badge">Wallet: {wallet?.address ? wallet.address : "—"}</span>
                {wallet?.address ? (
                  <button className="btn btn-ghost" onClick={resetWallet}>Remove</button>
                ) : (
                  <button className="btn btn-blue" onClick={makeWallet}>Create Wallet</button>
                )}
              </div>
            </header>

            {/* Title */}
            <h1 className="title">Hugs Trivia</h1>

            {!started ? (
              <div className="start-wrap">
                <p className="subtitle">
                  {CONFIG.questionsPerRound} questions • {CONFIG.secondsPerQuestion} seconds each.
                  Earn {CONFIG.tokensPerCorrectRound} {CONFIG.tokenCode} per correct round.
                </p>
                <p>Press <span className="kbd">Enter</span> to start</p>
                <div style={{ marginTop: "1rem" }}>
                  <button className="btn btn-green" onClick={() => setStarted(true)}>Start Game</button>
                </div>
              </div>
            ) : showLevelComplete ? (
              <div className="start-wrap">
                <p className="subtitle">Level complete! Press <span className="kbd">Enter</span> to start the next level.</p>
              </div>
            ) : (
              <>
                <h3 className="level">Question</h3>
                <p className="subtitle">{question?.question ?? "Loading…"}</p>

                <div className="controls">
                  <input
                    ref={inputRef}
                    type="text"
                    value={answer}
                    placeholder="Your answer…"
                    onChange={(e) => setAnswer(e.target.value)}
                    autoComplete="off"
                  />
                  <button className="btn btn-blue" onClick={submit}>Submit</button>
                </div>

                {feedback && <div className="feedback">{feedback}</div>}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
