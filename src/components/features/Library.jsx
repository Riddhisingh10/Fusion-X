"use client";
import React from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Book, Clock, AlertCircle } from 'lucide-react';
import './FeatureStyles.css';

const Library = () => {
    const { libraryBooks } = mockBackend;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return '#4ade80';
            case 'Borrowed': return '#f87171';
            default: return '#888';
        }
    };

    return (
        <div className="feature-container">
            <h1>Library Management</h1>

            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {libraryBooks.map((book) => (
                    <div key={book.id} className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Book size={32} color="#646cff" />
                            <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                background: `${getStatusColor(book.status)}20`,
                                color: getStatusColor(book.status)
                            }}>
                                {book.status}
                            </span>
                        </div>

                        <h3 style={{ margin: '1rem 0 0.5rem' }}>{book.title}</h3>

                        {book.dueDate && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginTop: '1rem' }}>
                                <Clock size={16} />
                                <span>Return by: {book.dueDate}</span>
                            </div>
                        )}

                        {!book.dueDate && <p style={{ color: '#888', fontSize: '0.9rem' }}>Available for checkout</p>}
                    </div>
                ))}

                {/* Mock extra items */}
                <div className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Book size={32} color="#646cff" />
                        <span style={{ background: '#4ade8020', color: '#4ade80', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Available</span>
                    </div>
                    <h3 style={{ margin: '1rem 0 0.5rem' }}>Physics for Engineers</h3>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Available for checkout</p>
                </div>
            </div>
        </div>
    );
};

export default Library;
