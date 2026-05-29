"use client";
import React from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Zap, CheckCircle2 } from 'lucide-react';
import './FeatureStyles.css';

const Challenges = () => {
    const { challenges } = mockBackend;

    return (
        <div className="challenges-container animate-enter" style={{ padding: '2rem' }}>
            <div className="challenges-grid">
                {challenges.map((ch, i) => (
                    <div key={ch.id} className={`challenge-card ${ch.completed ? 'completed' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="challenge-icon">{ch.icon}</div>
                        <div className="challenge-body">
                            <h3>{ch.title}</h3>
                            <p>{ch.desc}</p>
                            <div className="challenge-progress">
                                <div className="challenge-bar">
                                    <div style={{ width: `${(ch.progress / ch.target) * 100}%` }}></div>
                                </div>
                                <span>{ch.progress}/{ch.target}</span>
                            </div>
                        </div>
                        <div className="challenge-reward">
                            {ch.completed ? (
                                <CheckCircle2 size={28} color="var(--success)" />
                            ) : (
                                <div className="xp-reward">
                                    <Zap size={16} color="var(--accent-action)" />
                                    <span>+{ch.xp} XP</span>
                                </div>
                            )}
                            <span className="deadline">{ch.deadline}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Challenges;
