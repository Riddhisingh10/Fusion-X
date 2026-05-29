"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { Timer, MapPin, Plus, CheckCircle, PlayCircle, Trophy } from 'lucide-react';
import './FeatureStyles.css';

const StudyMarathons = () => {
    const { user } = useAuth();
    const { marathons } = mockBackend;
    const [showHostForm, setShowHostForm] = useState(false);
    const [takingTest, setTakingTest] = useState(null); // ID of marathon
    const [testScore, setTestScore] = useState(null);

    const handleCreate = (e) => {
        e.preventDefault();
        alert("Marathon Session Created!");
        setShowHostForm(false);
    };

    const handleTakeTest = (id) => {
        setTakingTest(id);
        // Simulate Score Generation
        setTimeout(() => {
            const score = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
            setTestScore(score);
        }, 2000);
    };

    return (
        <div className="feature-container">
            {showHostForm && (
                <div className="card" style={{ marginBottom: '2rem', border: '1px solid #f59e0b' }}>
                    <h3>Host Study Marathon</h3>
                    <form onSubmit={handleCreate} className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <input placeholder="Topic (e.g. 12hr Calculus)" className="filter-select" style={{ cursor: 'text' }} required />
                        <input placeholder="Venue" className="filter-select" style={{ cursor: 'text' }} required />
                        <input placeholder="Duration" className="filter-select" style={{ cursor: 'text' }} required />
                        <input type="date" className="filter-select" style={{ cursor: 'text' }} required />
                        <button type="submit" className="login-btn" style={{ gridColumn: 'span 2' }}>Broadcast</button>
                    </form>
                </div>
            )}

            {/* Test Result Modal Simulation */}
            {testScore !== null && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px', textAlign: 'center', border: '2px solid #4ade80' }}>
                        <Trophy size={64} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
                        <h2>Marathon Completed!</h2>
                        <p>You scored</p>
                        <h1 style={{ fontSize: '4rem', color: '#4ade80', margin: '0' }}>{testScore}%</h1>
                        <p style={{ color: '#888' }}>in the post-session assessment.</p>
                        <button className="login-btn" onClick={() => { setTestScore(null); setTakingTest(null); }}>Close & Save to Results</button>
                    </div>
                </div>
            )}

            <div className="grid-container">
                {marathons.map((m) => (
                    <div key={m.id} className="card" style={{ textAlign: 'left', borderLeft: `4px solid ${m.status === 'Upcoming' ? '#646cff' : '#4ade80'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{m.topic}</h3>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>Hosted by {m.host}</span>
                            </div>
                            <span style={{
                                background: m.status === 'Upcoming' ? '#00000020' : '#4ade8020',
                                color: m.status === 'Upcoming' ? '#000000' : '#4ade80',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem'
                            }}>
                                {m.status}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem', color: '#444', marginBottom: '1.5rem', fontWeight: '500' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Timer size={16} /> {m.duration}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> {m.venue}</div>
                        </div>

                        {m.status === 'Upcoming' ? (
                            <button className="login-btn">Register Now</button>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button
                                    className="login-btn"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    onClick={() => handleTakeTest(m.id)}
                                    disabled={!!m.userScore}
                                >
                                    {takingTest === m.id ? (
                                        'Generating Test...'
                                    ) : m.userScore ? (
                                        <>Score: {m.userScore}%</>
                                    ) : (
                                        <><PlayCircle size={18} /> Take Unit Test</>
                                    )}
                                </button>
                                {m.userScore && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>Added to Analysis</span>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudyMarathons;
