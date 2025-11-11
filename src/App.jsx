import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { CONFIG } from "./config";
import { getWallet, clearWallet, createTestWallet } from "./wallet";

export default function App() {
  // Game state
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctInRound, setCorrectInRound] = useState(0);

  // Wallet
  const [wallet, setWalletState] = useState(getWallet());

  const roundTarget = useMemo(() => CONFIG.questionsPerRound, []);

  // Keyboard: Enter to start / submit
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Enter") return;
      if (CONFIG.startOnEnter && !started) {
        setStarted(true);
        return;
      }
      if (CONFIG.submitOnEnter && started && answer.trim()) {
        submit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, answer]);

  // Get a question when the game starts or level changes
  useEffect(() => {
    if (!started) return;
    setQuestion(null);
    fetch(`/api/question?level=${level}`)
      .then((r) => r.json())
      .then((data) => setQuestion(data))
      .catch(() =>
        setQuestion({ question: "Failed to load question", answer: "" })
      );
  }, [level, started]);

  // Submit: advance even if wrong (corrects only increment on right answers)
  function submit() {
    if (!question) return;
    const ok =
      answer.trim().toLowerCase() === (question.answer || "").toLowerCase();

    if (ok) {
      setCorrectInRound((c) => c + 1);
      setFeedback("✅ Correct! +5 HUG Tokens (pending)");
    } else {
      setFeedback("❌ Incorrect. Moving on…");
    }

    // advance after a short beat either way
    setTimeout(() => {
      setFeedback("");
      setAnswer("");
      setLevel((prev) => prev + 1);
    }, 900);
  }

  // Manual skip (does not increment correct count)
  function skip() {
    setFeedback("⏭️ Skipped.");
    setTimeout(() => {
      setFeedback("");
      setAnswer("");
      setLevel((prev) => prev + 1);
    }, 500);
  }

  // Pay out after each completed round
  useEffect(() => {
    if (!started) return;
    if (correctInRound > 0 && correctInRound % roundTarget === 0) {
      rewardTokens(wallet?.address || "", CONFIG.tokensPerCorrectRound)
        .then(() =>
          setFeedback(
            `🎉 Level Complete! +${CONFIG.tokensPerCorrectRound} ${CONFIG.tokenCode} awarded.`
          )
        )
        .catch(() =>
          setFeedback("⚠️ Reward queued. (Enable XRPL to pay for real)")
        );
    }
  }, [correctInRound, roundTarget, started, wallet]);

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
                <span className="badge">
                  {CONFIG.secondsPerQuestion}s • {CONFIG.questionsPerRound} Q/Round
                </span>
              </div>
              <div className="hud">
                <span className="badge">
                  Wallet: {wallet?.address ? wallet.address : "—"}
                </span>
                {wallet?.address ? (
                  <button className="btn btn-ghost" onClick={resetWallet}>
                    Remove
                  </button>
                ) : (
                  <button className="btn btn-blue" onClick={makeWallet}>
                    Create Wallet
                  </button>
                )}
              </div>
            </header>

            {/* Title */}
            <h1 className="title">Hugs Trivia</h1>

            {/* Start screen vs Question UI */}
            {!started ? (
              <div className="start-wrap">
                <p className="subtitle">
                  {CONFIG.questionsPerRound} questions • {CONFIG.secondsPerQuestion} seconds each.
                  Earn {CONFIG.tokensPerCorrectRound} {CONFIG.tokenCode} per correct round.
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
                  <button className="btn btn-blue" onClick={submit}>
                    Submit
                  </button>
                  <button className="btn btn-ghost ml-2" onClick={skip} title="Skip this question">
                    Skip
                  </button>
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
