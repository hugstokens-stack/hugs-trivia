import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { CONFIG } from "./config";
import { getWallet, clearWallet, createTestWallet } from "./wallet";
import { EXTRA_BANK } from "./extras.js";

export default function App() {
  // -------- game state --------
  const [started, setStarted] = useState(false);
  const [pausedBetweenLevels, setPausedBetweenLevels] = useState(false);
  const [level, setLevel] = useState(1);

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [secondsLeft, setSecondsLeft] = useState(CONFIG.secondsPerQuestion);
  const [askedInLevel, setAskedInLevel] = useState(0);
  const [correctInLevel, setCorrectInLevel] = useState(0);

  // wallet
  const [wallet, setWalletState] = useState(getWallet());

  // rewards / history
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]); // {ts, level, correct, durationSec, tokens}
  const levelStartRef = useRef(null);
  const balance = useMemo(
    () => history.reduce((s, h) => s + (h.tokens || 0), 0),
    [history]
  );

  // constants
  const roundTarget = useMemo(() => CONFIG.questionsPerRound, []);
  const perQuestionSeconds = useMemo(() => CONFIG.secondsPerQuestion, []);

  // refs
  const inputRef = useRef(null);
  const usedKeysRef = useRef(new Set()); // global no-repeat across the whole session

  // -------- helpers --------
  const norm = (s) => String(s ?? "").trim().toLowerCase();
  const keyFor = (q) =>
    `${norm(q.q || q.question)}|${
      Array.isArray(q.a || q.answers)
        ? (q.a || q.answers).map(norm).sort().join(",")
        : norm(q.a || q.answer)
    }`;

  function pickFromLevel(lvl) {
    const bank = EXTRA_BANK[lvl] || [];
    const pool = bank.filter((q) => !usedKeysRef.current.has(keyFor(q)));
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function pickAnyUnused() {
    for (const lvl of Object.keys(EXTRA_BANK).map((n) => +n)) {
      const c = pickFromLevel(lvl);
      if (c) return c;
    }
    return null;
  }

  function loadNextQuestion(nextAskedCount) {
    // round finished? — stop here (prevents 9/7)
    if (nextAskedCount >= roundTarget) {
      completeLevel();
      return;
    }

    // try same-level first
    let local = pickFromLevel(level);
    if (!local) local = pickAnyUnused(); // fallback anywhere, still no repeats

    if (!local) {
      setQuestion({ question: "Out of questions 🎉", answer: "" });
      setPausedBetweenLevels(true);
      setFeedback("No more unique questions. Press Enter to start over.");
      return;
    }

    // register and show
    usedKeysRef.current.add(keyFor(local));
    setQuestion({ question: local.q, answer: local.a, answers: local.a });
    setAnswer("");
    setFeedback("");
    setSecondsLeft(perQuestionSeconds);
  }

  function startLevel(nextLevel) {
    setLevel(nextLevel);
    setAskedInLevel(0);
    setCorrectInLevel(0);
    setPausedBetweenLevels(false);
    levelStartRef.current = Date.now();
    loadNextQuestion(0);
  }

  async function rewardTokens(address, amount) {
    const res = await fetch("/api/reward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, amount, token: CONFIG.tokenCode }),
    });
    if (!res.ok) throw new Error("reward failed");
    return res.json();
  }

  function completeLevel() {
    const durationSec = levelStartRef.current
      ? Math.max(1, Math.round((Date.now() - levelStartRef.current) / 1000))
      : 0;

    const perfect = correctInLevel === roundTarget && wallet?.address;
    const tokens = perfect ? CONFIG.tokensPerCorrectRound : 0;

    if (perfect) {
      rewardTokens(wallet.address, tokens)
        .then(() => {
          setFeedback(
            `🎉 Level Complete! +${CONFIG.tokensPerCorrectRound} ${CONFIG.tokenCode} awarded.`
          );
          setHistory((h) => [
            { ts: Date.now(), level, correct: correctInLevel, durationSec, tokens },
            ...h,
          ]);
        })
        .catch(() => {
          setFeedback("⚠️ Reward queued. (Enable XRPL to pay for real)");
          setHistory((h) => [
            { ts: Date.now(), level, correct: correctInLevel, durationSec, tokens: 0 },
            ...h,
          ]);
        });
    } else {
      setFeedback("⏸️ Level complete. Press Enter for the next level.");
      setHistory((h) => [
        { ts: Date.now(), level, correct: correctInLevel, durationSec, tokens: 0 },
        ...h,
      ]);
    }

    setPausedBetweenLevels(true);
    setSecondsLeft(perQuestionSeconds);
  }

  function isCorrect(user, correct) {
    const U = norm(user);
    if (Array.isArray(correct)) return correct.map(norm).includes(U);
    return U === norm(correct);
  }

  function advanceAsWrong() {
    setFeedback("❌ Skipping…");
    const nextAsked = askedInLevel + 1;
    setTimeout(() => {
      setAskedInLevel(nextAsked);
      loadNextQuestion(nextAsked);
    }, 220);
  }

  function submit() {
    if (!question) return;
    const ok =
      isCorrect(answer, question.answer) ||
      (question.answers && isCorrect(answer, question.answers));

    const nextAsked = askedInLevel + 1;

    if (ok) {
      setCorrectInLevel((c) => c + 1);
      setFeedback("✅ Correct!");
      setTimeout(() => {
        setAskedInLevel(nextAsked);
        loadNextQuestion(nextAsked);
      }, 420);
    } else {
      advanceAsWrong();
    }
  }

  async function makeWallet() {
    const w = await createTestWallet();
    setWalletState(w);
  }
  function resetWallet() {
    clearWallet();
    setWalletState(null);
  }

  // -------- key handling (Enter everywhere) --------
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Enter") return;

      if (!started) {
        setStarted(true);
        startLevel(1);
        return;
      }
      if (pausedBetweenLevels) {
        setFeedback("");
        startLevel(level + 1);
        return;
      }
      if (!question) return;

      if (norm(answer).length > 0) submit();
      else advanceAsWrong();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, pausedBetweenLevels, level, question, answer]);

  // -------- timer per question --------
  useEffect(() => {
    if (!started || pausedBetweenLevels || !question) return;
    if (secondsLeft <= 0) {
      advanceAsWrong();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, started, pausedBetweenLevels, question]);

  // auto focus input on new question
  useEffect(() => {
    if (question && inputRef.current) inputRef.current.focus();
  }, [question]);

  // -------- UI --------
  return (
    <div className="page">
      <div className="scrim" />
      <div className="overlay">
        <main className="app-wrap">
          {/* HUD */}
          <header className="hud" style={{ justifyContent: "space-between" }}>
            <div className="hud">
              <span className="badge">Level {level}</span>
              <span className="badge">
                {perQuestionSeconds}s • {roundTarget} Q/Round
              </span>
              <span className="badge">
                Q {Math.min(askedInLevel + 1, roundTarget)}/{roundTarget}
              </span>
              {started && !pausedBetweenLevels && (
                <span className="badge">⏱ {secondsLeft}s</span>
              )}
            </div>

            <div className="hud">
              <button
                className="btn btn-gold"
                onClick={() => setHistoryOpen(true)}
                title="View rewards and game history"
              >
                {CONFIG.tokenCode}: {balance}
              </button>
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

          <h1 className="title">22 Seconds</h1>

          {!started ? (
            <div className="start-wrap">
              <p className="subtitle">
                {roundTarget} questions • {perQuestionSeconds} seconds each. Earn{" "}
                {CONFIG.tokensPerCorrectRound} {CONFIG.tokenCode} for a perfect round.
              </p>
              <p>
                Press <span className="kbd">Enter</span> to start
              </p>
            </div>
          ) : pausedBetweenLevels ? (
            <div className="start-wrap">
              <h3 className="level">Level {level} Complete</h3>
              <p className="subtitle">
                Correct: {correctInLevel}/{roundTarget}.
              </p>
              <p>
                Press <span className="kbd">Enter</span> to start Level {level + 1}.
              </p>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (norm(answer).length > 0) submit();
                      else advanceAsWrong();
                    }
                  }}
                />
                <button className="btn btn-blue" onClick={submit}>
                  Submit
                </button>
              </div>

              {feedback && <div className="feedback">{feedback}</div>}
            </>
          )}

          {/* History modal */}
          {historyOpen && (
            <div className="modal">
              <div className="modal-card">
                <div className="modal-head">
                  <h3>Hugs History</h3>
                  <button className="btn btn-ghost" onClick={() => setHistoryOpen(false)}>
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <div className="summary">
                    <strong>Total {CONFIG.tokenCode}:</strong> {balance}
                  </div>
                  {history.length === 0 ? (
                    <p>No games recorded yet.</p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Level</th>
                          <th>Correct</th>
                          <th>Duration</th>
                          <th>{CONFIG.tokenCode}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h, i) => (
                          <tr key={i}>
                            <td>{new Date(h.ts).toLocaleString()}</td>
                            <td>{h.level}</td>
                            <td>
                              {h.correct}/{roundTarget}
                            </td>
                            <td>{h.durationSec}s</td>
                            <td>{h.tokens}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
