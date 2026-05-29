"use client";
import React from 'react';
import { mockBackend } from '../../services/mockBackend';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import './FeatureStyles.css';

const SemesterAnalytics = () => {
    const { semesterAnalytics, semesterGrades } = mockBackend;

    const sgpaData = semesterAnalytics.map(s => ({ name: `Sem ${s.sem}`, SGPA: s.sgpa, Attendance: s.attendance }));
    const hoursData = semesterAnalytics.map(s => ({ name: `Sem ${s.sem}`, Hours: s.studyHours }));

    // Build radar data from latest semester grades
    const latestGrades = semesterGrades[semesterGrades.length - 1]?.subjects || [];
    const radarData = latestGrades.map(s => ({ subject: s.name.split(' ')[0], score: s.points * 10 }));

    const latestSem = semesterAnalytics[semesterAnalytics.length - 1];
    const prevSem = semesterAnalytics.length > 1 ? semesterAnalytics[semesterAnalytics.length - 2] : null;
    const sgpaTrend = prevSem ? (latestSem.sgpa - prevSem.sgpa).toFixed(2) : 0;

    return (
        <div className="analytics-container animate-enter" style={{ padding: '2rem' }}>
            {/* Quick Stats */}
            <div className="analytics-stats-row">
                <div className="analytics-stat">
                    <span className="label">Latest SGPA</span>
                    <span className="value">{latestSem.sgpa}</span>
                    <span className={`trend ${sgpaTrend >= 0 ? 'up' : 'down'}`}>
                        {sgpaTrend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {sgpaTrend >= 0 ? '+' : ''}{sgpaTrend}
                    </span>
                </div>
                <div className="analytics-stat">
                    <span className="label">Avg Attendance</span>
                    <span className="value">{latestSem.attendance}%</span>
                </div>
                <div className="analytics-stat">
                    <span className="label">Study Hours</span>
                    <span className="value">{latestSem.studyHours}h</span>
                </div>
                <div className="analytics-stat">
                    <span className="label">Weak Areas</span>
                    <span className="value weak">{latestSem.weakSubjects.join(', ')}</span>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="analytics-charts-grid">
                {/* SGPA Trend */}
                <div className="analytics-chart-card">
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

                {/* Study Hours */}
                <div className="analytics-chart-card">
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

                {/* Subject Strengths Radar */}
                <div className="analytics-chart-card wide">
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
    );
};

export default SemesterAnalytics;
