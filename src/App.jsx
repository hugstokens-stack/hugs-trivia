import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { CONFIG } from "./config";
import { getWallet, clearWallet, createTestWallet } from "./wallet";
import { EXTRA_BANK } from "./extras.js";

export default function App() {
  // ---------------- State ----------------
  const [started, setStarted] = useState(false);
  const [pausedBetweenLevels, setPausedBetweenLevels] = useState(false);

  const [level, setLevel] = useState(1);

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [secondsLeft, setSecondsLeft] = useState(CONFIG.secondsPerQuestion);
  const [askedInLevel, setAskedInLevel] = useState(0);          // 0..questionsPerRound
  const [correctInLevel, setCorrectInLevel] = useState(0);      // per-level correct

  // Wallet
  const [wallet, setWalletState] = useState(getWallet());

  // Settings
  const roundTarget = useMemo(() => CONFIG.questionsPerRound, []);
  const perQuestionSeconds = useMemo(() => CONFIG.secondsPerQuestion, []);

  // Refs
  const inputRef = useRef(null);
  const usedIdsRef = useRef(new Set()); // prevent repeats across the whole session

  // ---------------- Helpers ----------------
  function pickLocalQuestion(levelNum) {
    const bank = EXTRA_BANK[levelNum] || [];
    const pool = bank.filter((q) => !usedIdsRef.current.has(q.id));
    if (pool.length === 0 && bank.length > 0) {
      // if exhausted for this level, clear only those IDs from the used set (so repeats reset per level bank)
      bank.forEach((q) => usedIdsRef.current.delete(q.id));
    }
    const finalPool = bank.filter((q) => !usedIdsRef.current.has(q.id));
    if (finalPool.length === 0) return null;
    const q = finalPool[Math.floor(Math.random() * finalPool.length)];
    usedIdsRef.current.add(q.id);
    return q;
  }

  function loadNextQuestion(nextAskedCount) {
    // If the next question would exceed roundTarget, complete the level
    if (nextAskedCount >= roundTarget) {
      completeLevel();
      return;
    }

    // immediate local question (no network stall)
    const local = pickLocalQuestion(level);
    if (local) {
      setQuestion({ id: local.id, question: local.q, answer: Array.isArray(local.a) ? local.a[0] : local.a, answers: local.a });
    } else {
      setQuestion(null);
    }

    // Optional server request for variety—overwrites local when it returns
    fetch(`/api/question?level=${level}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.question) {
          const qid = data.id || `srv-${Date.now()}`;
          if (!usedIdsRef.current.has(qid)) usedIdsRef.current.add(qid);
          setQuestion({ id: qid, question: data.question, answer: data.answer });
        }
      })
      .catch(() => {
        // ignore; local already shown
      });

    // reset UI for the new question
    setAnswer("");
    setFeedback("");
    setSecondsLeft(perQuestionSeconds);
    // focus goes to the input when question state changes (see effect below)
  }

  function startLevel(nextLevel) {
    setLevel(nextLevel);
    setAskedInLevel(0);
    setCorrectInLevel(0);
    setPausedBetweenLevels(false);
    // load first question in the level
    loadNextQuestion(0);
  }

  function completeLevel() {
    // pay only for perfect rounds (7/7) like previous behavior
    if (correctInLevel === roundTarget && wallet?.address) {
      rewardTokens(wallet.address, CONFIG.tokensPerCorrectRound)
        .then(() => setFeedback(`🎉 Level Complete! +${CONFIG.tokensPerCorrectRound} ${CONFIG.tokenCode} awarded.`))
        .catch(() => setFeedback("⚠️ Reward queued. (Enable XRPL to pay for real)"));
    } else {
      setFeedback("⏸️ Level complete. Press Enter to start the next level.");
    }
    setPausedBetweenLevels(true);
    setSecondsLeft(perQuestionSeconds);
  }

  function normalizedCompare(userText, correct) {
    if (!correct) return false;
    const norm = (s) => String(s).trim().toLowerCase();
    const ua = norm(userText);
    if (Array.isArray(correct)) {
      return correct.map(norm).includes(ua);
    }
    return ua === norm(correct);
  }

  function submit() {
    if (!question) return;
    const ok =
      normalizedCompare(answer, question.answer) ||
      (question.answers && normalizedCompare(answer, question.answers));

    let nextAsked = askedInLevel + 1;

    if (ok) {
      setCorrectInLevel((c) => c + 1);
      setFeedback("✅ Correct!");
    } else {
      setFeedback("❌ Incorrect — skipping…");
    }

    // small delay for feedback, then advance
    setTimeout(() => {
      setAskedInLevel(nextAsked);
      loadNextQuestion(nextAsked);
    }, ok ? 550 : 450);
  }

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

  // ---------------- Effects ----------------

  // Global keyboard: Enter to start / submit / advance level
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Enter") return;

      if (!started) {
        // start game
        setStarted(true);
        startLevel(1);
        return;
      }
      if (pausedBetweenLevels) {
        // go to next level
        setFeedback("");
        startLevel(level + 1);
        return;
      }
      // in a question, submit if there is text
      if (answer.trim()) submit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, pausedBetweenLevels, answer, level]);

  // Per-question timer
  useEffect(() => {
    if (!started || pausedBetweenLevels || !question) return;
    if (secondsLeft <= 0) {
      // time's up -> count as wrong and advance
      setFeedback("⏱️ Time's up — skipping…");
      const nextAsked = askedInLevel + 1;
      setTimeout(() => {
        setAskedInLevel(nextAsked);
        loadNextQuestion(nextAsked);
      }, 400);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, started, pausedBetweenLevels, question, askedInLevel]);

  // Auto-focus input whenever a new question lands
  useEffect(() => {
    if (question && inputRef.current) inputRef.current.focus();
  }, [question]);

  // ---------------- Render ----------------
  return (
    <div className="page">
      <div className="scrim" />
      <div className="overlay">
        <main className="app-wrap">
          {/* HUD */}
          <header className="hud" style={{ justifyContent: "space-between" }}>
            <div className="hud">
              <span className="badge">Level {level}</span>
              <span className="badge">{perQuestionSeconds}s • {roundTarget} Q/Round</span>
              <span className="badge">Q {Math.min(askedInLevel + 1, roundTarget)}/{roundTarget}</span>
              {started && !pausedBetweenLevels && (
                <span className="badge">⏱ {secondsLeft}s</span>
              )}
            </div>
            <div className="hud">
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

          {/* Screens */}
          {!started ? (
            <div className="start-wrap">
              <p className="subtitle">
                {roundTarget} questions • {perQuestionSeconds} seconds each. Earn {CONFIG.tokensPerCorrectRound} {CONFIG.tokenCode} for a perfect round.
              </p>
              <p>Press <span className="kbd">Enter</span> to start</p>
              <div style={{ marginTop: "1rem" }}>
                <button className="btn btn-green" onClick={() => { setStarted(true); startLevel(1); }}>
                  Start Game
                </button>
              </div>
            </div>
          ) : pausedBetweenLevels ? (
            <div className="start-wrap">
              <h3 className="level">Level {level} Complete</h3>
              <p className="subtitle">
                Correct: {correctInLevel}/{roundTarget}. {correctInLevel === roundTarget ? `+${CONFIG.tokensPerCorrectRound} ${CONFIG.tokenCode}!` : "No reward this level."}
              </p>
              <p>Press <span className="kbd">Enter</span> to start Level {level + 1}.</p>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && answer.trim()) submit();
                  }}
                />
                <button className="btn btn-blue" onClick={submit}>Submit</button>
              </div>

              {feedback && <div className="feedback">{feedback}</div>}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
