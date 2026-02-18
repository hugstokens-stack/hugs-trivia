import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css'; // Assuming your CSS file is in the same directory

const App = () => {
    const [level, setLevel] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(30);
    const [wallet, setWallet] = useState(0);
    const [hugsBalance, setHugsBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const questionRef = useRef(null);
    
    useEffect(() => {
        loadQuestions();
        // Load HUGS balance from wallet
        loadHugsBalance();
    }, []);
    
    useEffect(() => {
        if (timer > 0) {
            const timerId = setInterval(() => setTimer((t) => t - 1), 1000);
            return () => clearInterval(timerId);
        } else {
            handleQuestionComplete();
        }
    }, [timer]);

    const loadQuestions = async () => {
        // Fetch questions logic
        const fetchedQuestions = await fetchQuestions();
        setQuestions(fetchedQuestions);
    };
    
    const loadHugsBalance = async () => {
        // Logic to load HUGS balance from wallet
        const balance = await fetchHugsBalance();
        setHugsBalance(balance);
    };  
    
    const buyMultipleChoice = (cost) => {
        if (wallet >= cost) {
            setWallet(wallet - cost);
        } else {
            alert("Not enough funds!");
        }
    };

    const isCorrect = (selectedAnswer, correctAnswer) => {
        return selectedAnswer === correctAnswer;
    };
    
    const handleQuestionComplete = () => {
        const currentQuestion = questions[level - 1];
        if (isCorrect(selectedAnswer, currentQuestion.correctAnswer)) {
            setScore(score + 1);
            // Progress to next level
            if (level < questions.length) setLevel(level + 1);
            else levelComplete();
        } else {
            // Handle incorrect answer
            alert('Wrong answer!');
        }
        setTimer(30); // Reset timer
    };

    const levelComplete = () => {
        // Logic for completing the level and distributing rewards
        distributeRewards(score);
        // Reset for the next level
        setLevel(1);
        setScore(0);
    };

    const distributeRewards = (score) => {
        // Logic to reward XLRL based on score
    };

    const renderHistory = () => {
        return history.map((entry, index) => (
            <tr key={index}>
                <td>{entry.question}</td>
                <td>{entry.selectedAnswer}</td>
                <td>{entry.isCorrect ? '✔️' : '❌'}</td>
            </tr>
        ));
    };
    
    const renderUI = () => {
        return (
            <div className="hud">
                <h1>HUGS Trivia Game</h1>
                <h2>Level: {level}</h2>
                <h2>Score: {score}</h2>
                <h2>Wallet: ${wallet}</h2>
                <h2>HUGS Balance: {hugsBalance}</h2>
                <div className="question">{questions[level - 1]?.question}</div>
                {/* Render answer options here */}
                <button className="btn">Submit Answer</button>
                <div className="history-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Your Answer</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>{renderHistory()}</tbody>
                    </table>
                </div>
            </div>
        );
    };

    return <div>{renderUI()}</div>;
};

export default App;