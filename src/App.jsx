import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { CONFIG } from "./config";
import { getWallet, clearWallet, createTestWallet } from "./wallet";
import { EXTRA_BANK } from "./extras.js";

export default function App() {
  // ----------------- GAME STATE -----------------
  const [started, setStarted] = useState(false);
  const [pausedBetweenLevels, setPausedBetweenLevels] = useState(false);
  const [level, setLevel] = useState(1);

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [secondsLeft, setSecondsLeft] = useState(CONFIG.secondsPerQuestion);
  const [askedInLevel, setAskedInLevel] = useState(0);
  const [correctInLevel, setCorrectInLevel] = useState(0);

  // wallet + rewards
  const [wallet, setWalletState] = useState(getWallet());
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hugsHistory") || "[]");
    } catch {
      return [];
    }
  });

  // constants
  const roundTarget = useMemo(() => CONFIG.questionsPerRound, []);
  const perQuestionSeconds = useMemo(() => CONFIG.secondsPerQuestion, []);

  // refs
  const inputRef = useRef(null);

  // global no-repeat set across the whole session (across all levels)
  const usedKeysRef = useRef(new Set());

  // ----------------- HELPERS -----------------
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
    // round finished?
    if (nextAskedCount >= roundTarget) {
      completeLevel();
      // reset *per-round* counters to prevent the 9/7 overflow display
      setAskedInLevel(0);
      setCorrectInLevel((c) => c); // keep score for summary; reset when next level starts
      setSecondsLeft(perQuestionSeconds);
      setPausedBetweenLevels(true);
      return;
    }

    // try same-level first
    let local = pickFromLevel(level);
    if (!local) {
      // fallback anywhere, still no repeats
      local = pickAnyUnused();
    }

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
    loadNextQuestion(0);
  }

  function appendHistory(row) {
    const next = [row, ...history].slice(0, 200); // keep it tidy
    setHistory(next);
    localStorage.setItem("hugsHistory", JSON.stringify(next));
  }

  async function completeLevel() {
    // record a row in history
    const row = {
      ts: Date.now(),
      level,
      correct: correctInLevel,
      of: roundTarget,
      durationSec: roundTarget * perQuestionSeconds,
      hugs: 0,
    };

    if (correctInLevel === roundTarget && wallet?.address) {
      try {
        await rewardTokens(wallet.address, CONFIG.tokensPerCorrectRound);
        row.hugs = CONFIG.tokensPerCorrectRound;
        setFeedback(`🎉 Level Complete! +${CONFIG.tokensPerCorrectRound} ${CONFIG.tokenCode} awarded.`);
      } catch {
        setFeedback("⚠️ Reward queued. (Enable XRPL to pay for real)");
      }
    } else {
      setFeedback("⏸️ Level complete. Press Enter for the next level.");
    }

    appendHistory(row);
  }

  function hugsTotal() {
    return history.reduce((sum, r) => sum + (r.hugs || 0), 0);
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
      }, 350);
    } else {
      advanceAsWrong();
    }
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

  async function makeWallet() {
    const w = await createTestWallet();
    setWalletState(w);
  }
  function resetWallet() {
    clearWallet();
    setWalletState(null);
  }

  // ----------------- EFFECTS -----------------

  // Global Enter handling
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

  // Per-question countdown
  useEffect(() => {
    if (!started || pausedBetweenLevels || !question) return;
    if (secondsLeft <= 0) {
      advanceAsWrong();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, started, pausedBetweenLevels, question]);

  // Auto-focus the input whenever a new question arrives
  useEffect(() => {
    if (question && inputRef.current) inputRef.current.focus();
  }, [question]);

  // ----------------- UI -----------------
  return (
    <div className="page">
      {/* Background scrim */}
      <div className="scrim" />

      {/* Neon marquee frame */}
      <div className="marquee">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={`t-${i}`} className={`marquee__bulb marquee__bulb--t`} />
        ))}
        {Array.from({ length: 28 }).map((_, i) => (
          <span key={`r-${i}`} className={`marquee__bulb marquee__bulb--r`} />
        ))}
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={`b-${i}`} className={`marquee__bulb marquee__bulb--b`} />
        ))}
        {Array.from({ length: 28 }).map((_, i) => (
          <span key={`l-${i}`} className={`marquee__bulb marquee__bulb--l`} />
        ))}
      </div>

      {/* Gold panel */}
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
                className="btn btn-ghost"
                onClick={() => setShowHistory((v) => !v)}
                title="Toggle Hugs History"
              >
                HUGS: {hugsTotal()}
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

          {/* History panel */}
          {showHistory && (
            <div className="history">
              <div className="history__head">
                <h3>Hugs History</h3>
                <button className="btn btn-ghost" onClick={() => setShowHistory(false)}>✕</button>
              </div>
              <div className="history__totals">Total HUGS: {hugsTotal()}</div>
              <div className="history__table">
                <div className="history__row history__row--h">
                  <div>Date</div>
                  <div>Level</div>
                  <div>Correct</div>
                  <div>Duration</div>
                  <div>HUGS</div>
                </div>
                {history.map((r, idx) => (
                  <div key={idx} className="history__row">
                    <div>{new Date(r.ts).toLocaleString()}</div>
                    <div>{r.level}</div>
                    <div>
                      {r.correct}/{r.of}
                    </div>
                    <div>{r.durationSec}s</div>
                    <div>{r.hugs}</div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="history__empty">No games yet — win a perfect round to earn HUGS!</div>
                )}
              </div>
            </div>
          )}

          {/* Game states */}
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
        </main>
      </div>
    </div>
  );
}
