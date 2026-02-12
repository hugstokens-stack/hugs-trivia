import React, { useEffect, useMemo, useRef, useState } from "react";

/** Point to your Flask backend */
const API = "http://127.0.0.1:5000";

type Wallet = { address?: string; seed?: string } | null;

type Q = { q: string; a: string[] };

/** Question bank (level 1 sample) */
const BANK: Record<number, Q[]> = {
  1: [
    { q: "Which galaxy is Earth in?", a: ["milky way", "the milky way"] },
    { q: "What color is the sky on a clear day?", a: ["blue"] },
    { q: "How many days are in a week?", a: ["7", "seven"] },
    { q: "What do bees make?", a: ["honey"] },
    { q: "What planet do we live on?", a: ["earth"] },
    { q: "Primary color that mixes with yellow to make green?", a: ["blue"] },
    { q: "Opposite of hot?", a: ["cold"] },
  ],
};

const SECONDS_PER_QUESTION = 22;
const QUESTIONS_PER_ROUND = 7;
const PASS_SCORE = 5;
/** If you later wire payouts, use this value */
const REWARD_PER_WIN = 5;

type Phase = "idle" | "question" | "done";

/** Util: normalize answers */
const normalize = (s: string) =>
  s.toLowerCase().trim().replace(/[^\p{L}\p{N}\s]/gu, "");

export default function XrpTriviaUiSkeleton() {
  // XRPL bits
  const [wallet, setWallet] = useState<Wallet>(null);
  const [balance, setBalance] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Game bits
  const [phase, setPhase] = useState<Phase>("idle");
  const [level] = useState<number>(1);
  const [round] = useState<number>(1);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [i, setI] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [secs, setSecs] = useState<number>(SECONDS_PER_QUESTION);
  const [answer, setAnswer] = useState<string>("");

  const timerRef = useRef<number | null>(null);

  /** Start a fresh round */
  const startRound = () => {
    if (!wallet?.address) {
      setMsg("Create a wallet first (testnet).");
      return;
    }
    const pool = BANK[level] ?? [];
    // simple shuffle + take N
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, QUESTIONS_PER_ROUND));
    setI(0);
    setScore(0);
    setAnswer("");
    setSecs(SECONDS_PER_QUESTION);
    setPhase("question");
  };

  /** Advance to next question or finish */
  const next = () => {
    if (i + 1 >= questions.length) {
      stopTimer();
      setPhase("done");
    } else {
      setI((x) => x + 1);
      setAnswer("");
      setSecs(SECONDS_PER_QUESTION);
    }
  };

  /** Timer control */
  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    stopTimer();
    if (phase === "question") {
      timerRef.current = window.setInterval(() => {
        setSecs((s) => {
          if (s <= 1) {
            // time up -> advance
            window.setTimeout(() => next(), 0);
            return SECONDS_PER_QUESTION; // will be reset on next question
          }
          return s - 1;
        });
      }, 1000);
    }
    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i]);

  /** Submit */
  const submit = () => {
    if (phase !== "question") return;
    const correctSet = new Set(questions[i].a.map(normalize));
    if (correctSet.has(normalize(answer))) {
      setScore((s) => s + 1);
    }
    next();
  };

  /** XRPL helpers */
  const getBalance = async (address?: string) => {
    try {
      if (!address) return;
      const res = await fetch(`${API}/api/get_balance?address=${address}`);
      const data = await res.json();
      if (data.ok) setBalance(Number(data.balance) || 0);
    } catch {
      /* ignore for now */
    }
  };

  const createWallet = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`${API}/api/create_wallet`, { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "create_wallet failed");
      setWallet({ address: data.address, seed: data.seed });
      setMsg("Wallet created!");
      await getBalance(data.address);
    } catch (e: any) {
      setMsg(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  /** UI pieces */
  const Header = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>⏱️ 22 Seconds — 100 Levels</h1>
      <div className="text-sm mt-2">
        <strong>Wallet:</strong> {wallet?.address ? wallet.address : "None"}&nbsp;
        <strong>HUGS:</strong> {balance}
        <button onClick={createWallet} className="ml-3 bg-blue-600 text-white px-2 py-1 rounded" disabled={busy}>
          Create Wallet
        </button>
        <button
          onClick={() => getBalance(wallet?.address)}
          className="ml-2 bg-green-600 text-white px-2 py-1 rounded"
          disabled={!wallet?.address || busy}
        >
          Refresh
        </button>
      </div>
    </div>
  );

  const IdleCard = () => (
    <div className="overlay">
      <Header />
      <div style={{ opacity: 0.9, marginTop: 6 }}>Level {level} · Round {round}</div>

      <h3 className="mt-3 mb-2">Test your knowledge and climb the leaderboard. {QUESTIONS_PER_ROUND} questions • {SECONDS_PER_QUESTION} seconds each.</h3>

      <button
        className="btn-primary"
        onClick={startRound}
        disabled={!wallet?.address || busy}
        title={!wallet?.address ? "Create a wallet first" : ""}
      >
        Start Game
      </button>

      {msg && <div className="mt-2 text-sm">{msg}</div>}

      {!!wallet?.seed && (
        <details className="mt-2 text-sm">
          <summary>Show seed (testnet only)</summary>
          <code style={{ display: "block", marginTop: 6, wordBreak: "break-all" }}>{wallet.seed}</code>
        </details>
      )}
    </div>
  );

  const QuestionCard = () => (
    <div className="overlay">
      <Header />
      <div className="meta mt-2">
        <strong>Question {i + 1} / {questions.length}</strong> • Score {score} • Time {secs}s
      </div>

      <div className="q mt-3">{questions[i].q}</div>

      <div className="mt-2">
        <input
          className="input"
          placeholder="Type your answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
        />
        <button className="btn-primary ml-2" onClick={submit}>Submit</button>
      </div>
    </div>
  );

  const DoneCard = () => (
    <div className="overlay">
      <Header />
      <h2 className="mt-3 mb-2">Round Complete</h2>
      <div className="mt-1">Score: {score} / {questions.length}</div>
      <div className="mt-1">
        {score >= PASS_SCORE
          ? `Nice! You passed (≥ ${PASS_SCORE}). (Next: wire payout of ${REWARD_PER_WIN} HUGS.)`
          : `Keep practicing. You need ${PASS_SCORE} or better to pass.`}
      </div>
      <button className="btn-primary mt-3" onClick={() => setPhase("idle")}>Play Again</button>
    </div>
  );

  return (
    <div className="page">
      {phase === "idle" && <IdleCard />}
      {phase === "question" && questions.length > 0 && <QuestionCard />}
      {phase === "done" && <DoneCard />}
    </div>
  );
}
