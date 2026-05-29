"use client";
import React from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Award, TrendingUp, AlertTriangle, BookOpen, Clock } from 'lucide-react';
import './FeatureStyles.css';

const Results = () => {
    const { results } = mockBackend;

    return (
        <div className="feature-container">
            <h1>Comprehensive Result Analysis</h1>

            {/* Overview Cards */}
            <div className="grid-container" style={{ marginBottom: '2rem' }}>
                <div className="stat-box info">
                    <h3>Overall GPA</h3>
                    <span className="value">8.65</span>
                </div>
                <div className="stat-box success">
                    <h3>Marathon Tests</h3>
                    <span className="value">Top 10%</span>
                </div>
                <div className="stat-box warning">
                    <h3>Weakest Subject</h3>
                    <span className="value" style={{ fontSize: '1.5rem' }}>Thermodynamics</span>
                </div>
            </div>

            <div className="grid-container">
                {results.map((result, idx) => (
                    <div key={idx} className="card" style={{ textAlign: 'left', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div>
                                <span style={{
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    color: '#000000',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>
                                    {result.type}
                                </span>
                                <h3 style={{ margin: 0 }}>{result.title}</h3>
                            </div>
                            {result.status === 'Pass' || result.status === 'Distinction' || result.status === 'Excellent' ? <Award color="#4ade80" /> : <TrendingUp color="#f59e0b" />}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#000000' }}>{result.score}</span>
                            <span style={{ color: '#333' }}>{result.type === 'Semester' ? '' : 'Score'}</span>
                        </div>

                        {result.weakAreas.length > 0 ? (
                            <div style={{ background: 'rgba(248, 113, 113, 0.1)', padding: '0.8rem', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    <AlertTriangle size={14} /> Weak Areas Detected:
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {result.weakAreas.map(area => (
                                        <span key={area} style={{ fontSize: '0.8rem', color: '#555' }}>• {area}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '0.8rem', borderRadius: '8px', color: '#4ade80', fontSize: '0.9rem' }}>
                                All topics clear! Good job.
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* AI Summary Section */}
            <div style={{ marginTop: '2.5rem', background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '4px 4px 0px var(--shadow-hard)' }}>
                <h3 style={{ color: '#000000', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BookOpen /> AI Learning Recommendation
                </h3>
                <p style={{ lineHeight: '1.6', color: '#000000' }}>
                    Based on your recent <strong>Semester 2</strong> results and <strong>Marathon Test</strong> performance,
                    we noticed a struggle in <em>Thermodynamics</em> and <em>CSS Grid</em>.
                    We recommend joining the <strong>"Physics Phenoms"</strong> peer group and booking a doubt
                    session with <strong>Dr. Emily</strong> for Biology/Chem overlap concepts.
                </p>
            </div>
        </div>
    );
};

export default Results;
