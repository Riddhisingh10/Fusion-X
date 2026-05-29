'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Cpu, Zap, Lock, Globe, ArrowRight, GraduationCap, BarChart2 } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('STUDENT'); // Role toggle: STUDENT / FACULTY

    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="login-wrapper">
            <div className="login-dual-panel">
                {/* Left Sidebar - System Info */}
                <div className="login-sidebar">
                    <div className="sidebar-logo">
                        <GraduationCap size={40} color="var(--accent-primary)" />
                        <span className="logo-text">CONNECT & PREP</span>
                    </div>

                    <div className="sidebar-content">
                        <h2 className="system-title">Engineering Portal</h2>
                        <p className="system-sub">Access verified resources, collaborate with peers, and track your progress.</p>
                    </div>

                    <div className="sidebar-footer">
                        <div className="version-info">
                            <span> </span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form Area */}
                <div className="login-main">
                    <div className="form-container">
                        <div className="sync-header">
                            <span className="platform-label">Institutional Log In</span>
                            <h1> Sign In</h1>
                            <p> </p>
                        </div>



                        <form onSubmit={handleLogin} className="sync-form">
                            <div className="input-group">
                                <label>Institutional Email</label>
                                <div className="input-field-wrap">
                                    <Globe size={18} className="field-icon" />
                                    <input
                                        type="text"
                                        placeholder="authorized@institution.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Security Key</label>
                                <div className="input-field-wrap">
                                    <Lock size={18} className="field-icon" />
                                    <input
                                        type="password"
                                        placeholder="Your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {error && <div className="sync-error-msg">{error}</div>}

                            <button type="submit" className="establish-link-btn" disabled={loading}>
                                {loading ? 'Logging in...' : (
                                    <>
                                        Sign In <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            <div className="form-alt-footer">
                                <span>Don't have an account?</span>
                                <Link href="/register" className="register-link">Register Now</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
