import React, { useState, useEffect } from "react";

export default function App() {
  const [question, setQuestion] = useState(null);
  const [level, setLevel] = useState(1);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  // Fetch question from backend
  useEffect(() => {
    fetch(`/api/question?level=${level}`)
      .then((res) => res.json())
      .then((data) => setQuestion(data));
  }, [level]);

  const checkAnswer = () => {
    if (answer.trim().toLowerCase() === question.answer.toLowerCase()) {
      setFeedback("✅ Correct! +5 HUG Tokens!");
      setTimeout(() => {
        setFeedback("");
        setAnswer("");
        setLevel((prev) => prev + 1);
      }, 1500);
    } else {
      setFeedback("❌ Try again!");
    }
  };

  if (!question) return <p>Loading...</p>;

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Hugs Trivia</h1>
      <h3>Level {level}</h3>
      <p>{question.question}</p>

      <input
        type="text"
        value={answer}
        placeholder="Your answer..."
        onChange={(e) => setAnswer(e.target.value)}
        style={{ padding: "0.5rem", fontSize: "1rem" }}
      />
      <button onClick={checkAnswer} style={{ marginLeft: "1rem" }}>
        Submit
      </button>

      <p style={{ marginTop: "1rem" }}>{feedback}</p>
    </div>
  );
}
