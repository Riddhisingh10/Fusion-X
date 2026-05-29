"use client";
import React from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Upload, Trophy, FileText, HelpCircle, Megaphone, Sparkles } from 'lucide-react';
import './FeatureStyles.css';

const iconMap = {
    notes: <Upload size={18} />,
    marathon: <Trophy size={18} />,
    paper: <FileText size={18} />,
    doubt: <HelpCircle size={18} />,
    event: <Megaphone size={18} />,
    xp: <Sparkles size={18} />,
};

const ActivityFeed = () => {
    const { activityFeed } = mockBackend;

    return (
        <div className="feed-container animate-enter" style={{ padding: '2rem' }}>
            <div className="feed-timeline">
                {activityFeed.map((item, i) => (
                    <div key={item.id} className="feed-item" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="feed-avatar" style={{ background: item.avatar }}>
                            {item.user.charAt(0)}
                        </div>
                        <div className="feed-body">
                            <p>
                                <strong>{item.user}</strong> {item.action}{' '}
                                <span className="feed-target">{item.target}</span>
                            </p>
                            <span className="feed-time">{item.time}</span>
                        </div>
                        <div className="feed-icon">{iconMap[item.type]}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;
