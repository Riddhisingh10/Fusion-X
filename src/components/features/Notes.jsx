"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { FileText, Download, Folder, ChevronRight, Home, ArrowLeft, Star, FileQuestion } from 'lucide-react';
import './FeatureStyles.css';

const Notes = () => {
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [viewType, setViewType] = useState('folders'); // 'folders', 'modules', 'notes', or 'pyqs'

    const { studyMaterials, pyqs } = mockBackend;

    // Derived Data
    const subjects = [...new Set([...studyMaterials.map(m => m.subject), ...pyqs.map(q => q.subject)])];
    const modules = [1, 2, 3, 4, 5];

    const filteredNotes = studyMaterials.filter(n => 
        n.subject === selectedSubject && n.module === selectedModule
    );

    const filteredPYQs = pyqs.filter(q => q.subject === selectedSubject);

    const handleBack = () => {
        if (viewType === 'notes') setViewType('modules');
        else if (viewType === 'pyqs' || viewType === 'modules') {
            setViewType('folders');
            setSelectedSubject(null);
        }
    };

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setViewType('modules');
    };

    const renderBreadcrumbs = () => (
        <div className="folder-breadcrumbs">
            <button onClick={() => { setSelectedSubject(null); setViewType('folders'); }} className="breadcrumb-btn">
                <Home size={16} /> All Subjects
            </button>
            {selectedSubject && (
                <>
                    <ChevronRight size={16} className="divider" />
                    <button onClick={() => setViewType('modules')} className={`breadcrumb-btn ${viewType === 'modules' ? 'active' : ''}`}>
                        {selectedSubject}
                    </button>
                </>
            )}
            {viewType === 'notes' && (
                <>
                    <ChevronRight size={16} className="divider" />
                    <button className="breadcrumb-btn active">
                        Module {selectedModule}
                    </button>
                </>
            )}
            {viewType === 'pyqs' && (
                <>
                    <ChevronRight size={16} className="divider" />
                    <button className="breadcrumb-btn active">
                        PYQS
                    </button>
                </>
            )}
        </div>
    );

    const renderContent = () => {
        if (viewType === 'folders') {
            return (
                <div className="folder-grid">
                    {subjects.map(subject => (
                        <div key={subject} className="folder-card" onClick={() => handleSubjectSelect(subject)}>
                            <div className="folder-icon-wrapper">
                                <Folder size={64} className="folder-icon" fill="rgba(167, 139, 250, 0.2)" />
                            </div>
                            <span className="folder-name">{subject}</span>
                        </div>
                    ))}
                </div>
            );
        }

        if (viewType === 'modules') {
            return (
                <div className="folder-structure-view">
                    <div className="folder-grid">
                        {/* Special folder for PYQS of this subject */}
                        <div className="folder-card pyq-folder" onClick={() => setViewType('pyqs')}>
                            <div className="folder-icon-wrapper">
                                <Folder size={64} className="folder-icon" fill="rgba(248, 113, 113, 0.2)" />
                            </div>
                            <span className="folder-name">PYQS Collection</span>
                        </div>

                        {/* Module folders */}
                        {modules.map(mod => (
                            <div key={mod} className="folder-card module-folder" onClick={() => { setSelectedModule(mod); setViewType('notes'); }}>
                                <div className="folder-icon-wrapper">
                                    <Folder size={64} className="folder-icon" fill="rgba(251, 191, 36, 0.2)" />
                                </div>
                                <span className="folder-name">Module {mod}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (viewType === 'pyqs') {
            return (
                <div className="pyqs-list-view">
                    <div className="section-header">
                        <h3>Previous Year Questions - {selectedSubject}</h3>
                    </div>
                    <div className="pyq-grid">
                        {filteredPYQs.length > 0 ? (
                            filteredPYQs.map(q => (
                                <div key={q.id} className="pyq-card-v2">
                                    <div className="pyq-header">
                                        <div className="pyq-years">
                                            {q.yearsAsked.map(y => <span key={y} className="year-pill">{y}</span>)}
                                        </div>
                                    </div>
                                    <h3 className="pyq-question">{q.question}</h3>
                                    <button className="view-solution-btn">VIEW SOLUTION</button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-folder-state">
                                <FileQuestion size={48} />
                                <p>No PYQs available for this subject yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // notes view
        return (
            <div className="notes-list-view">
                <div className="section-header">
                    <h3>Files in {selectedSubject} - Module {selectedModule}</h3>
                </div>
                <div className="papers-grid">
                    {filteredNotes.length > 0 ? (
                        filteredNotes.map(item => (
                            <div key={item.id} className="paper-card note-file-card">
                                <div className="paper-icon">
                                    <FileText size={32} color={item.category === 'Teacher Note' ? '#a78bfa' : '#fbbf24'} />
                                </div>
                                <div className="paper-info">
                                    <h3>{item.title}</h3>
                                    <div className="meta">
                                        <span>BY {item.author.toUpperCase()}</span>
                                        {item.category === 'Best Student Note' && (
                                            <span className="verified-tag">VERIFIED BY {item.verifiedBy.toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>
                                <button className="download-btn">
                                    <Download size={16} /> DOWNLOAD
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-folder-state">
                            <FileQuestion size={48} />
                            <p>No notes uploaded for this module yet.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="notes-page-container">
            <div className="notes-header">
                <div className="notes-title-section">
                    <div className="yellow-title-box">
                        <h1>NOTES & PYQS</h1>
                    </div>
                </div>
            </div>

            <div className="notes-view-content">
                <div className="notes-folder-view">
                    <div className="folder-nav-bar">
                        {viewType !== 'folders' && (
                            <button className="back-nav-btn" onClick={handleBack}>
                                <ArrowLeft size={18} /> BACK
                            </button>
                        )}
                        {renderBreadcrumbs()}
                    </div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};



export default Notes;
