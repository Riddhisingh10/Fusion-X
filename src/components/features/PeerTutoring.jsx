"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Calendar, Clock, MapPin, CheckSquare } from 'lucide-react';
import './FeatureStyles.css';

const PeerTutoring = () => {
    const { user } = useAuth();
    const { p2pSchedule } = mockBackend;
    const [showAssignForm, setShowAssignForm] = useState(false);

    return (
        <div className="feature-container">
            {showAssignForm && (
                <div className="card" style={{ marginBottom: '2rem', border: '1px solid #4ade80' }}>
                    <h3>Assign Student Tutor</h3>
                    <form className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <input placeholder="Student Name / ID" className="filter-select" style={{ cursor: 'text' }} />
                        <input placeholder="Topic to Teach" className="filter-select" style={{ cursor: 'text' }} />
                        <input type="datetime-local" className="filter-select" style={{ cursor: 'text' }} />
                        <input placeholder="Venue" className="filter-select" style={{ cursor: 'text' }} />
                        <button className="login-btn" style={{ gridColumn: 'span 2' }}>Confirm Assignment</button>
                    </form>
                </div>
            )}

            {/* Schedule List */}
            <div className="grid-container">
                {p2pSchedule.map((session) => (
                    <div key={session.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#4ade80' }}>{session.topic}</h3>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>Tutor: {session.tutor}</p>
                            </div>
                            {user?.role === 'teacher' && (
                                <button className="icon-btn" title="Take Attendance">
                                    <CheckSquare size={18} />
                                </button>
                            )}
                        </div>

                        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'grid', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}><Calendar size={18} color="#888" /> {session.time.split(' ')[0]}</div>
                            <div style={{ display: 'flex', gap: '10px' }}><Clock size={18} color="#888" /> {session.time.split(' ')[1]}</div>
                            <div style={{ display: 'flex', gap: '10px' }}><MapPin size={18} color="#888" /> {session.venue}</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#888' }}>{session.studentsRegistered} registered</span>
                            <button className="login-btn" style={{ width: 'auto', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                                Register
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PeerTutoring;
