"use client";
import React, { useState } from 'react';
import GroupStudy from './GroupStudy';
import PeerTutoring from './PeerTutoring';
import StudyMarathons from './StudyMarathons';
import { Users, UserCheck, Timer } from 'lucide-react';
import './FeatureStyles.css';

const StudyZone = () => {
    const [activeTab, setActiveTab] = useState('groups');

    const tabs = [
        { key: 'groups', label: 'Group Study', icon: <Users size={16} /> },
        { key: 'peer', label: 'Peer Tutoring', icon: <UserCheck size={16} /> },
        { key: 'marathons', label: 'Study Marathons', icon: <Timer size={16} /> },
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

            {/* Tab Content */}
            {activeTab === 'groups' && (
                <div className="ahub-section animate-enter">
                    <GroupStudy />
                </div>
            )}

            {activeTab === 'peer' && (
                <div className="ahub-section animate-enter">
                    <PeerTutoring />
                </div>
            )}

            {activeTab === 'marathons' && (
                <div className="ahub-section animate-enter">
                    <StudyMarathons />
                </div>
            )}
        </div>
    );
};

export default StudyZone;

