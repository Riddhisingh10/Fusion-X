"use client";
import React from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Briefcase, Linkedin } from 'lucide-react';
import './FeatureStyles.css';

const Alumni = () => {
    const { alumni } = mockBackend;

    return (
        <div className="feature-container">
            <h1>Alumni Network</h1>

            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {alumni.map((person) => (
                    <div key={person.id} className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#333',
                            borderRadius: '50%',
                            margin: '0 auto 1rem',
                            border: '2px solid #646cff'
                        }} />
                        <h3>{person.name}</h3>
                        <p style={{ color: '#888', margin: '0.5rem 0' }}>Class of {person.batch}</p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '1rem 0', color: '#ccc' }}>
                            <Briefcase size={16} />
                            <span>{person.role} at {person.company}</span>
                        </div>

                        <button className="icon-btn" style={{ width: '100%', justifyContent: 'center', gap: '8px', marginTop: '1rem' }}>
                            <Linkedin size={18} /> Connect
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Alumni;
