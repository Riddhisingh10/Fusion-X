"use client";
import React, { useState } from 'react';
import { Heart, X, Briefcase, GraduationCap, Star, Calendar, MessageSquare, Linkedin } from 'lucide-react';
import './FeatureStyles.css';

const MENTORS_DATA = [
    {
        id: 1,
        name: 'Arjun Mehta',
        role: 'SDE-2 @ Amazon',
        batch: 'Batch of 2018',
        expertise: ['System Design', 'Backend Engineering', 'AWS'],
        image: '/arjun_mehta.png',
        available: 'Next Friday, 4 PM',
        bio: 'Ex-Flipkart, Ex-Directi. Happy to discuss building scalable distributed systems and backend architecture.'
    },
    {
        id: 2,
        name: 'Sara Khan',
        role: 'PM @ Google',
        batch: 'Batch of 2020',
        expertise: ['Product Management', 'Strategy', 'UI/UX'],
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
        available: 'Tomorrow, 6 PM',
        bio: 'Currently scaling Google Cloud products. Let’s talk about how to pivot from SDE to PM and product strategy.'
    },
    {
        id: 3,
        name: 'Rohit Sharma',
        role: 'Data Scientist @ Tesla',
        batch: 'Batch of 2019',
        expertise: ['Machine Learning', 'Big Data', 'Python'],
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
        available: 'Monday, 10 AM',
        bio: 'Building autonomous driving models. Ask me about ML modeling and data engineering pipelines at scale.'
    }
];

const AlumniMatch = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [matches, setMatches] = useState([]);
    const [lastAction, setLastAction] = useState(null); // 'matched' or 'skipped'

    const currentMentor = MENTORS_DATA[currentIndex];

    const handleAction = (type) => {
        setLastAction(type);
        if (type === 'match') {
            setMatches([...matches, currentMentor]);
        }
        
        setTimeout(() => {
            setLastAction(null);
            if (currentIndex < MENTORS_DATA.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setCurrentIndex(-1); // No more mentors
            }
        }, 600);
    };

    if (currentIndex === -1) {
        return (
            <div className="alumni-match-complete animate-enter">
                <div className="match-success-card card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="heart-icon-pulsing">
                        <Heart size={64} color="var(--accent-primary)" fill="var(--accent-primary)" />
                    </div>
                    <h2 style={{ margin: '1.5rem 0 1rem' }}>No more mentors for now!</h2>
                    <p style={{ color: '#888' }}>Check out your matches below to schedule your quick-calls.</p>
                    <button className="primary-btn-brutal" onClick={() => setCurrentIndex(0)} style={{ marginTop: '2rem' }}>
                        Restart Discovery
                    </button>
                </div>

                {matches.length > 0 && (
                    <div className="matches-list" style={{ marginTop: '3rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Star size={20} color="var(--accent-action)" /> Your Matches ({matches.length})
                        </h3>
                        <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {matches.map(m => (
                                <div key={m.id} className="match-item-card card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <img src={m.image} alt={m.name} style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--accent-action)' }} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0 }}>{m.name}</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#888', margin: '4px 0' }}>{m.role}</p>
                                    </div>
                                    <button className="icon-btn-highlight"><Calendar size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="alumni-match-container animate-enter">
            <div className="match-header-text" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px' }}>
                    Alumni Match <span style={{ color: 'var(--accent-action)' }}>Beta</span>
                </h2>
                <p style={{ color: '#888' }}>Find your perfect mentor. Swipe right to connect for a 15-min call.</p>
            </div>

            <div className={`mentor-card-stack ${lastAction ? `action-${lastAction}` : ''}`}>
                <div className="mentor-card-main card">
                    <div className="mentor-image-container">
                        <img src={currentMentor.image} alt={currentMentor.name} className="mentor-img" />
                        <div className="mentor-overlay-info">
                            <span className="batch-tag">{currentMentor.batch}</span>
                        </div>
                    </div>

                    <div className="mentor-content">
                        <div className="mentor-meta">
                            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{currentMentor.name}</h3>
                            <div className="mentor-role-pill">
                                <Briefcase size={16} />
                                <span>{currentMentor.role}</span>
                            </div>
                        </div>

                        <p className="mentor-bio">{currentMentor.bio}</p>

                        <div className="mentor-skills">
                            {currentMentor.expertise.map(skill => (
                                <span key={skill} className="skill-tag">{skill}</span>
                            ))}
                        </div>

                        <div className="availability-hint">
                            <Calendar size={14} color="var(--accent-primary)" />
                            <span>Available: <strong>{currentMentor.available}</strong></span>
                        </div>
                    </div>

                    {/* Action Stamps */}
                    {lastAction === 'match' && <div className="stamp match-stamp">MATCH</div>}
                    {lastAction === 'skip' && <div className="stamp skip-stamp">SKIP</div>}
                </div>

                {/* Deck visual */}
                <div className="card-behind-1"></div>
                <div className="card-behind-2"></div>
            </div>

            <div className="match-controls">
                <button className="control-btn skip" onClick={() => handleAction('skip')}>
                    <X size={32} />
                </button>
                <button className="control-btn match" onClick={() => handleAction('match')}>
                    <Heart size={32} fill="var(--accent-action)" />
                </button>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <div style={{ background: '#111', padding: '1rem', borderRadius: '12px', border: '1px solid #333', display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', marginLeft: i === 1 ? 0 : '-10px', border: '2px solid #000' }} />
                        ))}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>
                        <strong>42 students</strong> matched with alumni this week.
                    </span>
                </div>
            </div>

            <style>{`
                .mentor-card-stack {
                    position: relative;
                    max-width: 450px;
                    margin: 0 auto;
                    height: 600px;
                    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .mentor-card-main {
                    position: relative;
                    z-index: 10;
                    height: 100%;
                    padding: 0 !important;
                    overflow: hidden;
                    background: #1e1e1e !important;
                    border: 2px solid #333 !important;
                    display: flex;
                    flex-direction: column;
                }

                .mentor-image-container {
                    position: relative;
                    height: 45%;
                    width: 100%;
                }

                .mentor-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .mentor-overlay-info {
                    position: absolute;
                    bottom: 1rem;
                    left: 1rem;
                }

                .batch-tag {
                    background: var(--accent-action);
                    color: #000;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-weight: 800;
                    font-size: 0.75rem;
                    border: 1px solid #000;
                }

                .mentor-content {
                    padding: 1.5rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .mentor-role-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(167, 139, 250, 0.1);
                    color: var(--accent-primary);
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    width: fit-content;
                    margin-top: 8px;
                }

                .mentor-bio {
                    font-size: 0.95rem;
                    color: #aaa;
                    line-height: 1.5;
                    margin: 0;
                }

                .mentor-skills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .skill-tag {
                    background: #222;
                    border: 1px solid #333;
                    color: #888;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                }

                .availability-hint {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    color: #888;
                }

                .match-controls {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    margin-top: 2rem;
                }

                .control-btn {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    border: 3px solid #333;
                    background: #111;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .control-btn.skip:hover {
                    border-color: var(--error);
                    color: var(--error);
                    box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
                    transform: scale(1.1);
                }

                .control-btn.match:hover {
                    border-color: var(--accent-action);
                    color: var(--accent-action);
                    box-shadow: 0 0 20px rgba(255, 230, 0, 0.2);
                    transform: scale(1.1);
                }

                .card-behind-1, .card-behind-2 {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #151515;
                    border: 2px solid #222;
                    border-radius: 8px;
                    z-index: 5;
                    transform: translateY(10px) scale(0.95);
                }

                .card-behind-2 {
                    z-index: 1;
                    transform: translateY(20px) scale(0.9);
                    background: #101010;
                }

                .stamp {
                    position: absolute;
                    top: 20%;
                    font-size: 3rem;
                    font-weight: 900;
                    padding: 4px 16px;
                    border: 6px solid;
                    border-radius: 12px;
                    transform: rotate(-20deg);
                    opacity: 0;
                    transition: opacity 0.2s;
                    z-index: 20;
                }

                .match-stamp {
                    right: 40px;
                    color: var(--accent-action);
                    border-color: var(--accent-action);
                    transform: rotate(-10deg);
                }

                .skip-stamp {
                    left: 40px;
                    color: var(--error);
                    border-color: var(--error);
                    transform: rotate(10deg);
                }

                .action-match .mentor-card-main {
                    transform: translateX(200%) rotate(30deg);
                }
                .action-match .match-stamp { opacity: 1; }

                .action-skip .mentor-card-main {
                    transform: translateX(-200%) rotate(-30deg);
                }
                .action-skip .skip-stamp { opacity: 1; }

                .heart-icon-pulsing {
                    animation: heartPulse 2s infinite;
                }

                @keyframes heartPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }

                @media (max-width: 768px) {
                    .mentor-card-stack {
                        max-width: 100%;
                        height: 480px;
                    }

                    .mentor-content {
                        padding: 1rem;
                        gap: 0.75rem;
                    }

                    .mentor-meta h3 {
                        font-size: 1.3rem !important;
                    }

                    .mentor-bio {
                        font-size: 0.85rem;
                    }

                    .control-btn {
                        width: 56px;
                        height: 56px;
                    }

                    .match-controls {
                        gap: 1.5rem;
                        margin-top: 1.5rem;
                    }

                    .stamp {
                        font-size: 2rem;
                        padding: 2px 10px;
                        border-width: 4px;
                    }

                    .match-stamp {
                        right: 20px;
                    }

                    .skip-stamp {
                        left: 20px;
                    }

                    .match-header-text h2 {
                        font-size: 1.8rem !important;
                    }
                }

                @media (max-width: 480px) {
                    .mentor-card-stack {
                        height: 420px;
                    }

                    .mentor-image-container {
                        height: 40%;
                    }

                    .mentor-meta h3 {
                        font-size: 1.1rem !important;
                    }

                    .mentor-role-pill {
                        font-size: 0.75rem;
                        padding: 4px 8px;
                    }

                    .control-btn {
                        width: 50px;
                        height: 50px;
                    }

                    .match-header-text h2 {
                        font-size: 1.4rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AlumniMatch;
