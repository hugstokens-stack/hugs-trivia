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
  const [levelStartTime, setLevelStartTime] = useState(null);

  // wallet + hugs
  const [wallet, setWalletState] = useState(getWallet());
  const [hugsBalance, setHugsBalance] = useState(0);
  const [history, setHistory] = useState([]); // {date, level, correct, duration, hugs}
  const [showHistory, setShowHistory] = useState(false);

  // constants
  const roundTarget = useMemo(() => CONFIG.questionsPerRound, []);
  const perQuestionSeconds = useMemo(() => CONFIG.secondsPerQuestion, []);

  // refs
  const inputRef = useRef(null);
  const usedKeysRef = useRef(new Set());

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 800;

  // HUD question counter (keeps 7/7, no more 9/7 weirdness)
  const currentQNumber = !started
    ? 0
    : pausedBetweenLevels
    ? roundTarget
    : Math.min(askedInLevel + 1, roundTarget);

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

  // load the next question for this level (no round-end logic here)
  function loadNextQuestion() {
    let local = pickFromLevel(level);
    if (!local) {
      // fallback: anywhere, still no repeats
      local = pickAnyUnused();
    }

    if (!local) {
      setQuestion({ question: "Out of questions 🎉", answer: "" });
      setPausedBetweenLevels(true);
      setFeedback("No more unique questions. Press Enter or tap Start to play again.");
      return;
    }

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
    setLevelStartTime(Date.now());
    loadNextQuestion();
  }

  function completeLevel(finalCorrect = correctInLevel) {
    const duration =
      levelStartTime != null
        ? Math.max(
            1,
            Math.round((Date.now() - levelStartTime) / 1000)
          )
        : null;

    const earned =
      finalCorrect === roundTarget ? CONFIG.tokensPerCorrectRound : 0;

    // record in history table
    setHistory((prev) => [
      ...prev,
      {
        date: new Date().toISOString(),
        level,
        correct: finalCorrect,
        duration,
        hugs: earned,
      },
    ]);
    setHugsBalance((prev) => prev + earned);

    if (earned > 0 && wallet?.address) {
      rewardTokens(wallet.address, earned)
        .then(() =>
          setFeedback(
            `🎉 Level Complete! +${earned} ${CONFIG.tokenCode} awarded.`
          )
        )
        .catch(() =>
          setFeedback(
            "⚠️ Level complete. Reward queued (XRPL not configured)."
          )
        );
    } else {
      setFeedback("⏸️ Level complete. Press Enter or tap Next for the next level.");
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
      if (nextAsked >= roundTarget) {
        completeLevel(correctInLevel);
      } else {
        loadNextQuestion();
      }
    }, 220);
  }

  function submit() {
    if (!question) return;

    const ok =
      isCorrect(answer, question.answer) ||
      (question.answers && isCorrect(answer, question.answers));

    const nextAsked = askedInLevel + 1;

    if (ok) {
      const newCorrect = correctInLevel + 1;
      setCorrectInLevel((c) => c + 1);
      setFeedback("✅ Correct!");
      setTimeout(() => {
        setAskedInLevel(nextAsked);
        if (nextAsked >= roundTarget) {
          completeLevel(newCorrect);
        } else {
          loadNextQuestion();
        }
      }, 450);
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

      if (norm(answer).length > 0) {
        submit();
      } else {
        advanceAsWrong();
      }
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
    if (question && inputRef.current) {
      inputRef.current.focus();
    }
  }, [question]);

  // ---------- UI ----------

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
                Q {currentQNumber}/{roundTarget}
              </span>
              {started && !pausedBetweenLevels && question && (
                <span className="badge">⏱ {secondsLeft}s</span>
              )}
            </div>

            <div className="hud">
              <button
                type="button"
                className="badge badge-click"
                onClick={() => setShowHistory((s) => !s)}
              >
                HUGS: {hugsBalance}
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

          {/* START / BETWEEN-LEVEL / QUESTION STATES */}
          {!started ? (
            <div className="start-wrap">
              <p className="subtitle">
                {roundTarget} questions • {perQuestionSeconds} seconds each.
                Earn {CONFIG.tokensPerCorrectRound} {CONFIG.tokenCode} for a perfect round.
              </p>
              <p>
                Press <span className="kbd">Enter</span> to start
              </p>

              {/* Mobile start button */}
              {isMobile && (
                <button
                  className="btn btn-blue mobile-start"
                  onClick={() => {
                    setStarted(true);
                    startLevel(1);
                  }}
                >
                  Start
                </button>
              )}
            </div>
          ) : pausedBetweenLevels ? (
            <div className="start-wrap">
              <h3 className="level">Level {level} Complete</h3>
              <p className="subtitle">
                Correct: {correctInLevel}/{roundTarget}.
              </p>
              <p>
                Press <span className="kbd">Enter</span> for next level.
              </p>

              {/* Mobile next-level button */}
              {isMobile && (
                <button
                  className="btn btn-blue mobile-next"
                  onClick={() => {
                    setFeedback("");
                    startLevel(level + 1);
                  }}
                >
                  Next Level
                </button>
              )}
            </div>
          ) : (
            <>
              <h3 className="level">Question</h3>
              <p className="subtitle">
                {question?.question ?? "Loading…"}
              </p>

              <div className="controls">
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  placeholder="Your answer…"
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <button className="btn btn-blue" onClick={submit}>
                  Submit
                </button>
                {isMobile && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={advanceAsWrong}
                  >
                    Skip
                  </button>
                )}
              </div>

              {feedback && <div className="feedback">{feedback}</div>}
            </>
          )}

          {/* HUGS history panel */}
          {showHistory && (
            <section className="history">
              <h3 className="history-title">Hugs History</h3>
              <p className="history-summary">
                Total HUGS: {hugsBalance}
              </p>
              {history.length === 0 ? (
                <p className="history-empty">
                  Play a perfect round to earn your first HUGS.
                </p>
              ) : (
                <div className="history-table-wrap">
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
                      {history.map((row, i) => (
                        <tr key={i}>
                          <td>
                            {new Date(row.date).toLocaleString(undefined, {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>{row.level}</td>
                          <td>
                            {row.correct}/{roundTarget}
                          </td>
                          <td>{row.duration ?? "—"}s</td>
                          <td>{row.hugs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
