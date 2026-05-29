"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { 
    Calendar, CheckCircle2, Clock, AlertCircle, 
    BookOpen, Sparkles, Filter, Plus, X 
} from 'lucide-react';
import './FeatureStyles.css';

const AssignmentHub = () => {
    const [filter, setFilter] = useState('All');
    const [homework, setHomework] = useState(mockBackend.homework || []);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newSubject, setNewSubject] = useState('');
    const [newPriority, setNewPriority] = useState('Medium');
    const [newDueDate, setNewDueDate] = useState('');

    const filteredHomework = homework.filter(hw => 
        filter === 'All' ? true : hw.status === filter
    );

    const getPriorityColor = (priority) => {
        switch(priority.toLowerCase()) {
            case 'high': return 'var(--error)';
            case 'medium': return 'var(--accent-action)';
            case 'low': return 'var(--success)';
            default: return 'var(--text-secondary)';
        }
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTitle.trim() || !newSubject.trim() || !newDueDate) {
            return;
        }

        const newTask = {
            id: `hw-${Date.now()}`,
            subject: newSubject.trim(),
            title: newTitle.trim(),
            dueDate: newDueDate,
            priority: newPriority,
            status: 'Pending'
        };

        const updated = [newTask, ...homework];
        setHomework(updated);

        if (mockBackend.homework) {
            mockBackend.homework.unshift(newTask);
        }

        // Reset
        setNewTitle('');
        setNewSubject('');
        setNewPriority('Medium');
        setNewDueDate('');
        setShowModal(false);
    };

    const toggleStatus = (id) => {
        const updated = homework.map(hw => {
            if (hw.id === id) {
                const nextStatus = hw.status === 'Completed' ? 'Pending' : 'Completed';
                return { ...hw, status: nextStatus };
            }
            return hw;
        });
        setHomework(updated);
        
        if (mockBackend.homework) {
            const item = mockBackend.homework.find(hw => hw.id === id);
            if (item) {
                item.status = item.status === 'Completed' ? 'Pending' : 'Completed';
            }
        }
    };

    return (
        <div className="feature-container">
            <div className="feature-header">
                <div className="header-text">
                    <h3>Assignment Hub <Sparkles size={20} className="sparkle-icon" /></h3>
                    <p>Track your assignments and deadlines in real-time.</p>
                </div>
                <div className="header-actions">
                    <div className="filter-pills">
                        {['ALL', 'PENDING', 'COMPLETED'].map(f => (
                            <button 
                                key={f} 
                                className={`pill ${filter === f.charAt(0) + f.slice(1).toLowerCase() || filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase())}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button className="add-task-btn" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> New Task
                    </button>
                </div>
            </div>

            <div className="homework-grid">
                {filteredHomework.map(hw => (
                    <div key={hw.id} className={`hw-card ${hw.status.toLowerCase()}`}>
                        <div className="hw-status-indicator" style={{ background: getPriorityColor(hw.priority) }} />
                        <div className="hw-content">
                            <div className="hw-top">
                                <span className="hw-subject">{hw.subject}</span>
                                <span className="hw-priority" style={{ color: getPriorityColor(hw.priority) }}>
                                    {hw.priority} Priority
                                </span>
                            </div>
                            <h4 className="hw-title">{hw.title}</h4>
                            <div className="hw-footer">
                                <div className="hw-meta">
                                    <Calendar size={14} />
                                    <span>Due: {hw.dueDate}</span>
                                </div>
                                <div 
                                    className={`hw-badge ${hw.status.toLowerCase()}`}
                                    onClick={() => toggleStatus(hw.id)}
                                    style={{ cursor: 'pointer' }}
                                    title="Click to toggle status"
                                >
                                    {hw.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                    {hw.status}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="stats-mini-grid">
                <div className="stat-box cyan">
                    <div className="stat-label">Completion Rate</div>
                    <div className="stat-value">
                        {homework.length > 0 
                            ? `${Math.round((homework.filter(h => h.status === 'Completed').length / homework.length) * 100)}%`
                            : '0%'
                        }
                    </div>
                </div>
                <div className="stat-box purple">
                    <div className="stat-label">Pending Units</div>
                    <div className="stat-value">
                        {homework.filter(h => h.status === 'Pending').length}
                    </div>
                </div>
                <div className="stat-box orange">
                    <div className="stat-label">Total Assignments</div>
                    <div className="stat-value">{homework.length}</div>
                </div>
            </div>

            {/* Modal Dialog for New Task */}
            {showModal && (
                <div className="hub-modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="hub-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="hub-modal-header">
                            <h4 className="hub-modal-title">Establish New Assignment Task</h4>
                            <button className="hub-modal-close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddTask}>
                            <div className="hub-modal-body">
                                <div className="hub-form-group">
                                    <label>Task Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. PCB Design lab report"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="hub-form-group">
                                    <label>Subject / Topic</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Electronic Design"
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="hub-form-group">
                                    <label>Priority Level</label>
                                    <select 
                                        className="filter-select"
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.target.value)}
                                        style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }}
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <div className="hub-form-group">
                                    <label>Due Date</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. 20 March, Tomorrow, or Friday"
                                        value={newDueDate}
                                        onChange={(e) => setNewDueDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="hub-modal-footer">
                                <button type="button" className="hub-btn hub-btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="hub-btn hub-btn-primary">
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentHub;
