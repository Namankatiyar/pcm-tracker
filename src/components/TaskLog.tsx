import { PlannerTask } from '../types';
import { History, CheckCircle2 } from 'lucide-react';

interface TaskLogProps {
    tasks: PlannerTask[];
}

export function TaskLog({ tasks }: TaskLogProps) {
    const completedTasks = tasks
        .filter(t => t.completed)
        .sort((a, b) => {
            if (a.completedAt && b.completedAt) {
                return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
            }
            // Fallback to scheduled date if completedAt missing (legacy data)
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

    const formatCompletedDate = (isoDate?: string) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="task-log-card">
            <div className="agenda-header" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <History size={20} style={{ color: 'var(--accent)' }} />
                    <h2>Task Progress Log</h2>
                </div>
                <p>History of completed tasks</p>
            </div>

            <div className="task-log-list">
                {completedTasks.length > 0 ? (
                    completedTasks.map(task => (
                        <div key={task.id} className="agenda-item" style={{ background: 'var(--bg-tertiary)' }}>
                            <div className="agenda-check checked" style={{ cursor: 'default' }}>
                                <CheckCircle2 size={14} />
                            </div>
                            <div className="agenda-info">
                                <span className="agenda-title" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
                                <div className="agenda-subtitle">
                                    {task.subject && (
                                        <span style={{
                                            color: `var(--${task.subject})`,
                                            fontWeight: 600,
                                            marginRight: '4px'
                                        }}>
                                            {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)} {task.subtitle ? '•' : ''}
                                        </span>
                                    )}
                                    {task.subtitle && <span className="agenda-subtitle-text">{task.subtitle}</span>}
                                </div>
                            </div>
                            <div className="agenda-time" style={{ fontSize: '0.7rem' }}>
                                {task.completedAt ? formatCompletedDate(task.completedAt) : task.date}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-agenda">
                        <p>No tasks completed yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
