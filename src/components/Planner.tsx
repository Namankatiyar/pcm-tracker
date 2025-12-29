import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Calendar as CalendarIcon, Clock, Pencil } from 'lucide-react';
import { PlannerTask, Subject, SubjectData } from '../types';
import { TaskModal } from './TaskModal';

interface PlannerProps {
    tasks: PlannerTask[];
    onAddTask: (task: PlannerTask) => void;
    onEditTask: (task: PlannerTask) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
    subjectData: Record<Subject, SubjectData | null>;
}

type ViewMode = 'weekly' | 'monthly';

export function Planner({ tasks, onAddTask, onEditTask, onToggleTask, onDeleteTask, subjectData }: PlannerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('weekly');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedDateForTask, setSelectedDateForTask] = useState('');
    const [taskToEdit, setTaskToEdit] = useState<PlannerTask | null>(null);

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

    const formatDateISO = (date: Date) => {
        return date.toISOString().split('T')[0];
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
                    <div className="week-row top-row">
                        {weekDays.slice(0, 4).map(day => (
                            <DayColumn 
                                key={day.toISOString()} 
                                date={day} 
                                tasks={getTasksForDate(formatDateISO(day))}
                                onAddTask={() => handleAddTaskClick(formatDateISO(day))}
                                onEditTask={handleEditClick}
                                onToggleTask={onToggleTask}
                                onDeleteTask={onDeleteTask}
                            />
                        ))}
                    </div>
                    <div className="week-row bottom-row">
                        {weekDays.slice(4, 7).map(day => (
                            <DayColumn 
                                key={day.toISOString()} 
                                date={day} 
                                tasks={getTasksForDate(formatDateISO(day))}
                                onAddTask={() => handleAddTaskClick(formatDateISO(day))}
                                onEditTask={handleEditClick}
                                onToggleTask={onToggleTask}
                                onDeleteTask={onDeleteTask}
                            />
                        ))}
                    </div>
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
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .planner-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .view-toggles {
                    background: var(--bg-secondary);
                    padding: 4px;
                    border-radius: 8px;
                    display: flex;
                    gap: 4px;
                }
                .view-btn {
                    padding: 8px 16px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .view-btn.active {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--text-primary);
                }
                .weekly-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .week-row {
                    display: grid;
                    gap: 1.5rem;
                }
                .top-row {
                    grid-template-columns: repeat(4, 1fr);
                }
                .bottom-row {
                    grid-template-columns: repeat(3, 1fr);
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
                    border-bottom: 1px solid var(--border-color);
                }
                .day-name {
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .day-number {
                    background: var(--bg-primary);
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .day-column.today .day-number {
                    background: var(--accent);
                    color: white;
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
                    flex-direction: column;
                    gap: 4px;
                    position: relative;
                    transition: all 0.2s;
                }
                .planner-task.completed {
                    opacity: 0.6;
                    border-left-color: var(--success);
                }
                .planner-task.completed .task-title {
                    text-decoration: line-through;
                }
                .task-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .task-title {
                    font-weight: 500;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                }
                .task-subtitle {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }
                .task-meta {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin-top: 4px;
                }
                .task-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0; 
                    transition: opacity 0.2s;
                }
                .planner-task:hover .task-actions {
                    opacity: 1;
                }
                .task-btn {
                    padding: 4px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .check-btn {
                    background: var(--success-light);
                    color: var(--success);
                }
                .edit-btn {
                    background: var(--bg-tertiary);
                    color: var(--text-secondary);
                }
                .delete-btn {
                    background: var(--danger-light);
                    color: var(--danger);
                }
                .add-task-btn {
                    margin-top: 1rem;
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px dashed var(--border-color);
                    border-radius: 8px;
                    background: transparent;
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .add-task-btn:hover {
                    border-color: var(--accent);
                    color: var(--accent);
                    background: var(--accent-light);
                }
                .monthly-placeholder {
                    text-align: center;
                    padding: 4rem;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    color: var(--text-secondary);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                @media (max-width: 1024px) {
                    .top-row, .bottom-row {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 600px) {
                    .top-row, .bottom-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

function DayColumn({ date, tasks, onAddTask, onEditTask, onToggleTask, onDeleteTask }: { 
    date: Date, 
    tasks: PlannerTask[], 
    onAddTask: () => void,
    onEditTask: (task: PlannerTask) => void,
    onToggleTask: (id: string) => void,
    onDeleteTask: (id: string) => void
}) {
    const isToday = new Date().toDateString() === date.toDateString();

    return (
        <div className={`day-column ${isToday ? 'today' : ''}`}>
            <div className="day-header">
                <span className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="day-number">{date.getDate()}</span>
            </div>
            
            <div className="tasks-list">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <div key={task.id} className={`planner-task ${task.completed ? 'completed' : ''}`}>
                            <div className="task-header">
                                <div>
                                    <div className="task-title">{task.title}</div>
                                    {task.subtitle && <div className="task-subtitle">{task.subtitle}</div>}
                                </div>
                                <div className="task-actions">
                                    <button 
                                        className="task-btn check-btn" 
                                        onClick={() => onToggleTask(task.id)}
                                        title={task.completed ? "Mark incomplete" : "Mark complete"}
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button 
                                        className="task-btn edit-btn"
                                        onClick={() => onEditTask(task)}
                                        title="Edit task"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button 
                                        className="task-btn delete-btn"
                                        onClick={() => onDeleteTask(task.id)}
                                        title="Delete task"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="task-meta">
                                <Clock size={12} />
                                <span>{task.time}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="skeleton-task" onClick={onAddTask}>
                        <div className="skeleton-line title"></div>
                        <div className="skeleton-line subtitle"></div>
                        <div className="skeleton-line time"></div>
                        <div className="skeleton-overlay">
                            <Plus size={20} />
                            <span>Plan this day</span>
                        </div>
                    </div>
                )}
            </div>

            <button className="add-task-btn" onClick={onAddTask}>
                <Plus size={16} />
                <span>Add Task</span>
            </button>
        </div>
    );
}