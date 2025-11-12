import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { CONFIG } from "./config";
import { getWallet, clearWallet, createTestWallet } from "./wallet";
import { EXTRA_BANK } from "./extras.js";

export default function App() {
  // ---------- game state ----------
  const [started, setStarted] = useState(false);
  const [pausedBetweenLevels, setPausedBetweenLevels] = useState(false);
  const [level, setLevel] = useState(1);

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [secondsLeft, setSecondsLeft] = useState(CONFIG.secondsPerQuestion);
  const [askedInLevel, setAskedInLevel] = useState(0);
  const [correctInLevel, setCorrectInLevel] = useState(0);

  const [wallet, setWalletState] = useState(getWallet());
  const [showHistory, setShowHistory] = useState(false);
  const [totalHugs, setTotalHugs] = useState(
    () => Number(localStorage.getItem("total_hugs") || 0)
  );

  // constants
  const roundTarget = useMemo(() => CONFIG.questionsPerRound, []);
  const perQuestionSeconds = useMemo(() => CONFIG.secondsPerQuestion, []);

  // refs
  const inputRef = useRef(null);

  // global no-repeat across the session
  const usedKeysRef = useRef(new Set());

  // ---------- helpers ----------
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
    // End of round?
    if (nextAskedCount >= roundTarget) {
      completeLevel();
      return;
    }

    // try same-level first, then any unused
    let local = pickFromLevel(level);
    if (!local) local = pickAnyUnused();

    if (!local) {
      setQuestion({ question: "Out of questions 🎉", answer: "" });
      setPausedBetweenLevels(true);
      setFeedback("No more unique questions. Press Enter to start over.");
      return;
    }

    // register no-repeat and show
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

  function addHistoryRow(okCount) {
    const row = {
      ts: Date.now(),
      level,
      correct: okCount,
      total: roundTarget,
      duration: roundTarget * perQuestionSeconds,
      hugs: okCount === roundTarget ? CONFIG.tokensPerCorrectRound : 0,
    };
    const prev = JSON.parse(localStorage.getItem("hugs_history") || "[]");
    prev.unshift(row);
    localStorage.setItem("hugs_history", JSON.stringify(prev));
    if (row.hugs) {
      const newTotal = Number(localStorage.getItem("total_hugs") || 0) + row.hugs;
      localStorage.setItem("total_hugs", String(newTotal));
      setTotalHugs(newTotal);
    }
  }

  function completeLevel() {
    addHistoryRow(correctInLevel);

    if (correctInLevel === roundTarget && wallet?.address) {
      rewardTokens(wallet.address, CONFIG.tokensPerCorrectRound)
        .then(() =>
          setFeedback(
            `🎉 Level Complete! +${CONFIG.tokensPerCorrectRound} ${CONFIG.tokenCode} awarded.`
          )
        )
        .catch(() =>
          setFeedback("⚠️ Reward queued. (Enable XRPL to pay for real)")
        );
    } else {
      setFeedback("⏸️ Level complete. Press Enter for the next level.");
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
      }, 300);
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

  // ---------- effects ----------

  // Global Enter handling:
  // - Not started -> start game
  // - Between levels -> start next level
  // - During question:
  //     Enter with text => submit
  //     Enter empty     => skip
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

  // Auto-focus the input on new question
  useEffect(() => {
    if (question && inputRef.current) inputRef.current.focus();
  }, [question]);

  // ---------- UI ----------
  const history = JSON.parse(localStorage.getItem("hugs_history") || "[]");

  return (
    <div className="page">
      <div className="scrim" />

      {/* GOLD CARD */}
      <div className="overlay">
        {/* Bulb edge strips (top/right/bottom/left) */}
        <div className="bulbs top" aria-hidden />
        <div className="bulbs right" aria-hidden />
        <div className="bulbs bottom" aria-hidden />
        <div className="bulbs left" aria-hidden />

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
                aria-expanded={showHistory}
                aria-controls="hugs-history"
              >
                HUGS: {totalHugs}
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
                  enterKeyHint="go"
                  inputMode="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label="Your trivia answer"
                  onFocus={() => {
                    setTimeout(
                      () =>
                        inputRef.current?.scrollIntoView({
                          block: "center",
                          behavior: "smooth",
                        }),
                      250
                    );
                  }}
                />
                <button className="btn btn-blue" onClick={submit}>
                  Submit
                </button>
              </div>

              {/* Mobile-friendly action row */}
              <div className="mobile-actions">
                <button className="btn btn-blue" onClick={submit}>
                  Submit
                </button>
                <button className="btn btn-green" onClick={advanceAsWrong}>
                  Skip
                </button>
              </div>

              {feedback && <div className="feedback">{feedback}</div>}
            </>
          )}

          {/* History panel */}
          {showHistory && (
            <section id="hugs-history" className="history">
              <div className="history-head">
                <strong>Hugs History</strong>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowHistory(false)}
                  aria-label="Close history"
                >
                  ✕
                </button>
              </div>
              <div className="history-total">Total HUGS: {totalHugs}</div>
              {history.length === 0 ? (
                <div className="muted">No games yet.</div>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Level</th>
                      <th>Correct</th>
                      <th>Duration</th>
                      <th>HUGS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r, i) => (
                      <tr key={i}>
                        <td>{new Date(r.ts).toLocaleString()}</td>
                        <td>{r.level}</td>
                        <td>
                          {r.correct}/{r.total}
                        </td>
                        <td>{r.duration}s</td>
                        <td>{r.hugs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
