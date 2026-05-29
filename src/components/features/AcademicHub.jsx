"use client";
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { extraAPI } from '../../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
    TrendingUp, TrendingDown, BookOpen, Award, AlertTriangle,
    Target, CheckCircle2, Circle, Clock, Zap, BrainCircuit, BarChart2,
    FileText, ClipboardList
} from 'lucide-react';
import QuizGenerator from './QuizGenerator';
import QuestionPapers from './QuestionPapers';
import Analysis from './Analysis';
import './FeatureStyles.css';

const AcademicHub = () => {
    const { semesterAnalytics, semesterGrades, results } = mockBackend;
    const [activeTab, setActiveTab] = useState('results');
    const [roadmaps, setRoadmaps] = useState([]);
    const [loadingRoadmap, setLoadingRoadmap] = useState(true);

    // Fetch AI Roadmap data
    useEffect(() => {
        const fetchRoadmap = async () => {
            const data = await extraAPI.getRoadmap();
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
                }, {
                    id: 2,
                    topic: 'Physics Wave Optics',
                    status: 'Not Started',
                    progress: 20,
                    tasks: [
                        { id: 1, title: 'Review Interference Basics', completed: true },
                        { id: 2, title: 'Solve Diffraction Problems', completed: false },
                        { id: 3, title: 'Complete Lab Viva Prep', completed: false },
                    ]
                }]);
            } else {
                setRoadmaps(data);
            }
            setLoadingRoadmap(false);
        };
        fetchRoadmap();
    }, []);

    // Analytics computed data
    const sgpaData = semesterAnalytics.map(s => ({ name: `Sem ${s.sem}`, SGPA: s.sgpa, Attendance: s.attendance }));
    const hoursData = semesterAnalytics.map(s => ({ name: `Sem ${s.sem}`, Hours: s.studyHours }));
    const latestGrades = semesterGrades[semesterGrades.length - 1]?.subjects || [];
    const radarData = latestGrades.map(s => ({ subject: s.name.split(' ')[0], score: s.points * 10 }));
    const latestSem = semesterAnalytics[semesterAnalytics.length - 1];
    const prevSem = semesterAnalytics.length > 1 ? semesterAnalytics[semesterAnalytics.length - 2] : null;
    const sgpaTrend = prevSem ? (latestSem.sgpa - prevSem.sgpa).toFixed(2) : 0;

    const tabs = [
        { key: 'results', label: 'Results', icon: <Award size={16} /> },
        { key: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} /> },
        { key: 'roadmap', label: 'AI Roadmap', icon: <BrainCircuit size={16} /> },
        { key: 'quiz', label: 'AI Quiz', icon: <Zap size={16} /> },
        { key: 'papers', label: 'Question Papers', icon: <FileText size={16} /> },
        { key: 'analysis', label: 'Answer Analysis', icon: <ClipboardList size={16} /> },
    ];

    return (
        <div className="academic-hub animate-enter" style={{ padding: '2rem' }}>


            {/* Tab Navigation */}
            <div className="ahub-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`ahub-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* ========== RESULTS TAB ========== */}
            {activeTab === 'results' && (
                <div className="ahub-section animate-enter">
                    {/* Overview Cards */}
                    <div className="ahub-stats-row">
                        <div className="ahub-stat-card">
                            <span className="ahub-stat-label">Overall GPA</span>
                            <span className="ahub-stat-value" style={{ color: '#a78bfa' }}>8.65</span>
                        </div>
                        <div className="ahub-stat-card">
                            <span className="ahub-stat-label">Marathon Tests</span>
                            <span className="ahub-stat-value" style={{ color: '#4ade80' }}>Top 10%</span>
                        </div>
                        <div className="ahub-stat-card">
                            <span className="ahub-stat-label">Weakest Subject</span>
                            <span className="ahub-stat-value" style={{ color: '#f87171', fontSize: '1.2rem' }}>Thermodynamics</span>
                        </div>
                    </div>

                    {/* Result Cards */}
                    <div className="ahub-results-grid">
                        {results.map((result, idx) => (
                            <div key={idx} className="ahub-result-card" style={{ animationDelay: `${idx * 80}ms` }}>
                                <div className="ahub-result-top">
                                    <div>
                                        <span className="ahub-result-type">{result.type}</span>
                                        <h3 className="ahub-result-title">{result.title}</h3>
                                    </div>
                                    {result.status === 'Pass' || result.status === 'Distinction' || result.status === 'Excellent'
                                        ? <Award color="#4ade80" size={24} />
                                        : <TrendingUp color="#f59e0b" size={24} />}
                                </div>
                                <div className="ahub-result-score">{result.score}</div>
                                {result.weakAreas.length > 0 ? (
                                    <div className="ahub-weak-areas">
                                        <div className="ahub-weak-header">
                                            <AlertTriangle size={14} /> Weak Areas:
                                        </div>
                                        <div className="ahub-weak-list">
                                            {result.weakAreas.map(area => (
                                                <span key={area}>• {area}</span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="ahub-all-clear">All topics clear! Good job.</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* AI Recommendation */}
                    <div className="ahub-ai-box">
                        <h3><BookOpen size={20} /> AI Learning Recommendation</h3>
                        <p>
                            Based on your <strong>Semester 2</strong> results and <strong>Marathon Test</strong> performance,
                            we recommend focusing on <em>Thermodynamics</em>. Join the <strong>"Physics Phenoms"</strong> peer
                            group and book a doubt session with <strong>Dr. Emily</strong>.
                        </p>
                    </div>
                </div>
            )}

            {/* ========== SEMESTER ANALYTICS TAB ========== */}
            {activeTab === 'analytics' && (
                <div className="ahub-section animate-enter">
                    {/* Quick Stats */}
                    <div className="ahub-stats-row">
                        <div className="ahub-stat-card">
                            <span className="ahub-stat-label">Latest SGPA</span>
                            <span className="ahub-stat-value">{latestSem.sgpa}</span>
                            <span className={`ahub-trend ${sgpaTrend >= 0 ? 'up' : 'down'}`}>
                                {sgpaTrend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {sgpaTrend >= 0 ? '+' : ''}{sgpaTrend}
                            </span>
                        </div>
                        <div className="ahub-stat-card">
                            <span className="ahub-stat-label">Avg Attendance</span>
                            <span className="ahub-stat-value">{latestSem.attendance}%</span>
                        </div>
                        <div className="ahub-stat-card">
                            <span className="ahub-stat-label">Study Hours</span>
                            <span className="ahub-stat-value">{latestSem.studyHours}h</span>
                        </div>
                        <div className="ahub-stat-card">
                            <span className="ahub-stat-label">Weak Areas</span>
                            <span className="ahub-stat-value" style={{ color: '#f87171', fontSize: '1rem' }}>{latestSem.weakSubjects.join(', ')}</span>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="ahub-charts-grid">
                        <div className="ahub-chart-card">
                            <h3>SGPA Trend</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={sgpaData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#888" />
                                    <YAxis domain={[6, 10]} stroke="#888" />
                                    <Tooltip contentStyle={{ background: '#1e1e1e', border: '1px solid #333' }} />
                                    <Line type="monotone" dataKey="SGPA" stroke="#a78bfa" strokeWidth={3} dot={{ r: 6, fill: '#a78bfa' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="ahub-chart-card">
                            <h3>Study Hours per Semester</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={hoursData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888" />
                                    <YAxis stroke="#888" />
                                    <Tooltip contentStyle={{ background: '#1e1e1e', border: '1px solid #333' }} />
                                    <Bar dataKey="Hours" fill="#4ade80" radius={[6, 6, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="ahub-chart-card wide">
                            <h3>Subject Strength (Latest Semester)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="subject" stroke="#888" />
                                    <PolarRadiusAxis domain={[0, 100]} stroke="#555" />
                                    <Radar name="Score" dataKey="score" stroke="#f472b6" fill="#f472b6" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== AI ROADMAP TAB ========== */}
            {activeTab === 'roadmap' && (
                <div className="ahub-section animate-enter">
                    <div className="ahub-ai-status">
                        <BrainCircuit className="pulse-icon" size={20} />
                        <span>AI Engine Online</span>
                    </div>

                    {loadingRoadmap ? (
                        <div className="loading-state">Generating your AI Roadmap...</div>
                    ) : (
                        <div className="ahub-roadmap-list">
                            {roadmaps.map(roadmap => (
                                <div key={roadmap.id} className="ahub-roadmap-card">
                                    <div className="ahub-roadmap-header">
                                        <Target size={28} color="var(--accent-action)" />
                                        <div>
                                            <h3>{roadmap.topic}</h3>
                                            <span className="ahub-roadmap-status">{roadmap.status}</span>
                                        </div>
                                    </div>

                                    <div className="ahub-progress-section">
                                        <div className="ahub-progress-info">
                                            <span>Progress</span>
                                            <span>{roadmap.progress}%</span>
                                        </div>
                                        <div className="ahub-progress-bar">
                                            <div className="ahub-progress-fill" style={{ width: `${roadmap.progress}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="ahub-tasks">
                                        {roadmap.tasks.map(task => (
                                            <div key={task.id} className={`ahub-task ${task.completed ? 'done' : ''}`}>
                                                {task.completed ? <CheckCircle2 size={18} color="var(--success)" /> : <Circle size={18} color="var(--text-secondary)" />}
                                                <span>{task.title}</span>
                                                {!task.completed && <Zap size={14} className="action-hint" />}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="ahub-roadmap-footer">
                                        <div className="ahub-roadmap-meta">
                                            <Clock size={14} /> Est. {Math.ceil(roadmap.tasks.filter(t => !t.completed).length * 1.5)}h remaining
                                        </div>
                                        <button className="primary-btn-brutal">Continue Learning</button>
                                    </div>
                                </div>
                            ))}

                            {/* AI Insights */}
                            <div className="ahub-ai-box">
                                <h3><BrainCircuit size={20} /> AI Insights</h3>
                                <p>
                                    Based on your <strong>Physics Internal 1</strong> score (18/20), we recommend skipping
                                    "Newtonian Basics" and focusing on <strong>"Wave Optics"</strong> for faster progress.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========== AI QUIZ TAB ========== */}
            {activeTab === 'quiz' && (
                <div className="ahub-section animate-enter">
                    <QuizGenerator />
                </div>
            )}

            {/* ========== QUESTION PAPERS TAB ========== */}
            {activeTab === 'papers' && (
                <div className="ahub-section animate-enter">
                    <QuestionPapers />
                </div>
            )}

            {/* ========== ANSWER ANALYSIS TAB ========== */}
            {activeTab === 'analysis' && (
                <div className="ahub-section animate-enter">
                    <Analysis />
                </div>
            )}
        </div>
    );
};

export default AcademicHub;
