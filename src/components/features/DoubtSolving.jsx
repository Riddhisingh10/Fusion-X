"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { MessageCircle, Video, Upload, User, Check, Clock, Mic, Bell, Send, UserPlus } from 'lucide-react';
import CustomDropdown from '../layout/CustomDropdown';
import './FeatureStyles.css';

const DoubtSolving = () => {
    const { doubts: initialDoubts, tutors } = mockBackend;
    const [doubts, setDoubts] = useState(initialDoubts);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [doubtText, setDoubtText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'pending', 'resolved'
    const [activeDoubt, setActiveDoubt] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [notification, setNotification] = useState(null);

    const imageInputRef = React.useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const timerRef = React.useRef(null);

    const handleImageClick = () => {
        if (imageInputRef.current) {
            imageInputRef.current.click();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const startRecording = async () => {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                const chunks = [];
                
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunks.push(e.data);
                };

                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    const url = URL.createObjectURL(blob);
                    setAudioUrl(url);
                    stream.getTracks().forEach(track => track.stop());
                };

                recorder.start();
                setMediaRecorder(recorder);
                setIsRecording(true);
                setRecordingTime(0);
                
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
            } else {
                throw new Error("MediaDevices not supported");
            }
        } catch (err) {
            console.warn("Audio recording error, using simulation:", err);
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        } else {
            clearInterval(timerRef.current);
            setIsRecording(false);
            setAudioUrl("mock-audio");
        }
        clearInterval(timerRef.current);
        setIsRecording(false);
    };

    const removeAudio = (e) => {
        e.stopPropagation();
        setAudioUrl(null);
        setMediaRecorder(null);
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const teacherOptions = tutors.map(t => `${t.name} (${t.specialization[0]})`);

    const handlePostDoubt = (e) => {
        e.preventDefault();
        if (!selectedTeacher) {
            alert("Please tag a teacher first!");
            return;
        }

        setStatus('submitting');

        // Simulate Notification Send
        setTimeout(() => {
            const newDoubt = {
                id: Date.now(),
                question: doubtText,
                subject: selectedTeacher.split('(')[1].replace(')', ''),
                teacher: selectedTeacher.split(' (')[0],
                status: 'Pending',
                time: 'Just now'
            };
            
            setActiveDoubt(newDoubt);
            setDoubts([newDoubt, ...doubts]);
            setStatus('pending');
            setDoubtText('');
            setSelectedTeacher('');
            setSelectedFile(null);
            setImagePreview(null);
            setAudioUrl(null);
        }, 1500);
    };

    const simulateTeacherSolve = () => {
        if (!activeDoubt) return;
        
        // Simulate teacher taking time to solve
        setTimeout(() => {
            const resolvedDoubt = { ...activeDoubt, status: 'Resolved' };
            setDoubts(prev => prev.map(d => d.id === activeDoubt.id ? resolvedDoubt : d));
            setActiveDoubt(resolvedDoubt);
            setStatus('resolved');
            
            // Show notification toast in the app only
            setNotification({
                message: `${resolvedDoubt.teacher} has solved your doubt: "${resolvedDoubt.question.substring(0, 20)}..."`
            });
            
            setTimeout(() => {
                setNotification(null);
            }, 6000);
        }, 2000);
    };

    return (
        <div className="feature-container">
            <div className="yellow-title-box" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h1>DOUBT SOLVING HUB</h1>
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    style={{ 
                        background: '#000', 
                        color: showHistory ? '#fbbf24' : '#fff', 
                        border: '2px solid #000', 
                        padding: '10px 20px', 
                        fontWeight: '900', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <Clock size={18} />
                    {showHistory ? 'Hide History' : 'View History'}
                </button>
            </div>

            <div className="doubt-layout" style={{ 
                display: 'grid', 
                gridTemplateColumns: showHistory ? '1.2fr 0.8fr' : '1fr', 
                gap: '2.5rem', 
                alignItems: 'start',
                transition: 'all 0.3s'
            }}>
                
                {/* Left Column: Tag & Ask */}
                <div className="brutalist-card-main" style={{ background: '#111', border: '3px solid #fff', padding: '2.5rem', boxShadow: '15px 15px 0px rgba(255,255,255,0.1)' }}>
                    {status === 'idle' || status === 'submitting' ? (
                        <>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <UserPlus color="#fbbf24" /> Tag Your Teacher
                            </h3>
                            <p style={{ color: '#888', marginBottom: '2rem' }}>Choose a teacher to notify. They will be alerted to solve your problem.</p>

                            {status === 'submitting' ? (
                                <div className="loading-state" style={{ padding: '3rem', textAlign: 'center' }}>
                                    <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '50px', height: '50px', border: '5px solid #333', borderTop: '5px solid #fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                    <p style={{ fontWeight: '900', letterSpacing: '1px' }}>NOTIFYING TEACHER...</p>
                                </div>
                            ) : (
                                <form onSubmit={handlePostDoubt} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <CustomDropdown 
                                        label="Select Teacher to Tag *"
                                        options={teacherOptions}
                                        value={selectedTeacher}
                                        onChange={setSelectedTeacher}
                                        placeholder="Choose Teacher"
                                    />

                                    <div className="textarea-wrapper" style={{ position: 'relative' }}>
                                        <textarea
                                            placeholder="Describe your problem in detail..."
                                            className="brutalist-input"
                                            style={{ width: '100%', minHeight: '180px', background: '#000', border: '2px solid #333', color: '#fff', padding: '1.2rem', fontSize: '1rem', outline: 'none' }}
                                            value={doubtText}
                                            onChange={(e) => setDoubtText(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        {/* Image Upload Zone */}
                                        <div 
                                            className="upload-zone" 
                                            onClick={handleImageClick}
                                            style={{ 
                                                flex: 1, 
                                                minWidth: '200px',
                                                border: imagePreview ? '2px solid #fbbf24' : '2px dashed #444', 
                                                padding: '1rem', 
                                                textAlign: 'center', 
                                                cursor: 'pointer',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minHeight: '100px',
                                                background: imagePreview ? 'rgba(251, 191, 36, 0.05)' : 'transparent'
                                            }}
                                        >
                                            <input 
                                                type="file" 
                                                ref={imageInputRef} 
                                                accept="image/*" 
                                                onChange={handleImageChange} 
                                                style={{ display: 'none' }} 
                                            />
                                            {imagePreview ? (
                                                <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <img src={imagePreview} alt="Preview" style={{ maxHeight: '80px', maxWidth: '100%', borderRadius: '4px', marginBottom: '8px' }} />
                                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#fbbf24', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {selectedFile?.name || 'image.png'}
                                                    </div>
                                                    <button 
                                                        onClick={removeImage} 
                                                        style={{ 
                                                            position: 'absolute', 
                                                            top: '-8px', 
                                                            right: '-8px', 
                                                            background: '#ef4444', 
                                                            color: '#fff', 
                                                            border: 'none', 
                                                            borderRadius: '50%', 
                                                            width: '20px', 
                                                            height: '20px', 
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload size={20} color="#fbbf24" style={{ marginBottom: '5px' }} />
                                                    <div style={{ fontSize: '0.7rem', fontWeight: '800' }}>UPLOAD IMAGE</div>
                                                </>
                                            )}
                                        </div>

                                        {/* Audio Record Zone */}
                                        <div 
                                            className="upload-zone" 
                                            onClick={isRecording ? stopRecording : (audioUrl ? undefined : startRecording)}
                                            style={{ 
                                                flex: 1, 
                                                minWidth: '200px',
                                                border: audioUrl ? '2px solid #f87171' : (isRecording ? '2px dashed #f87171' : '2px dashed #444'), 
                                                padding: '1rem', 
                                                textAlign: 'center', 
                                                cursor: 'pointer',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minHeight: '100px',
                                                background: isRecording ? 'rgba(248, 113, 113, 0.05)' : 'transparent'
                                            }}
                                        >
                                            {isRecording ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                                    <div className="pulse-mic" style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f87171' }}>RECORDING {formatTime(recordingTime)}</div>
                                                    <div style={{ fontSize: '0.65rem', color: '#888' }}>Click to Stop</div>
                                                </div>
                                            ) : audioUrl ? (
                                                <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                    <Mic size={18} color="#f87171" />
                                                    {audioUrl === 'mock-audio' ? (
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4ade80' }}>🎙️ Voice note recorded (Simulated)</div>
                                                    ) : (
                                                        <audio src={audioUrl} controls style={{ width: '100%', height: '32px' }} onClick={e => e.stopPropagation()} />
                                                    )}
                                                    <button 
                                                        onClick={removeAudio} 
                                                        style={{ 
                                                            position: 'absolute', 
                                                            top: '-8px', 
                                                            right: '-8px', 
                                                            background: '#ef4444', 
                                                            color: '#fff', 
                                                            border: 'none', 
                                                            borderRadius: '50%', 
                                                            width: '20px', 
                                                            height: '20px', 
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Mic size={20} color="#f87171" style={{ marginBottom: '5px' }} />
                                                    <div style={{ fontSize: '0.7rem', fontWeight: '800' }}>RECORD AUDIO</div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <button type="submit" className="brutalist-btn-yellow" style={{ padding: '1.2rem', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                        <Send size={20} /> SEND TO TEACHER
                                    </button>
                                </form>
                            )}
                        </>
                    ) : (
                        <div className="status-container" style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                            <div className={`status-icon-box ${status}`} style={{ width: '100px', height: '100px', margin: '0 auto 2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '5px solid', borderColor: status === 'resolved' ? '#4ade80' : '#fbbf24' }}>
                                {status === 'resolved' ? <Check size={50} color="#4ade80" /> : <Clock size={50} color="#fbbf24" />}
                            </div>
                            
                            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                {status === 'resolved' ? "PROBLEM SOLVED!" : "TEACHER NOTIFIED"}
                            </h2>
                            <p style={{ color: '#888', marginBottom: '2.5rem' }}>
                                {status === 'resolved' 
                                    ? `Teacher ${activeDoubt.teacher} has resolved your doubt.` 
                                    : `Waiting for ${activeDoubt.teacher} to review and solve your problem.`}
                            </p>

                            <div className="active-doubt-preview" style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', textAlign: 'left', marginBottom: '2.5rem', borderLeft: '4px solid #fbbf24' }}>
                                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>YOUR QUESTION:</strong>
                                <p style={{ margin: 0, fontStyle: 'italic' }}>"{activeDoubt.question}"</p>
                            </div>

                            {status === 'pending' && (
                                <button className="sim-btn" onClick={simulateTeacherSolve} style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    (DEMO: Simulate Teacher Solve)
                                </button>
                            )}

                            {status === 'resolved' && (
                                <button className="brutalist-btn-yellow" style={{ width: '100%', padding: '1rem' }} onClick={() => setStatus('idle')}>
                                    ASK ANOTHER DOUBT
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: History Sidebar (Conditional) */}
                {showHistory && (
                    <div className="history-sidebar animate-fadeIn" style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, letterSpacing: '1px' }}>DOUBT HISTORY</h3>
                            <Bell size={18} color="#666" />
                        </div>

                        <div className="doubt-stack" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {doubts.map((d) => (
                                <div key={d.id} className="history-card" style={{ background: '#111', border: '1px solid #333', padding: '1.2rem', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                    <div className={`status-stripe ${d.status.toLowerCase()}`} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: d.status === 'Resolved' ? '#4ade80' : '#fbbf24' }} />
                                    <div style={{ marginLeft: '10px' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '800' }}>{d.question}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: '900' }}>{d.subject.toUpperCase()} • {d.time}</span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '900', color: d.status === 'Resolved' ? '#4ade80' : '#fbbf24' }}>
                                                {d.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {notification && (
                <div className="toast-notification-pop">
                    <div className="toast-icon">🔔</div>
                    <div className="toast-content">
                        <span className="toast-title">New Notification</span>
                        <p className="toast-msg">{notification.message}</p>
                    </div>
                    <button className="toast-close" onClick={() => setNotification(null)}>×</button>
                </div>
            )}

            <style>{`
                .brutalist-btn-yellow {
                    background: #fbbf24;
                    color: #000;
                    border: 3px solid #000;
                    box-shadow: 6px 6px 0px #000;
                    transition: all 0.1s;
                }
                .brutalist-btn-yellow:active {
                    transform: translate(2px, 2px);
                    box-shadow: 2px 2px 0px #000;
                }
                .upload-zone:hover {
                    border-color: #fbbf24 !important;
                    background: #1a1a1a;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default DoubtSolving;
