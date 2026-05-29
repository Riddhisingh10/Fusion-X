'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Cpu, Zap, Lock, Globe, ArrowRight, User, GraduationCap } from 'lucide-react';
import './SignupPage.css';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('STUDENT');

    const { login } = useAuth(); // Assuming login or register exists in context
    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("PROTOCOL ERROR: PASSWORDS DO NOT MATCH");
            return;
        }

        setLoading(true);
        // Mock signup logic
        setTimeout(() => {
            setLoading(false);
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <div className="login-wrapper">
            <div className="login-dual-panel signup-mode">

                {/* Left Panel - Form Area (Matching screenshot 1) */}
                <div className="login-main">
                    <div className="form-container">
                        <div className="sync-header">
                            <span className="platform-label">New Node Registration</span>
                            <h1>Create Account</h1>
                            <p>Join the Engineering Collaboration Network</p>
                        </div>



                        <form onSubmit={handleSignup} className="sync-form">
                            <div className="input-group">
                                <label>AUTHORIZED NAME</label>
                                <div className="input-field-wrap">
                                    <User size={18} className="field-icon" />
                                    <input
                                        type="text"
                                        placeholder="Enter Node Identity Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>NODE CREDENTIALS</label>
                                <div className="input-field-wrap">
                                    <Globe size={18} className="field-icon" />
                                    <input
                                        type="email"
                                        placeholder="authorized@skillforge.io"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>SECURITY PROTOCOL KEY</label>
                                <div className="input-field-wrap">
                                    <Lock size={18} className="field-icon" />
                                    <input
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>CONFIRM KEY</label>
                                <div className="input-field-wrap">
                                    <Lock size={18} className="field-icon" />
                                    <input
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {error && <div className="sync-error-msg">{error}</div>}

                            <button type="submit" className="establish-link-btn" disabled={loading}>
                                {loading ? 'Registering...' : (
                                    <>
                                        Create Account <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            <div className="form-alt-footer">
                                <span>Already have an account?</span>
                                <Link href="/login" className="register-link">Sign In</Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Sidebar - Info Panel (Matching screenshot 1 side swap) */}
                <div className="login-sidebar">
                    <div className="sidebar-logo">
                        <GraduationCap size={40} color="var(--accent-primary)" />
                        <span className="logo-text">CONNECT & PREP</span>
                    </div>

                    <div className="sidebar-content">
                        <h2 className="system-title">Join the Community</h2>
                        <p className="system-sub">Access shared resources, collaborate with fellow students, and build your engineering profile.</p>
                    </div>

                    <div className="sidebar-footer">
                        <div className="version-info">
                            <span> </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SignupPage;
