"use client";
import React, { useState } from 'react';
import { Target, Brain, TrendingUp, AlertCircle, Calendar, Sparkles, BookOpen, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './FeatureStyles.css';

const ExamPredictor = () => {
    const [selectedSubject, setSelectedSubject] = useState('Operating Systems');

    const subjects = [
        'Operating Systems',
        'Database Management',
        'Theory of Computation',
        'Computer Networks',
        'Software Engineering'
    ];

    const predictionData = {
        'Operating Systems': [
            { topic: 'Process Scheduling', probability: 95, previousYears: 5, difficulty: 'High' },
            { topic: 'Memory Management', probability: 88, previousYears: 4, difficulty: 'High' },
            { topic: 'Deadlocks', probability: 75, previousYears: 3, difficulty: 'Medium' },
            { topic: 'File Systems', probability: 62, previousYears: 3, difficulty: 'Low' },
            { topic: 'Virtualization', probability: 45, previousYears: 2, difficulty: 'Medium' },
        ],
        'Database Management': [
            { topic: 'SQL Queries', probability: 98, previousYears: 5, difficulty: 'Medium' },
            { topic: 'Normalization', probability: 92, previousYears: 5, difficulty: 'High' },
            { topic: 'Indexing/Hashing', probability: 70, previousYears: 3, difficulty: 'High' },
            { topic: 'Transaction Control', probability: 65, previousYears: 3, difficulty: 'Medium' },
            { topic: 'NoSQL Intro', probability: 40, previousYears: 2, difficulty: 'Low' },
        ]
    };

    const currentPredictions = predictionData[selectedSubject] || predictionData['Operating Systems'];

    return (
        <div className="predictor-container animate-enter">
            <header className="predictor-header">
                <div className="header-title">
                    <h1><Sparkles className="sparkle-icon" /> Smart Exam Predictor</h1>
                    <p>AI-driven analysis of 10+ years of previous question papers.</p>
                </div>
                <div className="subject-selector">
                    <select 
                        value={selectedSubject} 
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="cyber-select"
                    >
                        {subjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
            </header>

            <div className="predictor-grid">
                {/* Probability Chart */}
                <div className="predictor-section chart-card">
                    <div className="section-header">
                        <h3>Topic Probability Score</h3>
                        <Target size={20} color="#00ffcc" />
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={currentPredictions} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis 
                                    dataKey="topic" 
                                    type="category" 
                                    width={140} 
                                    stroke="#94a3b8" 
                                    fontSize={12}
                                />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                />
                                <Bar dataKey="probability" radius={[0, 4, 4, 0]} barSize={20}>
                                    {currentPredictions.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.probability > 80 ? '#ef4444' : entry.probability > 60 ? '#fbbf24' : '#00ffcc'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights Panel */}
                <div className="predictor-section insights-card">
                    <div className="section-header">
                        <h3>Critical Insights</h3>
                        <Brain size={20} color="#a78bfa" />
                    </div>
                    <div className="insights-list">
                        <div className="insight-item high-alert">
                            <AlertCircle size={18} />
                            <div>
                                <strong>Must Study:</strong> "{currentPredictions[0].topic}" has appeared in {currentPredictions[0].previousYears}/5 past years.
                            </div>
                        </div>
                        <div className="insight-item info">
                            <TrendingUp size={18} />
                            <div>
                                <strong>Upward Trend:</strong> Probability of {currentPredictions[1].topic} increased by 15% this year.
                            </div>
                        </div>
                        <div className="insight-item tip">
                            <Sparkles size={18} />
                            <div>
                                <strong>Expert Tip:</strong> Focus on {currentPredictions[0].topic} numericals first.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Topic Breakdown */}
                <div className="predictor-section full-width topic-breakdown">
                    <div className="section-header">
                        <h3>Detailed Topic Breakdown</h3>
                        <BookOpen size={20} color="#38bdf8" />
                    </div>
                    <div className="topic-table-wrapper">
                        <table className="topic-table">
                            <thead>
                                <tr>
                                    <th>Topic Name</th>
                                    <th>Historical Frequency</th>
                                    <th>Calculated Difficulty</th>
                                    <th>Confidence Score</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPredictions.map((topic, i) => (
                                    <tr key={i}>
                                        <td>{topic.topic}</td>
                                        <td>{topic.previousYears} Times</td>
                                        <td>
                                            <span className={`diff-badge ${topic.difficulty.toLowerCase()}`}>
                                                {topic.difficulty}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="confidence-meter">
                                                <div className="meter-fill" style={{ width: `${topic.probability}%` }}></div>
                                                <span>{topic.probability}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button className="practice-btn">Practice</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamPredictor;
