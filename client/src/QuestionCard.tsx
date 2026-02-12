// client/src/QuestionCard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PER_ROUND, QUESTION_SECONDS, getRoundQuestions, QA } from "./questionBank";

type Props = { level: number; onFinish: (correctCount: number) => void; };

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function QuestionCard({ level, onFinish }: Props) {
  // Fetch a fresh, non-repeating 7-pack for this level
  const questions: QA[] = useMemo(() => getRoundQuestions(level), [level]);

  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(QUESTION_SECONDS);

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  // countdown
  useEffect(() => {
    if (seconds <= 0) { submit(); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  function submit() {
    if (!questions.length) { onFinish(0); return; }
    const qa = questions[idx];
    const user = norm(answer);
    const ok = Array.isArray(qa.a) ? qa.a.map(norm).includes(user) : norm(String(qa.a)) === user;
    if (ok) setCorrect(c => c + 1);

    const next = idx + 1;
    if (next >= questions.length) {
      // Finish this round and let App show Next-Level button
      onFinish((ok ? correct + 1 : correct));
    } else {
      setIdx(next);
      setAnswer("");
      setSeconds(QUESTION_SECONDS);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); submit(); }
  }

  if (!questions.length) {
    // Safety: if bank is empty, end round immediately
    useEffect(() => { onFinish(0); }, []); // one-shot
    return <div>No questions available for this difficulty yet.</div>;
  }

  const cur = questions[idx];

  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        <strong>Q {idx + 1}/{Math.min(PER_ROUND, questions.length)}</strong>
        <span> • Timer: {seconds}s</span>
        <span> &nbsp; Correct: {correct}</span>
      </div>

      <div style={{ margin: "8px 0" }}>{cur.q}</div>

      <input
        ref={inputRef}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="type your answer"
        style={{ width: 260 }}
      />
      <button style={{ marginLeft: 8 }} onClick={submit}>Submit</button>
    </div>
  );
}
