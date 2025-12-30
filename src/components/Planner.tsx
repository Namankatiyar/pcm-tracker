import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Calendar as CalendarIcon, Clock, Pencil } from 'lucide-react';
import { PlannerTask, Subject, SubjectData } from '../types';
import { TaskModal } from './TaskModal';
import { formatDateLocal, formatTime12Hour } from '../utils/date';

interface PlannerProps {
    tasks: PlannerTask[];
    onAddTask: (task: PlannerTask) => void;
    onEditTask: (task: PlannerTask) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
    subjectData: Record<Subject, SubjectData | null>;
    examDate: string;
    initialOpenDate?: string | null;
    onConsumeInitialDate?: () => void;
}

type ViewMode = 'weekly' | 'monthly';

export function Planner({ tasks, onAddTask, onEditTask, onToggleTask, onDeleteTask, subjectData, examDate, initialOpenDate, onConsumeInitialDate }: PlannerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('weekly');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedDateForTask, setSelectedDateForTask] = useState('');
    const [taskToEdit, setTaskToEdit] = useState<PlannerTask | null>(null);

    // Handle initial open intent
    useEffect(() => {
        if (initialOpenDate) {
            setSelectedDateForTask(initialOpenDate);
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
            if (onConsumeInitialDate) onConsumeInitialDate();
        }
    }, [initialOpenDate, onConsumeInitialDate]);

    const getMonday = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(date.setDate(diff));
    };

    const startOfWeek = getMonday(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        return d;
    });

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const getTasksForDate = (dateStr: string) => {
        return tasks.filter(t => t.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
    };

    const handleAddTaskClick = (dateStr: string) => {
        setSelectedDateForTask(dateStr);
        setTaskToEdit(null);
        setIsTaskModalOpen(true);
    };

    const handleEditClick = (task: PlannerTask) => {
        setTaskToEdit(task);
        setSelectedDateForTask(task.date);
        setIsTaskModalOpen(true);
    };

    const handleMoveTask = (taskId: string, newDateStr: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.date !== newDateStr) {
            onEditTask({ ...task, date: newDateStr });
        }
    };

    const handleSaveTask = (task: PlannerTask) => {
        if (taskToEdit) {
            onEditTask(task);
        } else {
            onAddTask(task);
        }
    };

    return (
        <div className="planner-page">
            <div className="planner-header">
                <div className="view-toggles">
                    <button 
                        className={`view-btn ${viewMode === 'weekly' ? 'active' : ''}`}
                        onClick={() => setViewMode('weekly')}
                    >
                        Weekly
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'monthly' ? 'active' : ''}`}
                        onClick={() => setViewMode('monthly')}
                    >
                        Monthly
                    </button>
                </div>

                <div className="date-controls">
                    <button onClick={handlePrevWeek}><ChevronLeft size={20} /></button>
                    <span className="current-date-range">
                        {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                        {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextWeek}><ChevronRight size={20} /></button>
                </div>
            </div>

            {viewMode === 'monthly' ? (
                <div className="monthly-placeholder">
                    <CalendarIcon size={48} />
                    <h3>Monthly View Coming Soon</h3>
                    <p>Focus on your weekly goals for now!</p>
                </div>
            ) : (
                <div className="weekly-grid">
                    {weekDays.map(day => (
                        <DayColumn 
                            key={day.toISOString()} 
                            date={day} 
                            tasks={getTasksForDate(formatDateLocal(day))}
                            onAddTask={() => handleAddTaskClick(formatDateLocal(day))}
                            onEditTask={handleEditClick}
                            onToggleTask={onToggleTask}
                            onDeleteTask={onDeleteTask}
                            onMoveTask={handleMoveTask}
                            isExamDay={formatDateLocal(day) === examDate}
                        />
                    ))}
                </div>
            )}

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleSaveTask}
                initialDate={selectedDateForTask}
                subjectData={subjectData}
                taskToEdit={taskToEdit}
            />

            <style>{`
                .planner-page {
                    padding: 2rem;
                    max-width: 100%;
                    box-sizing: border-box;
                    margin: 0 auto;
                }
                .planner-header {
                    max-width: 1400px; /* Wider max-width for header */
                    margin: 0 auto 2rem auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .view-toggles {
                    background: var(--bg-secondary);
                    padding: 4px;
                    border-radius: 8px;
                    display: flex;
                    gap: 4px;
                    border: 1px solid var(--border);
                }
                .view-btn {
                    padding: 12px 24px;
                    border-radius: 6px;
                    border: 1px solid transparent;
                    background: transparent;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1.1rem;
                    transition: all 0.2s;
                }
                .view-btn.active {
                    background: var(--accent);
                    color: var(--accent-text);
                    border-color: var(--accent-border);
                    box-shadow: var(--shadow-md);
                }
                .date-controls {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .date-controls button {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--text-primary);
                    transition: all 0.2s;
                }
                .date-controls button:hover {
                    border-color: var(--accent);
                    color: var(--accent);
                }
                .weekly-grid {
                    max-width: 1400px; /* Wider max-width for grid */
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .day-column {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 1rem;
                    min-height: 250px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: var(--shadow-lg), var(--shadow-glow);
                    border: 1px solid var(--border);
                }
                .day-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border);
                }
                .day-header-left {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .day-name {
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .day-number {
                    background: var(--bg-tertiary);
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: var(--text-primary);
                    border: 1px solid transparent;
                }
                .day-column.today .day-number {
                    background: var(--accent);
                    color: var(--accent-text);
                    border-color: var(--accent-border);
                }
                .day-column.drag-over {
                    border-color: var(--accent);
                    background: var(--accent-light);
                    box-shadow: 0 0 0 2px var(--accent-light);
                }
                .header-add-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .header-add-btn:hover {
                    background: var(--accent-light);
                    color: var(--accent);
                }
                .tasks-list {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .planner-task {
                    background: var(--bg-primary);
                    padding: 0.75rem;
                    border-radius: 8px;
                    border-left: 3px solid var(--accent);
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 8px;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                    border-left-width: 3px;
                    cursor: grab;
                }
                .planner-task:active {
                    cursor: grabbing;
                }
                .planner-task:hover {
                    border-color: var(--border);
                    background: var(--bg-secondary);
                }
                .planner-task.completed {
                    opacity: 0.6;
                    border-left-color: var(--priority-low);
                }
                .planner-task.completed .task-title {
                    text-decoration: line-through;
                }
                
                .task-left {
                    flex: 1;
                    min-width: 0;
                }
                .task-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    white-space: normal; /* Allow wrapping */
                    word-break: break-word; /* Break long words */
                    margin-bottom: 2px;
                }
                .task-subtitle {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    display: flex;
                    flex-wrap: wrap; /* Allow wrapping */
                    align-items: center;
                }
                .subject-tag {
                    flex-shrink: 0;
                    font-weight: 600;
                    margin-right: 4px;
                }
                .material-name {
                    white-space: normal; /* Allow wrapping */
                    word-break: break-word; /* Break long words */
                }

                .task-right {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 4px;
                    flex-shrink: 0;
                }
                .task-meta {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }
                .task-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transform: translateX(5px);
                    transition: all 0.2s ease;
                }
                .planner-task:hover .task-actions {
                    opacity: 1;
                    transform: translateX(0);
                }

                .task-btn {
                    padding: 4px;
                    border-radius: 4px;
                    border: 1px solid transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                    background: var(--bg-tertiary);
                    color: var(--text-secondary);
                }
                .task-btn:hover {
                    transform: scale(1.1);
                    border-color: var(--accent);
                    color: var(--accent);
                    background: var(--bg-secondary);
                }
                .check-btn:hover {
                    color: var(--priority-low);
                    border-color: var(--priority-low);
                }
                .delete-btn:hover {
                    color: var(--priority-high);
                    border-color: var(--priority-high);
                }

                .inline-add-task {
                    background: transparent;
                    border: 1px dashed var(--border);
                    border-radius: 8px;
                    padding: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: 4px;
                }
                .inline-add-task:hover {
                    border-color: var(--accent);
                    color: var(--accent);
                    background: var(--accent-light);
                    border-style: solid;
                }

                .skeleton-task {
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    padding: 0.75rem;
                    position: relative;
                    cursor: pointer;
                    border: 1px dashed var(--border);
                    transition: all 0.2s;
                    overflow: hidden;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .skeleton-task:hover {
                    border-color: var(--accent);
                    background: var(--bg-primary);
                    border-style: solid;
                }
            `}</style>
        </div>
    );
}

function DayColumn({ date, tasks, onAddTask, onEditTask, onToggleTask, onDeleteTask, isExamDay, onMoveTask }: { 
    date: Date, 
    tasks: PlannerTask[], 
    onAddTask: () => void,
    onEditTask: (task: PlannerTask) => void,
    onToggleTask: (id: string) => void,
    onDeleteTask: (id: string) => void,
    onMoveTask: (taskId: string, newDate: string) => void,
    isExamDay: boolean
}) {
    const [isDragOver, setIsDragOver] = useState(false);
    const isToday = new Date().toDateString() === date.toDateString();

    const isOverdue = (task: PlannerTask) => {
        if (task.completed) return false;
        const now = new Date();
        const taskDateTime = new Date(`${task.date}T${task.time}`);
        return now > taskDateTime;
    };

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('text/plain', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
            onMoveTask(taskId, formatDateLocal(date));
        }
    };

    return (
        <div 
            className={`day-column ${isToday ? 'today' : ''} ${isExamDay ? 'exam-day-col' : ''} ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="day-header">
                <div className="day-header-left">
                    <span className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="day-number">{date.getDate()}</span>
                </div>
                <button className="header-add-btn" onClick={onAddTask} title="Add task">
                    <Plus size={18} />
                </button>
            </div>
            
            <div className="tasks-list">
                {isExamDay && (
                    <div className="exam-event-card">
                        <div className="exam-icon-wrapper">
                            <CalendarIcon size={20} />
                        </div>
                        <div className="exam-content">
                            <span className="exam-title">JEE Main Exam</span>
                            <span className="exam-subtitle">Good Luck! 🎯</span>
                        </div>
                    </div>
                )}
                {tasks.length > 0 ? (
                    <>
                        {tasks.map(task => (
                            <div 
                                key={task.id} 
                                className={`planner-task ${task.completed ? 'completed' : ''}`}
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, task.id)}
                            >
                                <div className="task-left">
                                    <div className="task-title">
                                        {task.title}
                                        {isOverdue(task) && <span className="pending-tag" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>Pending</span>}
                                    </div>
                                    <div className="task-subtitle">
                                        {task.subject && (
                                            <span className="subject-tag" style={{ color: `var(--${task.subject})`}}>
                                                {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)} {task.subtitle ? '•' : ''}
                                            </span>
                                        )}
                                        {task.subtitle && <span className="material-name">{task.subtitle}</span>}
                                    </div>
                                </div>
                                
                                <div className="task-right">
                                    <div className="task-meta">
                                        <Clock size={12} />
                                        <span>{formatTime12Hour(task.time)}</span>
                                    </div>
                                    <div className="task-actions">
                                        <button 
                                            className="task-btn check-btn" 
                                            onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                                            title={task.completed ? "Mark incomplete" : "Mark complete"}
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button 
                                            className="task-btn edit-btn"
                                            onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                                            title="Edit task"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button 
                                            className="task-btn delete-btn"
                                            onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                            title="Delete task"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="inline-add-task" onClick={onAddTask}>
                            <Plus size={14} />
                            <span>Add Task</span>
                        </div>
                    </>
                ) : (
                    <div className="skeleton-task" onClick={onAddTask}>
                        <div className="skeleton-overlay">
                            <Plus size={20} />
                            <span>Plan this day</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}