"use client";
import React, { useState, useEffect } from 'react';
import { extraAPI } from '../../services/api';
import { Trophy, Medal, Flame, Star, TrendingUp, Crown, Zap, Target, Award, Shield } from 'lucide-react';
import './FeatureStyles.css';

const badgeIcons = {
    'Sage': <Crown size={16} />,
    'Scholar': <Award size={16} />,
    'Novice': <Shield size={16} />,
    'Rising': <TrendingUp size={16} />,
};

const Gamification = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await extraAPI.getGamification();
            if (!data.points) {
                setStats({
                    points: 4500,
                    streak: 12,
                    level: 4,
                    nextLevelAt: 5000,
                    badges: [
                        { name: 'Paper Pioneer', icon: '📄', earned: true, desc: 'Solved 50+ question papers' },
                        { name: 'Consistent Learner', icon: '🔥', earned: true, desc: '7-day study streak' },
                        { name: 'Quiz Master', icon: '🧠', earned: true, desc: 'Scored 90%+ in 5 quizzes' },
                        { name: 'Night Owl', icon: '🦉', earned: false, desc: 'Study after midnight 10 times' },
                        { name: 'Helping Hand', icon: '🤝', earned: false, desc: 'Answer 20 doubts' },
                        { name: 'Marathon Runner', icon: '🏃', earned: false, desc: 'Complete 3 study marathons' },
                    ],
                    leaderboard: [
                        { rank: 1, name: 'Ananya R.', points: 8900, badge: 'Sage', color: '#FFD700', avatar: 'A' },
                        { rank: 2, name: 'You', points: 4500, badge: 'Scholar', color: '#a78bfa', avatar: 'S', isYou: true },
                        { rank: 3, name: 'Vikram S.', points: 4200, badge: 'Scholar', color: '#4ade80', avatar: 'V' },
                        { rank: 4, name: 'Rahul K.', points: 3800, badge: 'Novice', color: '#f59e0b', avatar: 'R' },
                        { rank: 5, name: 'Priya M.', points: 3500, badge: 'Novice', color: '#f472b6', avatar: 'P' },
                        { rank: 6, name: 'Karan D.', points: 3200, badge: 'Rising', color: '#38bdf8', avatar: 'K' },
                    ]
                });
            } else {
                setStats(data);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-state">Loading Leaderboard...</div>;

    const maxXP = stats.leaderboard[0]?.points || 1;
    const xpProgress = ((stats.points / stats.nextLevelAt) * 100).toFixed(0);
    const top3 = stats.leaderboard.slice(0, 3);
    const rest = stats.leaderboard.slice(3);

    return (
        <div className="lb-container animate-enter" style={{ padding: '2rem' }}>


            {/* Your Stats Row */}
            <div className="lb-your-stats">
                <div className="lb-stat-card lb-level">
                    <div className="lb-stat-icon">
                        <Star size={32} fill="var(--accent-action)" color="var(--accent-action)" />
                    </div>
                    <div className="lb-stat-info">
                        <span className="lb-stat-label">LEVEL</span>
                        <span className="lb-stat-val">{stats.level}</span>
                    </div>
                    <div className="lb-xp-bar-wrap">
                        <div className="lb-xp-bar">
                            <div className="lb-xp-fill" style={{ width: `${xpProgress}%` }}></div>
                        </div>
                        <span className="lb-xp-text">{stats.points}/{stats.nextLevelAt} XP</span>
                    </div>
                </div>

                <div className="lb-stat-card lb-xp">
                    <div className="lb-stat-icon">
                        <Trophy size={32} fill="#FFD700" color="#FFD700" />
                    </div>
                    <div className="lb-stat-info">
                        <span className="lb-stat-label">TOTAL XP</span>
                        <span className="lb-stat-val">{stats.points.toLocaleString()}</span>
                    </div>
                </div>

                <div className="lb-stat-card lb-streak">
                    <div className="lb-stat-icon">
                        <Flame size={32} fill="#FF4500" color="#FF4500" className="pulse-icon" />
                    </div>
                    <div className="lb-stat-info">
                        <span className="lb-stat-label">STREAK</span>
                        <span className="lb-stat-val">{stats.streak} <small>days</small></span>
                    </div>
                </div>
            </div>

            {/* Podium - Top 3 */}
            <div className="lb-podium-section">
                <h2 className="lb-section-title"><Crown size={22} /> Top Scholars</h2>
                <div className="lb-podium">
                    {/* 2nd Place */}
                    <div className="lb-podium-spot lb-second" style={{ animationDelay: '0.15s' }}>
                        <div className="lb-podium-avatar" style={{ background: top3[1]?.color || '#666', borderColor: '#C0C0C0' }}>
                            {top3[1]?.avatar}
                            {top3[1]?.isYou && <span className="lb-you-badge">YOU</span>}
                        </div>
                        <span className="lb-podium-name">{top3[1]?.name}</span>
                        <span className="lb-podium-xp">{top3[1]?.points.toLocaleString()} XP</span>
                        <div className="lb-podium-block lb-block-2">
                            <span className="lb-podium-rank">2</span>
                        </div>
                    </div>

                    {/* 1st Place */}
                    <div className="lb-podium-spot lb-first" style={{ animationDelay: '0s' }}>
                        <Crown size={28} color="#FFD700" className="lb-crown" />
                        <div className="lb-podium-avatar" style={{ background: top3[0]?.color || '#666', borderColor: '#FFD700' }}>
                            {top3[0]?.avatar}
                        </div>
                        <span className="lb-podium-name">{top3[0]?.name}</span>
                        <span className="lb-podium-xp">{top3[0]?.points.toLocaleString()} XP</span>
                        <div className="lb-podium-block lb-block-1">
                            <span className="lb-podium-rank">1</span>
                        </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="lb-podium-spot lb-third" style={{ animationDelay: '0.3s' }}>
                        <div className="lb-podium-avatar" style={{ background: top3[2]?.color || '#666', borderColor: '#CD7F32' }}>
                            {top3[2]?.avatar}
                        </div>
                        <span className="lb-podium-name">{top3[2]?.name}</span>
                        <span className="lb-podium-xp">{top3[2]?.points.toLocaleString()} XP</span>
                        <div className="lb-podium-block lb-block-3">
                            <span className="lb-podium-rank">3</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rest of Leaderboard */}
            {rest.length > 0 && (
                <div className="lb-rest-list">
                    {rest.map((user, idx) => (
                        <div key={user.rank} className={`lb-rest-item ${user.isYou ? 'lb-is-you' : ''}`} style={{ animationDelay: `${(idx + 3) * 80}ms` }}>
                            <span className="lb-rest-rank">#{user.rank}</span>
                            <div className="lb-rest-avatar" style={{ background: user.color }}>{user.avatar}</div>
                            <div className="lb-rest-info">
                                <span className="lb-rest-name">{user.name} {user.isYou && <span className="lb-you-tag">YOU</span>}</span>
                                <span className="lb-rest-badge">
                                    {badgeIcons[user.badge] || <Shield size={12} />} {user.badge}
                                </span>
                            </div>
                            <div className="lb-rest-bar-wrap">
                                <div className="lb-rest-bar">
                                    <div className="lb-rest-bar-fill" style={{ width: `${(user.points / maxXP) * 100}%`, background: user.color }}></div>
                                </div>
                            </div>
                            <span className="lb-rest-xp">{user.points.toLocaleString()} XP</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Badges / Achievements */}
            <div className="lb-badges-section">
                <h2 className="lb-section-title"><Medal size={22} /> Achievements</h2>
                <div className="lb-badges-grid">
                    {stats.badges.map((badge, i) => (
                        <div key={i} className={`lb-badge-card ${badge.earned ? 'earned' : 'locked'}`} style={{ animationDelay: `${i * 60}ms` }}>
                            <span className="lb-badge-emoji">{badge.icon}</span>
                            <div className="lb-badge-info">
                                <span className="lb-badge-name">{badge.name}</span>
                                <span className="lb-badge-desc">{badge.desc}</span>
                            </div>
                            {badge.earned && <Zap size={16} color="var(--accent-action)" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Gamification;
