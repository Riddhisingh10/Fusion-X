"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import CustomDropdown from '../layout/CustomDropdown';
import './FeatureStyles.css';

const Analysis = () => {
    const { user } = useAuth();
    const [selectedExam, setSelectedExam] = useState('');
    const [file, setFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Mock list of exams available for analysis
    const exams = [
        { id: 'math_ia1_2024', name: 'Mathematics Internal 1 (2024)' },
        { id: 'phy_sem_2023', name: 'Physics Semester End (2023)' },
    ];

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleAnalyze = () => {
        if (!selectedExam || !file) return;

        setLoading(true);
        // Simulate AI Processing
        setTimeout(() => {
            const result = mockBackend.getAnalysis(file.name);
            setAnalysisResult(result);
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="feature-container">
            <div className="grid-container" style={{ gridTemplateColumns: '1fr' }}>

                {/* Upload Section */}
                <div className="card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    <h3>{user.role === 'teacher' ? 'Upload Reference Paper (100% Score)' : 'Analyze Your Answer Paper'}</h3>
                    <p style={{ color: '#888', marginBottom: '1.5rem' }}>
                        {user.role === 'teacher'
                            ? 'Select an exam and upload the best student answer script to train the AI.'
                            : 'Select an exam and upload your answer script to compare against the topper.'}
                    </p>

                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                        <CustomDropdown
                            options={exams.map(e => ({ value: e.id, label: e.name }))}
                            value={selectedExam}
                            onChange={(val) => setSelectedExam(val)}
                            placeholder="Select Exam"
                        />

                        <div style={{
                            border: '2px dashed rgba(255,255,255,0.2)',
                            padding: '2rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            cursor: 'pointer'
                        }}>
                            <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileChange} />
                            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                <Upload size={32} color="#646cff" style={{ marginBottom: '1rem' }} />
                                <p>{file ? file.name : 'Click to Upload PDF / Image'}</p>
                            </label>
                        </div>
                    </div>

                    <button
                        className="login-btn"
                        disabled={!selectedExam || !file || loading}
                        onClick={handleAnalyze}
                    >
                        {loading ? 'Analyzing with AI...' : (user.role === 'teacher' ? 'Save Reference' : 'Start Analysis')}
                    </button>
                </div>

                {/* Analysis Result (Student View) */}
                {analysisResult && user.role === 'student' && (
                    <div className="analysis-result">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '3rem', margin: '0', color: '#4ade80' }}>{analysisResult.score}%</h2>
                            <p style={{ color: '#888' }}>Match with Reference Paper</p>
                        </div>

                        <div className="grid-container">
                            {analysisResult.comparison.map((item, idx) => (
                                <div key={idx} className={`comparison-item ${item.status === 'Excellent' ? 'excellent' : 'improvement'}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong>Question {item.q}: {item.topic}</strong>
                                        <span style={{
                                            color: item.status === 'Excellent' ? '#4ade80' : '#f87171',
                                            fontWeight: 'bold'
                                        }}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p style={{ color: '#ccc', fontSize: '0.9rem', margin: 0 }}>
                                        <ArrowRight size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                        {item.feedback}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Success Message (Teacher View) */}
                {analysisResult && user.role === 'teacher' && ( // Reusing state for success trigger in mock
                    <div className="analysis-result" style={{ textAlign: 'center', color: '#4ade80' }}>
                        <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
                        <h3>Reference Paper Saved Successfully!</h3>
                        <p style={{ color: '#ccc' }}>AI is now ready to grade student papers for this exam.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Analysis;
