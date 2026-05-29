"use client";
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { Pin, Plus, CheckSquare, Square, Circle, Trash2 } from 'lucide-react';
import './FeatureStyles.css';

const PersonalNotes = () => {
    const [notes] = useState(mockBackend.personalNotes);
    const [todos, setTodos] = useState(mockBackend.todos);
    const [newTodo, setNewTodo] = useState('');

    const toggleTodo = (id) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const addTodo = () => {
        if (!newTodo.trim()) return;
        setTodos(prev => [...prev, { id: Date.now(), text: newTodo, done: false, priority: 'medium' }]);
        setNewTodo('');
    };

    const priorityColors = { high: 'var(--error)', medium: 'var(--accent-action)', low: 'var(--success)' };

    return (
        <div className="personal-notes-container animate-enter" style={{ padding: '2rem' }}>


            <div className="notes-todo-layout">
                {/* Quick Notes */}
                <div className="notes-section">
                    <div className="section-head">
                        <h3>Quick Notes</h3>
                        <button className="icon-btn"><Plus size={18} /></button>
                    </div>
                    <div className="notes-masonry">
                        {notes.map(note => (
                            <div key={note.id} className="note-card" style={{ borderTop: `5px solid ${note.color}` }}>
                                <div className="note-header">
                                    <h4>{note.title}</h4>
                                    {note.pinned && <Pin size={14} color={note.color} />}
                                </div>
                                <pre className="note-content">{note.content}</pre>
                                <span className="note-time">{note.updatedAt}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* To-Do List */}
                <div className="todo-section">
                    <div className="section-head">
                        <h3>To-Do List</h3>
                        <span className="todo-count">{todos.filter(t => !t.done).length} remaining</span>
                    </div>

                    <div className="todo-input-bar">
                        <input
                            type="text"
                            placeholder="Add a new task..."
                            value={newTodo}
                            onChange={e => setNewTodo(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addTodo()}
                        />
                        <button className="send-btn" onClick={addTodo}><Plus size={18} /></button>
                    </div>

                    <div className="todo-list">
                        {todos.map(todo => (
                            <div key={todo.id} className={`todo-item ${todo.done ? 'done' : ''}`} onClick={() => toggleTodo(todo.id)}>
                                {todo.done ? <CheckSquare size={20} color="var(--success)" /> : <Square size={20} />}
                                <span className="todo-text">{todo.text}</span>
                                <span className="priority-dot" style={{ background: priorityColors[todo.priority] }}></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalNotes;
