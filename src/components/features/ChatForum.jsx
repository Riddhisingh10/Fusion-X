"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Send, Users, Hash, ArrowLeft } from 'lucide-react';
import './FeatureStyles.css';

const ChatForum = () => {
    const { chatRooms, chatMessages } = mockBackend;
    const [activeRoom, setActiveRoom] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState(chatMessages);

    const handleSend = () => {
        if (!newMessage.trim()) return;
        setMessages(prev => [...prev, {
            id: Date.now(), roomId: activeRoom.id, user: 'You',
            message: newMessage, time: 'Just now', isOwn: true
        }]);
        setNewMessage('');
    };

    const roomMessages = messages.filter(m => m.roomId === activeRoom?.id);

    return (
        <div className="chat-container animate-enter" style={{ padding: '2rem' }}>


            <div className="chat-layout">
                {/* Room List */}
                <div className={`room-list ${activeRoom ? 'hidden-mobile' : ''}`}>
                    <h3 style={{ padding: '1rem', borderBottom: '2px solid var(--border-color)' }}>Channels</h3>
                    {chatRooms.map(room => (
                        <div key={room.id} className={`room-item ${activeRoom?.id === room.id ? 'active' : ''}`}
                            onClick={() => setActiveRoom(room)}>
                            <Hash size={18} />
                            <div className="room-info">
                                <span className="room-name">{room.name}</span>
                                <span className="room-preview">{room.lastMessage}</span>
                            </div>
                            <div className="room-meta">
                                <span className="room-time">{room.lastTime}</span>
                                <span className="member-count"><Users size={12} /> {room.members}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat Area */}
                <div className={`chat-area ${!activeRoom ? 'empty' : ''}`}>
                    {activeRoom ? (
                        <>
                            <div className="chat-header">
                                <button className="back-btn-mobile" onClick={() => setActiveRoom(null)}>
                                    <ArrowLeft size={20} />
                                </button>
                                <Hash size={18} />
                                <h3>{activeRoom.name}</h3>
                                <span className="online-count">{activeRoom.members} members</span>
                            </div>
                            <div className="messages-area">
                                {roomMessages.map(msg => (
                                    <div key={msg.id} className={`message ${msg.isOwn ? 'own' : ''}`}>
                                        {!msg.isOwn && <div className="msg-avatar">{msg.user.charAt(0)}</div>}
                                        <div className="msg-content">
                                            {!msg.isOwn && <span className="msg-user">{msg.user}</span>}
                                            <p>{msg.message}</p>
                                            <span className="msg-time">{msg.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input-bar">
                                <input
                                    type="text"
                                    placeholder={`Message #${activeRoom.name}...`}
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                />
                                <button className="send-btn" onClick={handleSend}>
                                    <Send size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="empty-chat">
                            <Hash size={64} color="var(--text-secondary)" />
                            <h3>Select a channel to start chatting</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatForum;
