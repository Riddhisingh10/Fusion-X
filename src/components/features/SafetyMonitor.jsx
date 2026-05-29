"use client";
import React from 'react';
import { mockBackend } from '../../services/mockBackend';
import { 
    ShieldCheck, Eye, Smartphone, Clock, 
    AlertCircle, Lock, Activity, Users, 
    Wifi, SignalHigh 
} from 'lucide-react';
import './FeatureStyles.css';

const SafetyMonitor = () => {
    const parent = mockBackend.parentData || {};
    const safety = parent.safetyMonitor || {};

    return (
        <div className="feature-container safety-monitor">
            <div className="feature-header">
                <div className="header-text">
                    <h1>Safety Monitor 🛡️</h1>
                    <p>Real-time oversight of your child's digital presence and physical security.</p>
                </div>
                <div className="overall-status-card">
                    <ShieldCheck size={32} color="#10b981" />
                    <div>
                        <span className="status-val">{safety.overallStatus}</span>
                        <span className="status-label">Safety Rating: {safety.socialScore}%</span>
                    </div>
                </div>
            </div>

            <div className="safety-grid">
                <div className="digital-presence-card">
                    <div className="card-header">
                        <Smartphone size={20} />
                        <h3>Active Engagement</h3>
                    </div>
                    <div className="engagement-details">
                        <div className="engagement-item">
                            <span className="label">Daily Screen Time</span>
                            <span className="value">
                                <Clock size={16} /> {safety.screenTime}
                            </span>
                        </div>
                        <div className="engagement-item">
                            <span className="label">Current Connection</span>
                            <span className="value">
                                <Wifi size={16} /> School_Guest_5G
                            </span>
                        </div>
                    </div>
                    <div className="app-usage">
                        <span className="label">Foreground Operations:</span>
                        <div className="app-pills">
                            {(safety.activeApps || []).map((app, idx) => (
                                <span key={idx} className="app-pill">{app}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="safety-alerts-card">
                    <div className="card-header">
                        <AlertCircle size={20} />
                        <h3>Threat & Access Logs</h3>
                    </div>
                    <div className="log-list">
                        {(safety.alerts || []).map(alert => (
                            <div key={alert.id} className="log-item">
                                <div className={`log-dot ${alert.type.toLowerCase()}`} />
                                <div className="log-details">
                                    <p className="log-msg">"{alert.msg}"</p>
                                    <span className="log-time">{alert.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="security-scan-btn">Initiate Manual Scan</button>
                </div>

                <div className="physical-access-card">
                    <div className="card-header">
                        <Lock size={20} />
                        <h3>Secure Perimeter</h3>
                    </div>
                    <div className="perimeter-stats">
                        <div className="p-stat">
                            <span className="p-label">Last Gate Scan</span>
                            <span className="p-val">08:45 AM (Entrance)</span>
                        </div>
                        <div className="p-stat">
                            <span className="p-label">Late-Night Block</span>
                            <span className="p-val active">On (10 PM to 6 AM)</span>
                        </div>
                    </div>
                    <div className="p-footer">
                        <p>Real-time GPS tracking is available on the companion Parent App.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyMonitor;
