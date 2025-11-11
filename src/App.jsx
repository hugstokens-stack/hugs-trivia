import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { CONFIG as RAW } from "./config";
import { getWallet, clearWallet, createTestWallet } from "./wallet";

/** Defaults if some CONFIG fields are missing */
const CONFIG = {
  secondsPerQuestion: 22,
  questionsPerRound: 7,
  tokensPerCorrectRound: 5,
  tokenCode: "HUGS",
  startOnEnter: true,
  submitOnEnter: true,
  totalLevels: 100,
  ...RAW,
};

export default function App() {
  // Core game state
  const [started, setStarted] = useState(false);            // actively answering questions in a level
  const [level, setLevel] = useState(1);                    // 1..100
  const [qIndex, setQIndex] = useState(1);                  // 1..questionsPerRound
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctInRound, setCorrectInRound] = useState(0);

  // Flow control
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [busy, setBusy] = useState(false);                  // prevent double submits during transitions

  // Timer
  const [timeLeft, setTimeLeft] = useState(CONFIG.secondsPerQuestion);
  const timerRef = useRef(null);

  // Wallet
  const [wallet, setWalletState] = useState(getWallet());

  const roundTarget = useMemo(() => CONFIG.questionsPerRound, []);

  /** Global keyboard handling */
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Enter") return;

      // Start first level
      if (CONFIG.startOnEnter && !started && !showLevelComplete) {
        setStarted(true);
        return;
      }

      // Next level after pause
      if (showLevelComplete) {
        nextLevel();
        return;
      }

      // Submit during play
      if (CONFIG.submitOnEnter && started && !busy && answer.trim()) {
        handleSubmit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, showLevelComplete, busy, answer]);

  /** Fetch a question whenever level or qIndex changes during active play */
  useEffect(() => {
    if (!started || showLevelComplete) return;

    setQuestion(null);
    // include qIndex so backend can vary questions within a level if desired
    fetch(`/api/question?level=${level}&q=${qIndex}`)
      .then((r) => r.json())
      .then((data) => setQuestion(data))
      .catch(() => setQuestion({ question: "Failed to load question.", answer: "" }));
  }, [started, level, qIndex, showLevelComplete]);

  /** Per-question timer: 22s; on timeout, auto-advance as incorrect */
  useEffect(() => {
    if (!started || showLevelComplete) return;

    // (re)start timer for each question
    setTimeLeft(CONFIG.secondsPerQuestion);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // treat as incorrect & move on
          if (!busy) skipOrAdvance(false, "⏱️ Time's up — moving to next question.");
          return CONFIG.secondsPerQuestion;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, qIndex, showLevelComplete]);

  /** Submit button handler */
  function handleSubmit() {
    if (busy || !question) return;
    const ok =
      answer.trim().toLowerCase() === (question.answer || "").toLowerCase();

    if (ok) {
      skipOrAdvance(true, "✅ Correct!");
    } else {
      skipOrAdvance(false, "❌ Incorrect — skipping to next.");
    }
  }

  /** Skip/advance shared pathway (correct or not) */
  function skipOrAdvance(wasCorrect, msg) {
    setBusy(true);
    if (timerRef.current) clearInterval(timerRef.current);

    setFeedback(msg);
    if (wasCorrect) setCorrectInRound((c) => c + 1);

    setTimeout(() => {
      setFeedback("");
      setAnswer("");

      // next question or finish the round
      setQIndex((i) => {
        const next = i + 1;
        if (next > CONFIG.questionsPerRound) {
          onRoundComplete();
          return 1; // prepare for next round
        }
        return next;
      });

      setBusy(false);
    }, 600);
  }

  /** Round complete -> award, pause & wait for Enter to start next level */
  async function onRoundComplete() {
    setStarted(false);

    // optional reward
    try {
      if (wallet?.address) {
        await rewardTokens(wallet.address, CONFIG.tokensPerCorrectRound);
        setFeedback(`🎉 Level Complete! +${CONFIG.tokensPerCorrectRound} ${CONFIG.tokenCode} awarded.`);
      } else {
        setFeedback("🎉 Level Complete! (Connect/Create wallet to receive rewards)");
      }
    } catch {
      setFeedback("⚠️ Reward queued. (Enable XRPL to pay for real)");
    }

    setShowLevelComplete(true);
  }

  /** Move to the next level */
  function nextLevel() {
    setFeedback("");
    setShowLevelComplete(false);
    setCorrectInRound(0);
    setAnswer("");

    setLevel((L) => {
      const total = CONFIG.totalLevels || 100;
      if (L >= total) {
        // End of game
        setStarted(false);
        setShowLevelComplete(true);
        setFeedback("🏁 All levels complete! Great job!");
        return L;
      }
      return L + 1;
    });

    setQIndex(1);
    setStarted(true);
  }

  /** Reward API call (mock-able) */
  async function rewardTokens(address, amount) {
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

  /** UI */
  return (
    <div className="page">
      <div className="scrim" />
      <div className="overlay">
        <main className="app-wrap">
          <section className="card">
            {/* HUD */}
            <header className="hud" style={{ justifyContent: "space-between" }}>
              <div className="hud" style={{ gap: 8, alignItems: "center" }}>
                <span className="badge">Level {level}</span>
                <span className="badge">{CONFIG.secondsPerQuestion}s • {CONFIG.questionsPerRound} Q/Round</span>
                {started && !showLevelComplete && (
                  <>
                    <span className="badge">Q {qIndex}/{CONFIG.questionsPerRound}</span>
                    <span className="badge">⏳ {timeLeft}s</span>
                  </>
                )}
              </div>
              <div className="hud" style={{ gap: 8 }}>
                <span className="badge">
                  Wallet: {wallet?.address ? wallet.address : "—"}
                </span>
                {wallet?.address ? (
                  <button className="btn btn-ghost" onClick={resetWallet}>Remove</button>
                ) : (
                  <button className="btn btn-blue" onClick={makeWallet}>Create Wallet</button>
                )}
              </div>
            </header>

            {/* Title */}
            <h1 className="title">Hugs Trivia</h1>

            {/* Start screen */}
            {!started && !showLevelComplete && (
              <div className="start-wrap">
                <p className="subtitle">
                  {CONFIG.questionsPerRound} questions • {CONFIG.secondsPerQuestion} seconds each • {CONFIG.totalLevels || 100} levels.
                  Earn {CONFIG.tokensPerCorrectRound} {CONFIG.tokenCode} each level you complete.
                </p>
                <p>
                  Press <span className="kbd">Enter</span> to start
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <button className="btn btn-green" onClick={() => setStarted(true)}>
                    Start Game
                  </button>
                </div>
              </div>
            )}

            {/* Level complete pause */}
            {showLevelComplete && (
              <div className="start-wrap">
                <p className="subtitle">{feedback || "Level complete!"}</p>
                <p>Press <span className="kbd">Enter</span> for next level</p>
                <div style={{ marginTop: "1rem" }}>
                  <button className="btn btn-blue" onClick={nextLevel}>
                    Next Level
                  </button>
                </div>
              </div>
            )}

            {/* Active question UI */}
            {started && !showLevelComplete && (
              <>
                <h3 className="level">Question</h3>
                <p className="subtitle">
                  {question?.question ?? "Loading…"}
                </p>

                <div className="controls" style={{ gap: 8 }}>
                  <input
                    type="text"
                    value={answer}
                    placeholder="Your answer…"
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={busy}
                  />
                  <button className="btn btn-blue" onClick={handleSubmit} disabled={busy || !answer.trim()}>
                    Submit
                  </button>
                  <button className="btn btn-ghost" onClick={() => skipOrAdvance(false, "⏭️ Skipped.")} disabled={busy}>
                    Skip
                  </button>
                </div>

                {feedback && <div className="feedback" style={{ marginTop: 10 }}>{feedback}</div>}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
