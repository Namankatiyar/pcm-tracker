import { useState } from 'react';
import { ProgressRing } from './ProgressBar';
import { Subject, SubjectData, PlannerTask } from '../types';
import { TaskLog } from './TaskLog';
import { DatePickerModal } from './DatePickerModal';
import { Atom, FlaskConical, Calculator, Zap, Calendar, Check } from 'lucide-react';
import { formatDateLocal, formatTime12Hour } from '../utils/date';

interface DashboardProps {
// ...
    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return 'Set Target Date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const todayStr = formatDateLocal(new Date());
    const todaysTasks = plannerTasks
        .filter(t => t.date === todayStr)
        .sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return a.time.localeCompare(b.time);
        });

    const isTaskOverdue = (task: PlannerTask) => {
        if (task.completed) return false;
        const now = new Date();
        const [hours, minutes] = task.time.split(':').map(Number);
        const taskTime = new Date();
        taskTime.setHours(hours, minutes, 0, 0);
        return now > taskTime;
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                {quote ? (
                    <div className="quote-container">
                        <h1>"{quote.quote}"</h1>
                        <p className="quote-author">- {quote.author}</p>
                    </div>
                ) : (
                    <h1>Your Progress</h1>
                )}
            </div>

            <div className="dashboard-stats-row">
                <div className="overall-progress-card">
                    <div className="overall-content">
                        <div className="overall-text">
                            <h2>Overall Progress</h2>
                            <p>Combined progress across all subjects</p>
                        </div>
                        <ProgressRing progress={overallProgress} size={140} strokeWidth={10} color="var(--accent)" />
                    </div>
                    <div className="overall-stats">
                        <div className="stat">
                            <span className="stat-value">{(subjectData.physics?.chapters.length || 0) + (subjectData.chemistry?.chapters.length || 0) + (subjectData.maths?.chapters.length || 0)}</span>
                            <span className="stat-label">Total Chapters</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">3</span>
                            <span className="stat-label">Subjects</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{overallProgress}%</span>
                            <span className="stat-label">Complete</span>
                        </div>
                    </div>
                </div>

                <div className="agenda-card">
                    <div className="agenda-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2>Today's Agenda</h2>
                            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                        {todaysTasks.length > 0 && (
                            <button 
                                onClick={onQuickAdd}
                                className="icon-btn"
                                style={{ 
                                    background: 'var(--bg-tertiary)', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: '50%', 
                                    padding: '0.5rem',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                title="Add task"
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.color = 'var(--accent)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                <Check size={16} style={{ display: 'none' }} /> {/* Dummy for import check? No, I need Plus */}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                            </button>
                        )}
                    </div>
                    
                    <div className="agenda-list">
                        {todaysTasks.length > 0 ? (
                            todaysTasks.map(task => (
                                <div key={task.id} className={`agenda-item ${task.completed ? 'completed' : ''}`}>
                                    <button 
                                        className={`agenda-check ${task.completed ? 'checked' : ''}`}
                                        onClick={() => onToggleTask(task.id)}
                                    >
                                        {task.completed && <Check size={12} />}
                                    </button>
                                    <div className="agenda-info">
                                        <span className="agenda-title">
                                            {task.title}
                                            {isTaskOverdue(task) && <span className="pending-tag">Pending</span>}
                                        </span>
                                        {task.subtitle && (
                                            <span className="agenda-subtitle">
                                                {task.subject && (
                                                    <span style={{ 
                                                        color: `var(--${task.subject})`, 
                                                        fontWeight: 600,
                                                        marginRight: '4px'
                                                    }}>
                                                        {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)} •
                                                    </span>
                                                )}
                                                {task.subtitle}
                                            </span>
                                        )}
                                    </div>
                                    <div className="agenda-time">
                                        {formatTime12Hour(task.time)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div 
                                className="empty-agenda clickable" 
                                onClick={onQuickAdd}
                                style={{ cursor: 'pointer' }}
                                title="Click to add a task"
                            >
                                <p>No tasks scheduled for today.</p>
                                <p className="empty-hint">Click here to add a task!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="exam-countdown-card">
                    <div className="countdown-header">
                        <h2>Exam Countdown</h2>
                        <p>Keep your eyes on the target</p>
                    </div>
                    
                    <div className="countdown-content">
                        {daysRemaining !== null ? (
                            <div className="days-display">
                                <span 
                                    className="days-value"
                                    style={{ 
                                        color: getCountdownColor(daysRemaining),
                                        background: 'none',
                                        WebkitTextFillColor: 'initial'
                                    }}
                                >
                                    {daysRemaining}
                                </span>
                                <span className="days-label">{Math.abs(daysRemaining) === 1 ? 'Day' : 'Days'} {daysRemaining >= 0 ? 'Left' : 'Ago'}</span>
                            </div>
                        ) : (
                            <div className="no-date-message">
                                Set your exam date to start counting down
                            </div>
                        )}
                        
                        <div className="date-input-container">
                            <label htmlFor="exam-date-btn">Target Date:</label>
                            <button 
                                id="exam-date-btn"
                                className="date-display-btn"
                                onClick={() => setIsDatePickerOpen(true)}
                            >
                                <span>{formatDateDisplay(examDate)}</span>
                                <Calendar size={18} className="calendar-icon" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="subject-cards">
                {subjects.map(({ key, label, icon, progress, color }) => {
                    const stats = getChapterStats(key);
                    return (
                        <div
                            key={key}
                            className="subject-card"
                            onClick={() => onNavigate(key)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && onNavigate(key)}
                        >
                            <div className="subject-card-header">
                                <span className="subject-icon">{icon}</span>
                                <h3>{label}</h3>
                            </div>
                            <ProgressRing progress={progress} size={100} strokeWidth={6} color={color} />
                            <div className="subject-card-footer">
                                <span className="chapter-count">{stats.total} Chapters</span>
                                <span className="view-link">View Details →</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <TaskLog tasks={plannerTasks} />

            <div className="motivation-card">
                <div className="motivation-icon"><Zap size={32} /></div>
                <div className="motivation-text">
                    <h3>Keep Going!</h3>
                    <p>Consistency is the key to cracking JEE. Complete at least one chapter today!</p>
                </div>
            </div>

            <DatePickerModal 
                isOpen={isDatePickerOpen}
                selectedDate={examDate}
                onSelect={onExamDateChange}
                onClose={() => setIsDatePickerOpen(false)}
            />
        </div>
    );
}