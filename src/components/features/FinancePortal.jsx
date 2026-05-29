"use client";
import React from 'react';
import { mockBackend } from '../../services/mockBackend';
import { 
    Wallet, CreditCard, Clock, CheckCircle2, 
    Download, AlertCircle, TrendingUp, History 
} from 'lucide-react';
import './FeatureStyles.css';

const FinancePortal = () => {
    const parent = mockBackend.parentData || {};
    const fees = parent.fees || [];

    const totalUnpaid = fees.filter(f => f.status === 'Unpaid').reduce((acc, current) => {
        const amount = parseInt(current.amount.replace('₹', '').replace(',', ''));
        return acc + amount;
    }, 0);

    return (
        <div className="feature-container finance-portal">
            <div className="feature-header">
                <div className="header-text">
                    <h1>Finance Portal 🏦</h1>
                    <p>Track school fees, student activities, and upcoming dues.</p>
                </div>
                <div className="total-due-card">
                    <span className="label">Total Unpaid Dues</span>
                    <span className="amount">₹{totalUnpaid.toLocaleString()}</span>
                    <button className="pay-all-btn">Pay All Dues</button>
                </div>
            </div>

            <div className="finance-grid">
                <div className="fees-section">
                    <h3>Upcoming & Active Fees</h3>
                    <div className="fee-list">
                        {fees.map(fee => (
                            <div key={fee.id} className={`finance-row ${fee.status.toLowerCase()}`}>
                                <div className="fee-meta">
                                    <div className={`status-icon ${fee.status.toLowerCase()}`}>
                                        {fee.status === 'Paid' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                    </div>
                                    <div className="fee-details">
                                        <span className="fee-title">{fee.title}</span>
                                        <span className="due-date">Due: {fee.dueDate}</span>
                                    </div>
                                </div>
                                <div className="fee-amount-section">
                                    <span className="fee-val">{fee.amount}</span>
                                    <span className="penalty-val">{fee.penalty ? `Penalty: ${fee.penalty}` : ''}</span>
                                </div>
                                <div className="fee-actions">
                                    {fee.status === 'Paid' ? (
                                        <button className="download-receipt-btn">
                                            <Download size={16} /> Receipt
                                        </button>
                                    ) : (
                                        <button className="pay-now-btn">Pay Now</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="finance-stats-section">
                    <div className="stat-card payment-history">
                        <div className="stat-header">
                            <History size={20} />
                            <h3>Payment History Hub</h3>
                        </div>
                        <div className="mini-feed">
                            <div className="feed-item">
                                <span className="feed-date">Mar 15, 2024</span>
                                <span className="feed-desc">Lab Materials Fee</span>
                                <span className="feed-amt success">₹1,200</span>
                            </div>
                            <div className="feed-item">
                                <span className="feed-date">Mar 01, 2024</span>
                                <span className="feed-desc">Transport Fee</span>
                                <span className="feed-amt success">₹2,500</span>
                            </div>
                        </div>
                        <button className="view-more-link">View Detailed History</button>
                    </div>

                    <div className="stat-card secure-payment">
                        <div className="stat-header">
                            <CreditCard size={20} />
                            <h3>Secure Channels</h3>
                        </div>
                        <p>UPI, Credit Card, Netbanking, and Debit Cards are accepted via 256-bit encrypted gateway.</p>
                        <div className="payment-icons">
                            {/* Simple visual placeholders */}
                            <div className="p-icon">UPI</div>
                            <div className="p-icon">VISA</div>
                            <div className="p-icon">Rupay</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancePortal;
