"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Users, MapPin, Clock, Calendar, Plus } from 'lucide-react';
import './FeatureStyles.css';

const GroupStudy = () => {
    const { studyGroups } = mockBackend;
    const [showForm, setShowForm] = useState(false);

    // Mock Form State
    const [newGroup, setNewGroup] = useState({ topic: '', venue: '', time: '' });

    const handleCreate = (e) => {
        e.preventDefault();
        alert("Group created and broadcasted to students!");
        setShowForm(false);
    };

    return (
        <div className="feature-container">
            {showForm && (
                <div className="card" style={{ marginBottom: '2rem', border: '1px solid #000000' }}>
                    <h3>Host a New Session</h3>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <input placeholder="Subject / Topic" className="filter-select" style={{ cursor: 'text' }} required />
                        <input placeholder="Venue (e.g. Library)" className="filter-select" style={{ cursor: 'text' }} required />
                        <input type="datetime-local" className="filter-select" style={{ cursor: 'text' }} required />
                        <button type="submit" className="login-btn" style={{ gridColumn: 'span 2' }}>Broadcast Invite</button>
                    </form>
                </div>
            )}

            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {studyGroups.map((group) => (
                    <div key={group.id} className="card" style={{ textAlign: 'left', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#000000' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>{group.name}</h3>
                            <span style={{ background: '#a78bfa20', color: '#a78bfa', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                {group.members} Joined
                            </span>
                        </div>

                        <p style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '1rem' }}>Topic: {group.topic}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={16} /> {group.venue}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={16} /> {group.time}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={16} /> Host: {group.host}
                            </div>
                        </div>

                        <button className="login-btn" style={{ marginTop: '1.5rem' }}>Register / Join</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupStudy;
