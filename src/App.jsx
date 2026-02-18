import React, { useState } from 'react';
import './App.css';

function App() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);

    const buyMultipleChoice = () => {
        // Logic to buy multiple choices
    };

    const isCorrect = (selectedAnswer) => {
        return questions[currentQuestionIndex].correctAnswer === selectedAnswer;
    };

    const handleAnswerSelect = (selectedAnswer) => {
        if (isCorrect(selectedAnswer)) {
            setScore(score + 1);
        }
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    };

    return (
        <div className="App">  
            {questions.length > 0 ? (
                <div>
                    <h1>{questions[currentQuestionIndex].question}</h1>
                    <div className="answers">
                        {questions[currentQuestionIndex].answers.map((answer, index) => (
                            <button key={index} onClick={() => handleAnswerSelect(answer)}>{answer}</button>
                        ))}
                    </div>
                </div>
            ) : (
                <p>Loading questions...</p>
            )}
           {/* Add the buy multiple choice feature here */}
           <button onClick={buyMultipleChoice}>Buy Multiple Choices</button>
        </div>
    );
}

export default App;