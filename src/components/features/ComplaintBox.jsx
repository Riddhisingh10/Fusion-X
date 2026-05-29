"use client";
import React, { useState } from 'react';
import './FeatureStyles.css';

const ComplaintBox = () => {
    const [complaint, setComplaint] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!complaint.trim()) return;
        // Mocking the backend logic
        setSubmitted(true);
        setComplaint('');
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="feature-container animate-enter">
            <div className="feature-header">
                <h1 className="feature-title">🛡️ Anonymous Complaint Box</h1>
                <p className="feature-subtitle">Voice your concerns freely. No identity attached.</p>
            </div>

            <div className="form-interface card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Your Complaint / Feedback (Anonymous)</label>
                    <textarea 
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value)}
                        placeholder="State your concern here..."
                        style={{ width: '100%', height: '150px', padding: '15px', background: 'var(--bg-primary)', border: '2px solid var(--border-color)', color: 'white', marginBottom: '20px' }}
                    />
                    <button type="submit" className="action-button" style={{ width: '100%', padding: '15px 0' }}>Submit Complaint</button>
                </form>

                {submitted && (
                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--success)', color: 'black', fontWeight: 'bold', textAlign: 'center' }}>
                        Your feedback has been submitted anonymously!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintBox;
