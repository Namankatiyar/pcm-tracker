import { Priority } from '../types';

interface PrioritySelectorProps {
    priority: Priority;
    onChange: (priority: Priority) => void;
}

export function PrioritySelector({ priority, onChange }: PrioritySelectorProps) {
    const options: { value: Priority; label: string; color: string }[] = [
        { value: 'none', label: '—', color: 'var(--text-muted)' },
        { value: 'high', label: 'High', color: 'var(--priority-high)' },
        { value: 'medium', label: 'Med', color: 'var(--priority-medium)' },
        { value: 'low', label: 'Low', color: 'var(--priority-low)' },
    ];

    return (
        <div className="priority-selector">
            {options.map(({ value, label, color }) => (
                <button
                    key={value}
                    className={`priority-btn ${priority === value ? 'active' : ''}`}
                    style={{
                        '--priority-color': color,
                        borderColor: priority === value ? color : 'transparent',
                        backgroundColor: priority === value ? `${color}20` : 'transparent'
                    } as React.CSSProperties}
                    onClick={() => onChange(value)}
                    title={value === 'none' ? 'No priority' : `${label} priority`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
