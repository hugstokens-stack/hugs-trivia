import React, { useState, useEffect } from 'react';
import { config } from './config';
import { Wallet } from './wallet';
import { extras } from './extras';

const App = () => {
    const [state, setState] = useState({
        currentLevel: 0,
        score: 0,
        questions: [],
        currentQuestionIndex: 0,
        timer: 30,
        feedback: '',
        gameState: 'start', // start, question, levelcomplete, history
        history: []
    });

    useEffect(() => {
        loadQuestions();
    }, []);

    useEffect(() => {
        const timerId = setInterval(() => {
            if (state.timer > 0) {
                setState(prev => ({ ...prev, timer: prev.timer - 1 }));
            } else {
                clearInterval(timerId);
                validateAnswer();
            }
        }, 1000);
        return () => clearInterval(timerId);
    }, [state.timer]);

    const loadQuestions = () => {
        // Load your questions from config/extras here
        const questions = config.questions;
        setState(prev => ({ ...prev, questions }));
    };

    const startGame = () => {
        setState({...state, gameState: 'question', currentQuestionIndex: 0, timer: 30, feedback: '' });
    };

    const validateAnswer = (answer) => {
        const currentQuestion = state.questions[state.currentQuestionIndex];
        const isCorrect = currentQuestion.correctAnswer === answer;
        if (isCorrect) {
            setState(prevState => ({
                ...prevState,
                score: prevState.score + 1,
                feedback: 'Correct!'
            }));
            buyMultipleChoice();
            nextQuestion();
        } else {
            setState(prevState => ({
                ...prevState,
                feedback: 'Incorrect!'
            }));
        }
    };

    const buyMultipleChoice = () => {
        // Implement wallet integration here
        Wallet.buy({ amount: 1 });
    };

    const nextQuestion = () => {
        if (state.currentQuestionIndex < state.questions.length - 1) {
            setState(prev => ({
                ...prev,
                currentQuestionIndex: prev.currentQuestionIndex + 1,
                timer: 30,
                feedback: ''
            }));
        } else {
            // Logic for level complete
            setState({ ...state, gameState: 'levelcomplete' });
        }
    };

    return (
        <div className="app-wrap">
            <div className="overlay">
                <div className="gold-panel centered">
                    {state.gameState === 'start' && <button onClick={startGame}>Start Game</button>}
                    {state.gameState === 'question' && (
                        <div>
                            <h1>{state.questions[state.currentQuestionIndex].question}</h1>
                            <div className="controls">
                                {state.questions[state.currentQuestionIndex].options.map(option => (
                                    <button key={option} onClick={() => validateAnswer(option)}>{option}</button>
                                ))}
                            </div>
                            <p>{state.feedback}</p>
                            <p>Time left: {state.timer}</p>
                        </div>
                    )}
                    {state.gameState === 'levelcomplete' && <div>Your Score: {state.score}</div>}
                    {state.gameState === 'history' && <div>Your History: {JSON.stringify(state.history)}</div>}
                </div>
                {/* Add additional UI elements and styling as needed */}
            </div>
        </div>
    );
};

export default App;