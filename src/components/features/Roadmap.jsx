"use client";
import React, { useState, useEffect } from 'react';
import { extraAPI } from '../../services/api';
import { Target, CheckCircle2, Circle, Clock, Zap, BrainCircuit } from 'lucide-react';
import './FeatureStyles.css';

const Roadmap = () => {
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoadmap = async () => {
            // In a real app, this would use the user's performance data
            const data = await extraAPI.getRoadmap();
            // Fallback for demo if extraAPI is empty
            if (data.length === 0) {
                setRoadmaps([{
                    id: 1,
                    topic: 'Mastering Calculus',
                    status: 'In Progress',
                    progress: 65,
                    tasks: [
                        { id: 1, title: 'Revise Limits & Continuity', completed: true },
                        { id: 2, title: 'Solve 2023 Internal Paper', completed: true },
                        { id: 3, title: 'Watch Integration Masterclass', completed: false },
                        { id: 4, title: 'Mock Test: Derivatives', completed: false },
                    ]
                }]);
            } else {
                setRoadmaps(data);
            }
            setLoading(false);
        };
        fetchRoadmap();
    }, []);

    if (loading) return <div className="loading-state">Generating your AI Roadmap...</div>;

    return (
        <div className="roadmap-container animate-enter">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <div className="ai-status" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(74, 222, 128, 0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                    <BrainCircuit className="pulse-icon" size={16} />
                    <span>AI Engine Online</span>
                </div>
            </div>

            <div className="roadmap-grid">
                {roadmaps.map(roadmap => (
                    <div key={roadmap.id} className="roadmap-card">
                        <div className="roadmap-main">
                            <div className="topic-header">
                                <Target size={32} />
                                <h2>{roadmap.topic}</h2>
                            </div>

                            <div className="progress-section">
                                <div className="progress-info">
                                    <span>Progress</span>
                                    <span>{roadmap.progress}%</span>
                                </div>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${roadmap.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="tasks-list">
                                {roadmap.tasks.map(task => (
                                    <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                        {task.completed ? (
                                            <CheckCircle2 color="var(--success)" />
                                        ) : (
                                            <Circle color="var(--text-secondary)" />
                                        )}
                                        <span>{task.title}</span>
                                        {!task.completed && <Zap size={14} className="action-hint" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="roadmap-sidebar">
                            <div className="stat-mini">
                                <Clock size={16} />
                                <span>Est. 4h remaining</span>
                            </div>
                            <button className="primary-btn-brutal">Continue Learning</button>
                        </div>
                    </div>
                ))}

                <div className="roadmap-suggestions">
                    <h3>AI Insights</h3>
                    <div className="insight-card">
                        <p>Based on your <strong>Physics Internal 1</strong> score (18/20), we recommend skipping "Newtonian Basics" and focusing on <strong>"Wave Optics"</strong>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Roadmap;
