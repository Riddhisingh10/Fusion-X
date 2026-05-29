"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Play, Clock, Eye, Filter } from 'lucide-react';
import CustomDropdown from '../layout/CustomDropdown';
import './FeatureStyles.css';

const Lectures = () => {
    const { lectures, subjects } = mockBackend;
    const [filter, setFilter] = useState('');

    const filtered = filter ? lectures.filter(l => l.subject === filter) : lectures;

    return (
        <div className="lectures-container animate-enter" style={{ padding: '2rem' }}>
            <div className="filter-bar" style={{ marginBottom: '2rem', width: '300px' }}>
                <CustomDropdown
                    options={['All Subjects', ...new Set(lectures.map(l => l.subject))]}
                    value={filter || 'All Subjects'}
                    onChange={(val) => setFilter(val === 'All Subjects' ? '' : val)}
                    placeholder="All Subjects"
                />
            </div>

            <div className="lectures-grid">
                {filtered.map((lec, i) => (
                    <div key={lec.id} className="lecture-card" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="lecture-thumb">
                            <Play size={40} />
                            <span className="duration-badge"><Clock size={12} /> {lec.duration}</span>
                        </div>
                        <div className="lecture-info">
                            <span className="lec-subject">{lec.subject} — {lec.unit}</span>
                            <h3>{lec.title}</h3>
                            <div className="lec-meta">
                                <span>{lec.teacher}</span>
                                <span><Eye size={14} /> {lec.views} views</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default Lectures;
