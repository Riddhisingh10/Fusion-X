"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Calculator, TrendingUp, Sparkles } from 'lucide-react';
import './FeatureStyles.css';

const CGPACalculator = () => {
    const { semesterGrades } = mockBackend;
    const [whatIfGrade, setWhatIfGrade] = useState(9.0);

    // Calculate actual CGPA
    let totalCredits = 0, totalWeighted = 0;
    semesterGrades.forEach(sem => {
        sem.subjects.forEach(sub => {
            totalCredits += sub.credits;
            totalWeighted += sub.credits * sub.points;
        });
    });
    const actualCGPA = (totalWeighted / totalCredits).toFixed(2);

    // What-If: simulate Sem 3 with 15 credits
    const simCredits = 15;
    const simCGPA = ((totalWeighted + simCredits * whatIfGrade) / (totalCredits + simCredits)).toFixed(2);

    return (
        <div className="cgpa-container animate-enter" style={{ padding: '2rem' }}>


            {/* Current CGPA Display */}
            <div className="cgpa-hero">
                <div className="cgpa-display">
                    <Calculator size={48} />
                    <div>
                        <span className="cgpa-label">Current CGPA</span>
                        <span className="cgpa-value">{actualCGPA}</span>
                    </div>
                </div>
                <div className="cgpa-meta">
                    <span>Total Credits: {totalCredits}</span>
                    <span>Semesters: {semesterGrades.length}</span>
                </div>
            </div>

            {/* Semester Breakdown */}
            <div className="semester-cards">
                {semesterGrades.map(sem => (
                    <div key={sem.sem} className="sem-card">
                        <div className="sem-header">
                            <h3>Semester {sem.sem}</h3>
                            <span className="sgpa-badge">SGPA: {sem.sgpa}</span>
                        </div>
                        <table className="grade-table">
                            <thead>
                                <tr><th>Subject</th><th>Credits</th><th>Grade</th><th>Points</th></tr>
                            </thead>
                            <tbody>
                                {sem.subjects.map((sub, i) => (
                                    <tr key={i}>
                                        <td>{sub.name}</td>
                                        <td>{sub.credits}</td>
                                        <td><span className="grade-pill">{sub.grade}</span></td>
                                        <td>{sub.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* What-If Simulator */}
            <div className="whatif-section">
                <div className="whatif-header">
                    <Sparkles size={24} color="var(--accent-action)" />
                    <h2>What-If Simulator</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    If you score an SGPA of <strong>{whatIfGrade}</strong> in Semester 3 (15 credits), your CGPA becomes:
                </p>
                <div className="whatif-controls">
                    <div className="slider-group">
                        <label>Target SGPA: <strong>{whatIfGrade}</strong></label>
                        <input
                            type="range" min="5" max="10" step="0.1"
                            value={whatIfGrade}
                            onChange={e => setWhatIfGrade(parseFloat(e.target.value))}
                        />
                        <div className="slider-labels">
                            <span>5.0</span><span>10.0</span>
                        </div>
                    </div>
                    <div className="sim-result">
                        <TrendingUp size={32} color="var(--success)" />
                        <div>
                            <span className="sim-label">Projected CGPA</span>
                            <span className="sim-value">{simCGPA}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CGPACalculator;
