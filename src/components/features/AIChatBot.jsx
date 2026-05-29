'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Copy, Sparkles, Download, Check, Image as ImageIcon, X, History, Plus } from 'lucide-react';

const renderMarkdown = (text) => {
    if (!text) return null;
    
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const lines = part.slice(3, -3).trim().split('\n');
            const firstLine = lines[0];
            const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
            const code = hasLang ? lines.slice(1).join('\n') : lines.join('\n');
            const lang = hasLang ? firstLine : '';
            
            return (
                <div key={index} className="markdown-code-block-container" style={{
                    margin: '8px 0',
                    background: '#1b1c24',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    fontFamily: 'monospace'
                }}>
                    {lang && (
                        <div style={{
                            background: '#111217',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            textTransform: 'uppercase',
                            fontWeight: 'bold'
                        }}>
                            {lang}
                        </div>
                    )}
                    <pre style={{
                        margin: 0,
                        padding: '10px',
                        overflowX: 'auto',
                        fontSize: '0.8rem',
                        color: '#f8f8f2',
                        lineHeight: '1.4'
                    }}><code>{code}</code></pre>
                </div>
            );
        } else {
            const lines = part.split('\n');
            return lines.map((line, lineIdx) => {
                let currentLine = line;
                
                if (!currentLine.trim()) {
                    return <div key={`${index}-${lineIdx}`} style={{ height: '8px' }} />;
                }
                
                let isListItem = false;
                let listBullet = '';
                if (currentLine.trim().startsWith('- ') || currentLine.trim().startsWith('* ')) {
                    isListItem = true;
                    listBullet = '• ';
                    currentLine = currentLine.trim().slice(2);
                } else if (/^\d+\.\s/.test(currentLine.trim())) {
                    isListItem = true;
                    const match = currentLine.trim().match(/^(\d+\.)\s/);
                    listBullet = match[1] + ' ';
                    currentLine = currentLine.trim().slice(match[0].length);
                }
                
                const inlineParts = [];
                const regex = /(\*\*.*?\*\*|`.*?`|https?:\/\/[^\s]+)/g;
                const matches = currentLine.split(regex);
                
                matches.forEach((item, itemIdx) => {
                    if (item.startsWith('**') && item.endsWith('**')) {
                        inlineParts.push(<strong key={itemIdx} style={{ color: '#fff', fontWeight: '700' }}>{item.slice(2, -2)}</strong>);
                    } else if (item.startsWith('`') && item.endsWith('`')) {
                        inlineParts.push(
                            <code key={itemIdx} style={{
                                background: 'rgba(255,255,255,0.08)',
                                padding: '2px 5px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                color: '#f43f5e'
                            }}>
                                {item.slice(1, -1)}
                            </code>
                        );
                    } else if (item.startsWith('http://') || item.startsWith('https://')) {
                        inlineParts.push(
                            <a key={itemIdx} href={item} target="_blank" rel="noopener noreferrer" style={{
                                color: '#6366f1',
                                textDecoration: 'underline'
                            }}>
                                {item}
                            </a>
                        );
                    } else {
                        inlineParts.push(item);
                    }
                });
                
                return (
                    <p key={`${index}-${lineIdx}`} style={{ 
                        margin: '0 0 6px 0', 
                        lineHeight: '1.45',
                        paddingLeft: isListItem ? '12px' : '0',
                        textIndent: isListItem ? '-12px' : '0'
                    }}>
                        {isListItem && <span style={{ color: '#6366f1', fontWeight: 'bold' }}>{listBullet}</span>}
                        {inlineParts}
                    </p>
                );
            });
        }
    });
};

const AIChatBot = () => {
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Load sessions on mount
    useEffect(() => {
        const savedSessions = localStorage.getItem('prepcare_chat_sessions');
        if (savedSessions) {
            try {
                const parsed = JSON.parse(savedSessions);
                setSessions(parsed);
                if (parsed.length > 0) {
                    setCurrentSessionId(parsed[0].id);
                    setMessages(parsed[0].messages);
                } else {
                    initializeDefaultSession();
                }
            } catch (e) {
                console.error('Error loading chat sessions', e);
                initializeDefaultSession();
            }
        } else {
            initializeDefaultSession();
        }
    }, []);

    const initializeDefaultSession = () => {
        const newSessionId = `session-${Date.now()}`;
        const initialWelcome = [
            {
                id: 'welcome',
                sender: 'ai',
                text: 'Hello! I am Prepcare, your AI Study Assistant. Ask me any academic questions, or upload an image of a problem to scan and solve!',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ];
        const defaultSession = {
            id: newSessionId,
            title: 'New Study Session',
            messages: initialWelcome,
            timestamp: new Date().toLocaleDateString()
        };
        setSessions([defaultSession]);
        setCurrentSessionId(newSessionId);
        setMessages(initialWelcome);
        localStorage.setItem('prepcare_chat_sessions', JSON.stringify([defaultSession]));
    };

    // Update active session messages when state changes
    useEffect(() => {
        if (!currentSessionId || sessions.length === 0) return;
        
        const updatedSessions = sessions.map(session => {
            if (session.id === currentSessionId) {
                let title = session.title;
                if (title === 'New Study Session') {
                    const firstUserMsg = messages.find(m => m.sender === 'user');
                    if (firstUserMsg) {
                        title = firstUserMsg.text.length > 25 
                            ? firstUserMsg.text.substring(0, 22) + '...' 
                            : firstUserMsg.text;
                    }
                }
                return { ...session, messages, title };
            }
            return session;
        });

        const diff = JSON.stringify(updatedSessions) !== JSON.stringify(sessions);
        if (diff) {
            setSessions(updatedSessions);
            localStorage.setItem('prepcare_chat_sessions', JSON.stringify(updatedSessions));
        }
    }, [messages, currentSessionId]);

    const startNewChat = () => {
        const newSessionId = `session-${Date.now()}`;
        const initialWelcome = [
            {
                id: 'welcome',
                sender: 'ai',
                text: 'Hello! I am Prepcare, your AI Study Assistant. Ask me any academic questions, or upload an image of a problem to scan and solve!',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ];
        const newSession = {
            id: newSessionId,
            title: 'New Study Session',
            messages: initialWelcome,
            timestamp: new Date().toLocaleDateString()
        };
        
        const updatedSessions = [newSession, ...sessions];
        setSessions(updatedSessions);
        setCurrentSessionId(newSessionId);
        setMessages(initialWelcome);
        localStorage.setItem('prepcare_chat_sessions', JSON.stringify(updatedSessions));
    };

    const selectSession = (sessionId) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            setCurrentSessionId(sessionId);
            setMessages(session.messages);
        }
    };

    const deleteSession = (e, sessionId) => {
        e.stopPropagation();
        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(updatedSessions);
        
        if (updatedSessions.length === 0) {
            initializeDefaultSession();
        } else {
            localStorage.setItem('prepcare_chat_sessions', JSON.stringify(updatedSessions));
            if (sessionId === currentSessionId) {
                setCurrentSessionId(updatedSessions[0].id);
                setMessages(updatedSessions[0].messages);
            }
        }
    };


    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file (PNG/JPG).');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file (PNG/JPG).');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (textToSend = inputText) => {
        if (!textToSend.trim() && !selectedImage) return;

        const currentImage = selectedImage;
        const userMsgText = textToSend;

        const userMessage = {
            id: `msg-${Date.now()}`,
            sender: 'user',
            text: userMsgText,
            image: currentImage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsTyping(true);

        try {
            // Prepare chat history to send to server
            // Only send last 10 messages to keep request lightweight
            const chatHistory = messages.slice(-10).map(m => ({
                sender: m.sender,
                text: m.text,
                image: m.image
            }));

            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsgText,
                    image: currentImage,
                    history: chatHistory
                })
            });

            if (!response.ok) {
                throw new Error('Failed to connect to assistant api.');
            }

            const data = await response.json();

            const aiMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: 'ai',
                text: data.text || 'Sorry, I encountered an issue processing your request.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: 'ai',
                text: '❌ Connection error. Please make sure local Ollama is active with gemma4:latest.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const clearChat = () => {
        if (window.confirm('Clear conversation history?')) {
            setMessages([
                {
                    id: 'welcome',
                    sender: 'ai',
                    text: 'Hello! I am Prepcare, your AI Study Assistant. How can I help you with your studies today?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }
    };

    const downloadChat = () => {
        const transcript = messages
            .map(m => `[${m.timestamp}] ${m.sender === 'ai' ? 'Prepcare Assistant' : 'You'}: ${m.text}`)
            .join('\n\n');

        const blob = new Blob([transcript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prepcare-chat-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    return (
        <div className="premium-chat-wrapper">
            {/* Sidebar for Chat History */}
            <div className={`chat-history-sidebar ${isHistoryOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Study History</h3>
                    <button className="new-chat-btn" onClick={startNewChat} title="Start New Session">
                        <Plus size={14} /> New Chat
                    </button>
                </div>
                <div className="sidebar-list">
                    {sessions.map(session => (
                        <div 
                            key={session.id} 
                            className={`history-item ${session.id === currentSessionId ? 'active' : ''}`}
                            onClick={() => selectSession(session.id)}
                        >
                            <div className="history-details">
                                <span className="history-title">{session.title}</span>
                                <span className="history-date">{session.timestamp}</span>
                            </div>
                            <button className="delete-history-btn" onClick={(e) => deleteSession(e, session.id)} title="Delete Session">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Container */}
            <div className="main-chat-container">
                {/* Header Area */}
                <div className="chat-header">
                    <div className="bot-info">
                        <div className="bot-avatar-glow">
                            <Bot size={22} className="bot-icon" />
                            <div className="online-indicator"></div>
                        </div>
                        <div className="bot-details">
                            <div className="bot-title-row">
                                <span className="bot-name">Prepcare</span>
                            </div>
                            <span className="bot-desc">Academic & Study Assistant</span>
                        </div>
                    </div>
                    <div className="header-controls">
                        <button 
                            className={`control-btn ${isHistoryOpen ? 'active' : ''}`} 
                            onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
                            title="Toggle Chat History"
                        >
                            <History size={16} />
                        </button>
                        <button className="control-btn" onClick={downloadChat} title="Download Conversation">
                            <Download size={16} />
                        </button>
                        <button className="control-btn" onClick={clearChat} title="Clear Messages">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

            {/* Message History View */}
            <div className="chat-viewport">
                {messages.map((msg) => (
                    <div key={msg.id} className={`chat-bubble-container ${msg.sender === 'user' ? 'user-layout' : 'ai-layout'}`}>
                        <div className="avatar-frame">
                            {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                        </div>
                        <div className="bubble-wrapper">
                            <div className="message-bubble">
                                {/* If message has an image, render it */}
                                {msg.image && (
                                    <div className="bubble-image-container">
                                        <img src={msg.image} alt="Uploaded problem file" className="bubble-image" />
                                    </div>
                                )}
                                <div className="message-content-text">
                                    {renderMarkdown(msg.text)}
                                </div>
                            </div>
                            <div className="message-actions-row">
                                <span className="bubble-time">{msg.timestamp}</span>
                                <button
                                    className="bubble-copy-btn"
                                    onClick={() => copyToClipboard(msg.text, msg.id)}
                                    title="Copy text"
                                >
                                    {copiedId === msg.id ? <Check size={11} className="copied" /> : <Copy size={11} />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="chat-bubble-container ai-layout">
                        <div className="avatar-frame typing-frame">
                            <Bot size={15} />
                        </div>
                        <div className="bubble-wrapper">
                            <div className="message-bubble typing-bubble">
                                <div className="dot-wave">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar & Controls */}
            <div className="chat-composer">
                {/* Image Upload Thumbnail Preview */}
                {selectedImage && (
                    <div className="upload-preview-container">
                        <div className="preview-thumbnail">
                            <img src={selectedImage} alt="Attachment thumbnail" className="thumbnail-img" />
                            <button className="remove-preview-btn" onClick={removeSelectedImage}>
                                <X size={12} />
                            </button>
                        </div>
                        <span className="preview-label">Image attached - Prepcare will scan this image on send</span>
                    </div>
                )}


                <div 
                    className="composer-row"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                >
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        className="attach-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload Image / Problem Screenshot"
                    >
                        <ImageIcon size={18} />
                    </button>

                    <input
                        type="text"
                        placeholder="Ask Prepcare a study question, or scan a problem image..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        className="composer-input"
                    />

                    <button
                        className="send-trigger"
                        onClick={() => handleSendMessage()}
                        disabled={!inputText.trim() && !selectedImage}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
            </div>

            <style>{`
                .premium-chat-wrapper {
                    display: flex;
                    flex-direction: row;
                    height: calc(100vh - 150px);
                    background: #0f1015;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
                    overflow: hidden;
                    font-family: inherit;
                    position: relative;
                }

                .chat-history-sidebar {
                    width: 0;
                    background: #14151c;
                    border-right: none;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }

                .chat-history-sidebar.open {
                    width: 260px;
                    border-right: 1px solid rgba(255, 255, 255, 0.08);
                }

                .sidebar-header {
                    padding: 1.25rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .sidebar-header h3 {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: 0.5px;
                }

                .new-chat-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: #fff;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .new-chat-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                .sidebar-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .history-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                }

                .history-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                .history-item.active {
                    background: rgba(99, 102, 241, 0.1);
                    border-color: rgba(99, 102, 241, 0.2);
                }

                .history-details {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    max-width: 80%;
                }

                .history-title {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #e2e8f0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .history-date {
                    font-size: 0.65rem;
                    color: rgba(255, 255, 255, 0.35);
                }

                .delete-history-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .delete-history-btn:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                .main-chat-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                }

                /* Header Area */
                .chat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    background: rgba(20, 21, 28, 0.95);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .bot-info {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .bot-avatar-glow {
                    position: relative;
                    width: 42px;
                    height: 42px;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
                }

                .bot-icon {
                    color: #fff;
                }

                .online-indicator {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 10px;
                    height: 10px;
                    background: #10b981;
                    border: 2px solid #0f1015;
                    border-radius: 50%;
                }

                .bot-details {
                    display: flex;
                    flex-direction: column;
                }

                .bot-title-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bot-name {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: 0.3px;
                }

                .model-badge {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #fbbf24;
                    background: rgba(251, 191, 36, 0.1);
                    border: 1px solid rgba(251, 191, 36, 0.25);
                    padding: 1px 6px;
                    border-radius: 4px;
                }

                .bot-desc {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.45);
                    margin-top: 2px;
                }

                .header-controls {
                    display: flex;
                    gap: 10px;
                }

                .control-btn {
                    width: 36px;
                    height: 36px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .control-btn:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: #6366f1;
                }

                /* Chat Viewport */
                .chat-viewport {
                    flex: 1;
                    padding: 1.5rem;
                    overflow-y: auto;
                    background: #0b0c10;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .chat-bubble-container {
                    display: flex;
                    gap: 12px;
                    max-width: 80%;
                }

                .user-layout {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }

                .ai-layout {
                    align-self: flex-start;
                }

                .avatar-frame {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 4px;
                }

                .user-layout .avatar-frame {
                    background: rgba(99, 102, 241, 0.15);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    color: #818cf8;
                }

                .ai-layout .avatar-frame {
                    background: rgba(251, 191, 36, 0.15);
                    border: 1px solid rgba(251, 191, 36, 0.3);
                    color: #fbbf24;
                }

                .bubble-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .message-bubble {
                    padding: 1rem 1.25rem;
                    border-radius: 14px;
                    font-size: 0.92rem;
                    line-height: 1.5;
                }

                .user-layout .message-bubble {
                    background: linear-gradient(135deg, #4f46e5, #3b82f6);
                    color: #fff;
                    border-bottom-right-radius: 2px;
                    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
                }

                .ai-layout .message-bubble {
                    background: #15171e;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: #e5e7eb;
                    border-bottom-left-radius: 2px;
                }

                .bubble-image-container {
                    margin-bottom: 0.75rem;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    max-width: 320px;
                }

                .bubble-image {
                    width: 100%;
                    height: auto;
                    display: block;
                }

                .message-line {
                    margin: 0 0 0.5rem 0;
                }

                .message-line:last-child {
                    margin: 0;
                }

                .message-actions-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 4px;
                }

                .user-layout .message-actions-row {
                    justify-content: flex-end;
                }

                .bubble-time {
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.35);
                }

                .bubble-copy-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 2px;
                    transition: color 0.2s ease;
                }

                .bubble-copy-btn:hover {
                    color: #fff;
                }

                /* Typing wave */
                .typing-bubble {
                    padding: 0.8rem 1.2rem;
                }

                .dot-wave {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    height: 12px;
                }

                .dot {
                    width: 6px;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    animation: dotPulse 1.4s infinite ease-in-out;
                }

                .dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes dotPulse {
                    0%, 100% { transform: scale(0.8); opacity: 0.4; }
                    50% { transform: scale(1.3); opacity: 1; }
                }

                /* Composer / Input Area */
                .chat-composer {
                    background: #14151c;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 1.25rem 1.5rem;
                }

                /* Image Attachment Preview */
                .upload-preview-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 8px 12px;
                    margin-bottom: 12px;
                }

                .preview-thumbnail {
                    position: relative;
                    width: 48px;
                    height: 48px;
                    border-radius: 6px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                }

                .thumbnail-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .remove-preview-btn {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    width: 16px;
                    height: 16px;
                    background: rgba(0, 0, 0, 0.7);
                    border: none;
                    border-radius: 50%;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.15s;
                }

                .remove-preview-btn:hover {
                    background: #ef4444;
                }

                .preview-label {
                    font-size: 0.78rem;
                    color: rgba(255, 255, 255, 0.5);
                }

                /* Prompt Suggestion Chips */
                .prompts-scroll {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                    margin-bottom: 10px;
                    scrollbar-width: none; /* Hide default scrollbar */
                }

                .prompts-scroll::-webkit-scrollbar {
                    display: none;
                }

                .suggestion-chip {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 20px;
                    color: rgba(255, 255, 255, 0.75);
                    padding: 6px 14px;
                    font-size: 0.78rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                    transition: all 0.2s ease;
                }

                .suggestion-chip:hover {
                    background: rgba(99, 102, 241, 0.1);
                    border-color: #6366f1;
                    color: #fff;
                    transform: translateY(-1px);
                }

                .chip-sparkle {
                    margin-right: 5px;
                    color: #fbbf24;
                }

                /* Input Composer Row */
                .composer-row {
                    display: flex;
                    align-items: center;
                    background: #0b0c10;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 6px;
                    transition: border-color 0.2s ease;
                }

                .composer-row:focus-within {
                    border-color: #6366f1;
                }

                .attach-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.45);
                    width: 38px;
                    height: 38px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .attach-btn:hover {
                    color: #6366f1;
                    background: rgba(255, 255, 255, 0.03);
                }

                .composer-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    padding: 8px 12px;
                    font-size: 0.92rem;
                    outline: none;
                }

                .composer-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .send-trigger {
                    background: #6366f1;
                    border: none;
                    color: #fff;
                    width: 38px;
                    height: 38px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .send-trigger:hover:not(:disabled) {
                    background: #4f46e5;
                    transform: scale(1.02);
                }

                .send-trigger:disabled {
                    background: rgba(255, 255, 255, 0.03);
                    color: rgba(255, 255, 255, 0.2);
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default AIChatBot;
