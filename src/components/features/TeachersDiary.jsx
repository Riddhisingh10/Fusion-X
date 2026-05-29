"use client";
import React from 'react';
import { mockBackend } from '../../services/mockBackend';
import { 
    MessageSquare, User, Calendar, 
    Book, MoreVertical, Search, Filter 
} from 'lucide-react';
import './FeatureStyles.css';

const TeachersDiary = () => {
    const diary = mockBackend.teachersDiary || [];

    const getTypeColor = (type) => {
        switch(type.toLowerCase()) {
            case 'positive': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'alert': return '#ef4444';
            default: return '#3b82f6';
        }
    };

    return (
        <div className="feature-container teachers-diary">
            <div className="feature-header">
                <div className="header-text">
                    <h1>Teacher's Diary 📝</h1>
                    <p>Chronological feed of official remarks from subject teachers.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar-wrap">
                        <Search size={18} />
                        <input type="text" placeholder="Search remarks..." />
                    </div>
                </div>
            </div>

            <div className="diary-feed">
                {diary.map(entry => (
                    <div key={entry.id} className={`diary-entry-card ${entry.read ? 'read' : 'unread'}`}>
                        <div className="entry-sidebar" style={{ backgroundColor: getTypeColor(entry.type) }} />
                        <div className="entry-main">
                            <div className="entry-header">
                                <div className="teacher-info">
                                    <div className="avatar">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <span className="teacher-name">{entry.teacher}</span>
                                        <span className="subject-tag">{entry.subject}</span>
                                    </div>
                                </div>
                                <div className="entry-meta">
                                    <span className="entry-date">
                                        <Calendar size={12} /> {entry.date}
                                    </span>
                                    <span className="entry-type" style={{ color: getTypeColor(entry.type) }}>
                                        {entry.type}
                                    </span>
                                </div>
                            </div>
                            <div className="entry-body">
                                <p>"{entry.remark}"</p>
                            </div>
                            <div className="entry-actions">
                                <button className="comment-btn">
                                    <MessageSquare size={14} /> Reply
                                </button>
                                <button className="more-btn">
                                    <MoreVertical size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeachersDiary;
