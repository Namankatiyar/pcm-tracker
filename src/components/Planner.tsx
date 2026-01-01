import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Calendar as CalendarIcon, Clock, Pencil, ClockAlert, Hourglass } from 'lucide-react';
import { PlannerTask, Subject, SubjectData, StudySession } from '../types';
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
    sessions?: StudySession[];
}

type ViewMode = 'weekly' | 'monthly';

export function Planner({ tasks, onAddTask, onEditTask, onToggleTask, onDeleteTask, subjectData, examDate, initialOpenDate, onConsumeInitialDate, sessions = [] }: PlannerProps) {
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

    const handlePrevMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    // Get all days for the current month grid (includes padding days from prev/next months)
    const getMonthDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
        let startPadding = firstDay.getDay() - 1;
        if (startPadding < 0) startPadding = 6; // Sunday becomes 6

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // Add padding days from previous month
        for (let i = startPadding - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            days.push({ date: d, isCurrentMonth: false });
        }

        // Add days of current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        // Add padding days from next month to complete the grid
        // Only add enough to complete the current row (not a full 6 rows)
        const totalDays = days.length;
        const rowsNeeded = Math.ceil(totalDays / 7);
        const cellsNeeded = rowsNeeded * 7;
        const remaining = cellsNeeded - totalDays;

        for (let i = 1; i <= remaining; i++) {
            const d = new Date(year, month + 1, i);
            days.push({ date: d, isCurrentMonth: false });
        }

        return days;
    };

    const monthDays = getMonthDays();

    const getTasksForDate = (dateStr: string) => {
        return tasks.filter(t => t.date === dateStr).sort((a, b) => {
            // Priority: 1. New tasks (not completed, not shifted), 2. Shifted/delayed, 3. Completed
            const aIsCompleted = a.completed;
            const bIsCompleted = b.completed;
            const aIsShifted = a.wasShifted && !a.completed;
            const bIsShifted = b.wasShifted && !b.completed;
            const aIsNew = !a.completed && !a.wasShifted;
            const bIsNew = !b.completed && !b.wasShifted;

            // New tasks come first
            if (aIsNew && !bIsNew) return -1;
            if (!aIsNew && bIsNew) return 1;

            // Then shifted/delayed tasks
            if (aIsShifted && !bIsShifted && !bIsNew) return -1;
            if (!aIsShifted && !aIsNew && bIsShifted) return 1;

            // Completed tasks come last
            if (aIsCompleted && !bIsCompleted) return 1;
            if (!aIsCompleted && bIsCompleted) return -1;

            // Within same category, sort by time
            return a.time.localeCompare(b.time);
        });
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
                    <button onClick={viewMode === 'monthly' ? handlePrevMonth : handlePrevWeek}>
                        <ChevronLeft size={20} />
                    </button>
                    <span className="current-date-range">
                        {viewMode === 'monthly'
                            ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                            : `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        }
                    </span>
                    <button onClick={viewMode === 'monthly' ? handleNextMonth : handleNextWeek}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {viewMode === 'monthly' ? (
                <div className="monthly-calendar">
                    <div className="month-header-row">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={day} className={`month-day-header ${i === 5 || i === 6 ? 'weekend' : ''}`}>{day}</div>
                        ))}
                    </div>
                    <div className="month-grid">
                        {monthDays.map(({ date, isCurrentMonth }, index) => {
                            const dateStr = formatDateLocal(date);
                            const dayTasks = getTasksForDate(dateStr);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const cellDate = new Date(date);
                            cellDate.setHours(0, 0, 0, 0);
                            const isToday = today.getTime() === cellDate.getTime();
                            const isPast = cellDate < today;
                            const isExamDay = dateStr === examDate;
                            const pendingCount = dayTasks.filter(t => !t.completed).length;
                            const completedCount = dayTasks.filter(t => t.completed).length;
                            const totalTasks = dayTasks.length;
                            // Random cross image for past days (1-5) with random contrast
                            const crossImageNum = isPast ? ((date.getDate() + date.getMonth()) % 5) + 1 : 0;
                            // Random contrast between 0.75 and 1.25 (25% range)
                            const randomContrast = isPast ? 0.75 + ((date.getDate() * 7 + date.getMonth() * 13) % 50) / 100 : 1;

                            // Get study hours for this day
                            const dayStudyHours = sessions
                                .filter(s => s.startTime.startsWith(dateStr))
                                .reduce((acc, s) => acc + s.duration, 0);
                            const studyHoursDisplay = dayStudyHours > 0
                                ? dayStudyHours >= 3600
                                    ? `${Math.floor(dayStudyHours / 3600)}h ${Math.floor((dayStudyHours % 3600) / 60)}m`
                                    : `${Math.floor(dayStudyHours / 60)}m`
                                : '';

                            return (
                                <div
                                    key={index}
                                    className={`month-day-cell ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''} ${isExamDay ? 'exam-day' : ''} ${isPast ? 'past-day' : ''}`}
                                    onClick={() => !isPast && handleAddTaskClick(dateStr)}
                                    title={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${totalTasks > 0 ? ` • ${totalTasks} task(s)` : ''}${dayStudyHours > 0 ? ` • Studied: ${studyHoursDisplay}` : ''}${isPast ? ' (Past)' : ''}`}
                                    style={{ cursor: isPast ? 'default' : 'pointer' }}
                                >
                                    {isPast && (
                                        <div
                                            className="cross-overlay"
                                            style={{
                                                backgroundImage: `url('/cross-images/cross${crossImageNum}.png')`,
                                                filter: `contrast(${randomContrast})`
                                            }}
                                        />
                                    )}
                                    <div className="cell-top">
                                        <span className="month-day-number">{date.getDate()}</span>
                                    </div>
                                    <div className="cell-center">
                                        {studyHoursDisplay && <span className="study-hours">{studyHoursDisplay}</span>}
                                    </div>
                                    <div className="cell-content">
                                        {totalTasks > 0 && (
                                            <div className="month-task-dots">
                                                {/* Show individual dots for each completed task */}
                                                {Array.from({ length: Math.min(completedCount, 10) }).map((_, i) => (
                                                    <span key={`c-${i}`} className="task-dot completed"></span>
                                                ))}
                                                {/* Show individual dots for each pending task */}
                                                {Array.from({ length: Math.min(pendingCount, 10) }).map((_, i) => (
                                                    <span key={`p-${i}`} className="task-dot pending"></span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {isExamDay && <div className="exam-badge">📝</div>}
                                </div>
                            );
                        })}
                    </div>
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
                            isPastDay={day.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)}
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
                    padding: 0 2rem 2rem 2rem;
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
                    max-height: 280px;
                    overflow-y: auto;
                    padding-right: 4px;
                }
                .tasks-list::-webkit-scrollbar {
                    width: 4px;
                }
                .tasks-list::-webkit-scrollbar-track {
                    background: transparent;
                }
                .tasks-list::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 4px;
                }
                .tasks-list::-webkit-scrollbar-thumb:hover {
                    background: var(--text-muted);
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
                .day-column.past-day {
                    opacity: 0.55;
                    background: var(--bg-tertiary);
                }
                .day-column.past-day .day-number {
                    background: var(--text-muted);
                    color: var(--bg-primary);
                }
                .day-column.past-day .header-add-btn {
                    pointer-events: none;
                    opacity: 0.3;
                }
                .day-column.past-day .inline-add-task {
                    pointer-events: none;
                    opacity: 0.3;
                }

                /* ===== Monthly Calendar Styles ===== */
                .monthly-calendar {
                    max-width: 1400px;
                    margin: 0 auto;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 1rem;
                    box-shadow: var(--shadow-lg), var(--shadow-glow);
                    border: 1px solid var(--border);
                }

                .month-header-row {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 6px;
                    margin-bottom: 8px;
                    padding: 6px;
                    background: var(--bg-tertiary);
                    border-radius: 10px;
                    border: 1px solid var(--border);
                }

                .month-day-header {
                    text-align: center;
                    font-weight: 700;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    padding: 0.35rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: var(--accent-light);
                    border-radius: 6px;
                    border: 1px solid var(--accent);
                }

                .month-day-header.weekend {
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1));
                    border-color: rgba(245, 158, 11, 0.3);
                    color: #f59e0b;
                }

                .month-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 6px;
                }

                .month-day-cell {
                    aspect-ratio: 1;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid var(--border);
                    position: relative;
                    overflow: hidden;
                    padding: 4px;
                }

                /* Past days - dark background with dimmed opacity (same as other-month.past-day) */
                .month-day-cell.past-day {
                    opacity: 0.6;
                    background: var(--bg-primary);
                    border-color: var(--border);
                }

                .month-day-cell::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: transparent;
                    transition: background 0.2s;
                }

                .month-day-cell:not(.past-day):hover {
                    background: var(--bg-primary);
                    border-color: var(--accent);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .month-day-cell:not(.past-day):hover::before {
                    background: var(--accent);
                }

                /* Future padding days from other months - same as regular cells */
                .month-day-cell.other-month:not(.past-day) {
                    opacity: 1;
                    background: var(--bg-secondary);
                }

                /* Past padding days from other months - same as regular past days */
                .month-day-cell.other-month.past-day {
                    opacity: 0.6;
                    background: var(--bg-primary);
                }

                .month-day-cell.other-month:not(.past-day):hover {
                    opacity: 1;
                }

                /* Today styling - applies to both regular and other-month */
                .month-day-cell.today,
                .month-day-cell.other-month.today {
                    background: linear-gradient(135deg, var(--accent-light), transparent);
                    border-color: var(--accent);
                    box-shadow: 0 0 0 2px var(--accent-light);
                    opacity: 1;
                }

                .month-day-cell.today::before,
                .month-day-cell.other-month.today::before {
                    background: var(--accent);
                }

                .month-day-cell.exam-day {
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08));
                    border-color: #f59e0b;
                }

                .month-day-cell.exam-day::before {
                    background: linear-gradient(90deg, #f59e0b, #d97706);
                }

                .month-day-cell.exam-day .month-day-number {
                    color: #f59e0b;
                }

                /* Past Day Styling with Cross Overlay */
                .month-day-cell.past-day {
                    cursor: default;
                }

                .month-day-cell.past-day:hover {
                    transform: none;
                    box-shadow: none;
                }

                .cross-overlay {
                    position: absolute;
                    top: 15%;
                    left: 15%;
                    right: 15%;
                    bottom: 15%;
                    background-size: contain;
                    background-position: center;
                    background-repeat: no-repeat;
                    opacity: 1;
                    z-index: 1;
                    pointer-events: none;
                }

                .month-day-cell.past-day .month-day-number,
                .month-day-cell.past-day .cell-center {
                    z-index: 2;
                    position: relative;
                }

                .month-day-cell.past-day .cell-content {
                    z-index: 2;
                }

                .month-day-cell.past-day .month-day-number {
                    opacity: 0.6;
                }

                .cell-top {
                    display: flex;
                    justify-content: flex-end;
                    width: 100%;
                    z-index: 2;
                    position: relative;
                }

                .month-day-number {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    transition: all 0.2s;
                    width: 26px;
                    height: 26px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .month-day-cell.today .month-day-number,
                .month-day-cell.other-month.today .month-day-number {
                    background: var(--accent);
                    color: var(--accent-text);
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                }

                .cell-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .study-hours {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: var(--accent);
                    text-shadow: 0 1px 3px rgba(0,0,0,0.15);
                    letter-spacing: -0.5px;
                }

                .cell-content {
                    position: absolute;
                    bottom: 4px;
                    left: 4px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: flex-start;
                    z-index: 2;
                }

                .month-task-dots {
                    display: flex;
                    flex-wrap: wrap-reverse;
                    gap: 2px;
                    max-width: 100%;
                }

                .task-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                }

                .task-dot.pending {
                    background: var(--accent);
                    animation: pulse-dot 2s ease-in-out infinite;
                }

                .task-dot.completed {
                    background: #22c55e;
                }

                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(0.9); }
                }

                .exam-badge {
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    font-size: 0.75rem;
                    z-index: 3;
                }
            `}</style>
        </div>
    );
}

function DayColumn({ date, tasks, onAddTask, onEditTask, onToggleTask, onDeleteTask, isExamDay, onMoveTask, isPastDay }: {
    date: Date,
    tasks: PlannerTask[],
    onAddTask: () => void,
    onEditTask: (task: PlannerTask) => void,
    onToggleTask: (id: string) => void,
    onDeleteTask: (id: string) => void,
    onMoveTask: (taskId: string, newDate: string) => void,
    isExamDay: boolean,
    isPastDay: boolean
}) {
    const [isDragOver, setIsDragOver] = useState(false);
    const isToday = new Date().toDateString() === date.toDateString();

    const isOverdue = (task: PlannerTask) => {
        if (task.completed) return false;
        const now = new Date();
        const taskDateTime = new Date(`${task.date}T${task.time}`);
        return now > taskDateTime;
    };

    const getTaskTimeDisplay = (task: PlannerTask) => {
        if (task.completed && task.completedAt) {
            const completedDate = new Date(task.completedAt);
            return `Done ${formatTime12Hour(completedDate.getHours().toString().padStart(2, '0') + ':' + completedDate.getMinutes().toString().padStart(2, '0'))}`;
        }
        if (task.wasShifted && !task.completed) {
            return 'Delayed';
        }
        return formatTime12Hour(task.time);
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
            className={`day-column ${isToday ? 'today' : ''} ${isExamDay ? 'exam-day-col' : ''} ${isDragOver ? 'drag-over' : ''} ${isPastDay ? 'past-day' : ''}`}
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
                                        {task.title && <span style={{ marginRight: '6px' }}>{task.title}</span>}
                                        {isOverdue(task) && !task.wasShifted && <span className="pending-tag" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center', verticalAlign: 'middle' }}>
                                            <ClockAlert size={13} />
                                            Pending</span>}
                                        {task.wasShifted && !task.completed && <span className="delayed-tag" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center', verticalAlign: 'middle' }}>
                                            <Hourglass size={13} />
                                            Delayed</span>}
                                    </div>
                                    <div className="task-subtitle">
                                        {task.subject && (
                                            <span className="subject-tag" style={{ color: `var(--${task.subject})` }}>
                                                {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)} {task.subtitle ? '•' : ''}
                                            </span>
                                        )}
                                        {task.subtitle && <span className="material-name">{task.subtitle}</span>}
                                    </div>
                                </div>

                                <div className="task-right">
                                    <div className={`task-meta ${task.wasShifted && !task.completed ? 'delayed' : ''} ${task.completed ? 'completed-time' : ''}`}>
                                        <Clock size={13} />
                                        <span>{getTaskTimeDisplay(task)}</span>
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