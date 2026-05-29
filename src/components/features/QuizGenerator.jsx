"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { BrainCircuit, CheckCircle2, XCircle, RotateCcw, Zap } from 'lucide-react';
import CustomDropdown from '../layout/CustomDropdown';
import './FeatureStyles.css';

const QuizGenerator = () => {
    const { quizBank, subjects } = mockBackend;
    const [selectedSubject, setSelectedSubject] = useState('');
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    const [filteredQuestions, setFilteredQuestions] = useState([]);

    const startQuiz = () => {
        const qs = selectedSubject ? quizBank.filter(q => q.subject === selectedSubject) : [...quizBank];
        // Shuffle
        for (let i = qs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [qs[i], qs[j]] = [qs[j], qs[i]];
        }
        setFilteredQuestions(qs.slice(0, 5));
        setQuizStarted(true);
        setCurrentQ(0);
        setScore(0);
        setQuizFinished(false);
    };

    const handleAnswer = (idx) => {
        if (answered) return;
        setSelectedAnswer(idx);
        setAnswered(true);
        if (idx === filteredQuestions[currentQ].correct) setScore(s => s + 1);
    };

    const nextQuestion = () => {
        if (currentQ + 1 >= filteredQuestions.length) {
            setQuizFinished(true);
        } else {
            setCurrentQ(c => c + 1);
            setSelectedAnswer(null);
            setAnswered(false);
        }
    };

    const q = filteredQuestions[currentQ];

    return (
        <div className="quiz-container animate-enter" style={{ padding: '2rem' }}>
            <header className="feature-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>AI Quiz Generator</h1>
                    <p>Auto-generated from your syllabus and PYQs</p>
                </div>
                <div className="ai-status"><BrainCircuit className="pulse-icon" /> <span>Smart Mode</span></div>
            </header>

            {!quizStarted ? (
                <div className="quiz-setup">
                    <h2>Configure Your Quiz</h2>
                    <div className="setup-grid">
                        <div className="setup-option" style={{ width: '100%', maxWidth: '300px' }}>
                            <CustomDropdown
                                label="Subject"
                                options={['All Subjects (Random)', ...subjects]}
                                value={selectedSubject || 'All Subjects (Random)'}
                                onChange={(val) => setSelectedSubject(val === 'All Subjects (Random)' ? '' : val)}
                                placeholder="Select Subject"
                            />
                        </div>
                        <div className="setup-option">
                            <label>Questions</label>
                            <span className="setup-value">5 Questions</span>
                        </div>
                        <div className="setup-option">
                            <label>Difficulty</label>
                            <span className="setup-value">Adaptive</span>
                        </div>
                    </div>
                    <button className="primary-btn-brutal" onClick={startQuiz} style={{ marginTop: '2rem' }}>
                        <Zap size={18} /> Start Quiz
                    </button>
                </div>
            ) : quizFinished ? (
                <div className="quiz-result">
                    <div className="result-card">
                        <h2>Quiz Complete!</h2>
                        <div className="score-circle">
                            <span className="score-num">{score}</span>
                            <span className="score-den">/ {filteredQuestions.length}</span>
                        </div>
                        <p className="score-label">
                            {score === filteredQuestions.length ? '🏆 Perfect Score!' :
                                score >= filteredQuestions.length * 0.7 ? '🎯 Great Job!' : '📚 Keep Practicing!'}
                        </p>
                        <p className="xp-earned">+{score * 20} XP Earned</p>
                        <button className="primary-btn-brutal" onClick={() => { setQuizStarted(false); setSelectedAnswer(null); setAnswered(false); }}>
                            <RotateCcw size={16} /> Try Again
                        </button>
                    </div>
                </div>
            ) : (
                <div className="quiz-active">
                    <div className="quiz-progress">
                        <span>Question {currentQ + 1} of {filteredQuestions.length}</span>
                        <div className="quiz-progress-bar">
                            <div style={{ width: `${((currentQ + 1) / filteredQuestions.length) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-subject">{q.subject}</span>
                        <h2>{q.question}</h2>
                        <div className="options-grid">
                            {q.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    className={`option-btn 
                                        ${answered && idx === q.correct ? 'correct' : ''} 
                                        ${answered && idx === selectedAnswer && idx !== q.correct ? 'wrong' : ''}
                                        ${selectedAnswer === idx ? 'selected' : ''}
                                    `}
                                    onClick={() => handleAnswer(idx)}
                                >
                                    <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
                                    <span>{opt}</span>
                                    {answered && idx === q.correct && <CheckCircle2 size={20} />}
                                    {answered && idx === selectedAnswer && idx !== q.correct && <XCircle size={20} />}
                                </button>
                            ))}
                        </div>
                        {answered && (
                            <button className="primary-btn-brutal" onClick={nextQuestion} style={{ marginTop: '1.5rem' }}>
                                {currentQ + 1 >= filteredQuestions.length ? 'See Results' : 'Next Question →'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizGenerator;
