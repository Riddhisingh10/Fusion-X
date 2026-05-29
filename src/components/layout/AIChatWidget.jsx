'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Image as ImageIcon, Sparkles, User, Copy, Check } from 'lucide-react';

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
                    margin: '6px 0',
                    background: '#1b1c24',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    fontFamily: 'monospace'
                }}>
                    {lang && (
                        <div style={{
                            background: '#111217',
                            padding: '3px 8px',
                            fontSize: '0.7rem',
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
                        padding: '8px',
                        overflowX: 'auto',
                        fontSize: '0.75rem',
                        color: '#f8f8f2',
                        lineHeight: '1.35'
                    }}><code>{code}</code></pre>
                </div>
            );
        } else {
            const lines = part.split('\n');
            return lines.map((line, lineIdx) => {
                let currentLine = line;
                
                if (!currentLine.trim()) {
                    return <div key={`${index}-${lineIdx}`} style={{ height: '6px' }} />;
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
                                padding: '1px 4px',
                                borderRadius: '3px',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                color: '#f43f5e'
                            }}>
                                {item.slice(1, -1)}
                            </code>
                        );
                    } else if (item.startsWith('http://') || item.startsWith('https://')) {
                        inlineParts.push(
                            <a key={itemIdx} href={item} target="_blank" rel="noopener noreferrer" style={{
                                color: '#818cf8',
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
                        margin: '0 0 4px 0', 
                        lineHeight: '1.4',
                        paddingLeft: isListItem ? '10px' : '0',
                        textIndent: isListItem ? '-10px' : '0'
                    }}>
                        {isListItem && <span style={{ color: '#818cf8', fontWeight: 'bold' }}>{listBullet}</span>}
                        {inlineParts}
                    </p>
                );
            });
        }
    });
};

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            sender: 'ai',
            text: 'Hi! I am Prepcare. Ask me any study question or upload an image of a problem to solve!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file.');
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
                alert('Please upload an image file.');
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
            const chatHistory = messages.slice(-6).map(m => ({
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
                throw new Error('API request failed');
            }

            const data = await response.json();

            const aiMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: 'ai',
                text: data.text || 'Sorry, I encountered an issue.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('Widget chat error:', error);
            const errorMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: 'ai',
                text: '❌ Connection error. Please make sure Ollama is active with gemma4:latest.',
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

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, isOpen]);

    return (
        <div className="ai-widget-wrapper">
            {/* Widget Toggle FAB */}
            <button 
                className={`widget-fab-btn ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                title="Ask Prepcare"
            >
                {isOpen ? <X size={24} /> : <Bot size={24} />}
                {!isOpen && <span className="tooltip-label">Ask Prepcare</span>}
            </button>

            {/* Chat Box Popup */}
            {isOpen && (
                <div className="widget-popup">
                    {/* Header */}
                    <div className="widget-header">
                        <div className="header-details">
                            <div className="status-indicator"></div>
                            <div>
                                <h4 className="widget-title">Prepcare</h4>
                                <span className="widget-subtitle">AI Study Assistant</span>
                            </div>
                        </div>
                        <button className="widget-close" onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="widget-chat-area">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`widget-bubble-row ${msg.sender === 'user' ? 'user-align' : 'ai-align'}`}>
                                <div className="bubble-box">
                                    {msg.image && (
                                        <div className="bubble-attachment">
                                            <img src={msg.image} alt="Attachment" />
                                        </div>
                                    )}
                                    <div className="bubble-text">
                                        {renderMarkdown(msg.text)}
                                    </div>
                                    <div className="bubble-info">
                                        <span className="bubble-time">{msg.timestamp}</span>
                                        <button className="copy-action" onClick={() => copyToClipboard(msg.text, msg.id)}>
                                            {copiedId === msg.id ? <Check size={10} color="#4ade80" /> : <Copy size={10} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="widget-bubble-row ai-align">
                                <div className="bubble-box typing-box">
                                    <div className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Composer Footer */}
                    <div className="widget-composer">
                        {selectedImage && (
                            <div className="attachment-preview">
                                <img src={selectedImage} alt="Attachment Preview" />
                                <button className="clear-attach" onClick={removeSelectedImage}><X size={10} /></button>
                            </div>
                        )}                         <div 
                            className="composer-input-row"
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
                            <button className="image-attach-btn" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon size={16} />
                            </button>
                            
                            <input
                                type="text"
                                placeholder="Ask study query..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleFileDrop}
                                className="widget-input"
                            />

                            <button 
                                className="widget-send-btn"
                                onClick={() => handleSendMessage()}
                                disabled={!inputText.trim() && !selectedImage}
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .ai-widget-wrapper {
                    position: fixed;
                    bottom: 25px;
                    right: 25px;
                    z-index: 1000;
                    font-family: inherit;
                }

                /* FAB button */
                .widget-fab-btn {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .widget-fab-btn:hover {
                    transform: scale(1.08) translateY(-2px);
                    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.5);
                    background: linear-gradient(135deg, #4f46e5, #3b82f6);
                }

                .widget-fab-btn.active {
                    background: #1f2029;
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                }

                .tooltip-label {
                    position: absolute;
                    left: -110px;
                    top: 15px;
                    background: #000;
                    color: #fff;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s ease;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .widget-fab-btn:hover .tooltip-label {
                    opacity: 1;
                }

                /* Popup box */
                .widget-popup {
                    position: absolute;
                    bottom: 72px;
                    right: 0;
                    width: 350px;
                    height: 480px;
                    background: #0f1015;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes slideUp {
                    from { transform: translateY(15px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                /* Header */
                .widget-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 14px;
                    background: rgba(20, 21, 28, 0.95);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .header-details {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                }

                .widget-title {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: #fff;
                    margin: 0;
                }

                .widget-subtitle {
                    font-size: 0.68rem;
                    color: rgba(255, 255, 255, 0.4);
                }

                .widget-close {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 4px;
                    border-radius: 4px;
                }

                .widget-close:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.05);
                }

                /* Chat Area */
                .widget-chat-area {
                    flex: 1;
                    padding: 12px;
                    overflow-y: auto;
                    background: #0b0c10;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .widget-bubble-row {
                    display: flex;
                    max-width: 85%;
                }

                .user-align {
                    align-self: flex-end;
                }

                .ai-align {
                    align-self: flex-start;
                }

                .bubble-box {
                    padding: 8px 12px;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    color: #e5e7eb;
                }

                .user-align .bubble-box {
                    background: linear-gradient(135deg, #4f46e5, #3b82f6);
                    color: #fff;
                    border-bottom-right-radius: 2px;
                }

                .ai-align .bubble-box {
                    background: #15171e;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-bottom-left-radius: 2px;
                }

                .bubble-attachment {
                    margin-bottom: 6px;
                    border-radius: 4px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    max-width: 200px;
                }

                .bubble-attachment img {
                    width: 100%;
                    height: auto;
                    display: block;
                }

                .bubble-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 4px;
                    font-size: 0.65rem;
                    opacity: 0.6;
                }

                .copy-action {
                    background: transparent;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 1px;
                }

                /* Typing wave */
                .typing-box {
                    padding: 6px 10px;
                }

                .typing-dots {
                    display: flex;
                    gap: 3px;
                }

                .typing-dots span {
                    width: 4px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    animation: bounceDots 1.2s infinite ease-in-out;
                }

                .typing-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes bounceDots {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }

                /* Composer Footer */
                .widget-composer {
                    padding: 10px;
                    background: #14151c;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .attachment-preview {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    border-radius: 4px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    margin-bottom: 8px;
                }

                .attachment-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .clear-attach {
                    position: absolute;
                    top: 1px;
                    right: 1px;
                    background: rgba(0, 0, 0, 0.7);
                    border: none;
                    border-radius: 50%;
                    color: #fff;
                    width: 12px;
                    height: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .composer-input-row {
                    display: flex;
                    align-items: center;
                    background: #0b0c10;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    padding: 3px;
                }

                .composer-input-row:focus-within {
                    border-color: #6366f1;
                }

                .image-attach-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.4);
                    width: 28px;
                    height: 28px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .image-attach-btn:hover {
                    color: #6366f1;
                    background: rgba(255, 255, 255, 0.03);
                }

                .widget-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    padding: 6px;
                    font-size: 0.82rem;
                    outline: none;
                }

                .widget-input::placeholder {
                    color: rgba(255, 255, 255, 0.25);
                }

                .widget-send-btn {
                    background: #6366f1;
                    border: none;
                    color: #fff;
                    width: 28px;
                    height: 28px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .widget-send-btn:hover:not(:disabled) {
                    background: #4f46e5;
                }

                .widget-send-btn:disabled {
                    background: rgba(255, 255, 255, 0.02);
                    color: rgba(255, 255, 255, 0.15);
                    cursor: not-allowed;
                }

                /* Mobile responsivity: adjust popup size */
                @media (max-width: 480px) {
                    .widget-popup {
                        width: calc(100vw - 40px);
                        right: 0;
                        height: 400px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AIChatWidget;
