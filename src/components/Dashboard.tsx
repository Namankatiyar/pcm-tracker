import { ProgressRing } from './ProgressBar';
import { Subject, SubjectData } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface DashboardProps {
    physicsProgress: number;
    chemistryProgress: number;
    mathsProgress: number;
    overallProgress: number;
    subjectData: Record<Subject, SubjectData | null>;
    onNavigate: (subject: Subject) => void;
}

export function Dashboard({
    physicsProgress,
    chemistryProgress,
    mathsProgress,
    overallProgress,
    subjectData,
    onNavigate
}: DashboardProps) {
    const [examDate, setExamDate] = useLocalStorage<string>('jee-exam-date', '');

    const subjects: { key: Subject; label: string; icon: string; progress: number; color: string }[] = [
        { key: 'physics', label: 'Physics', icon: '⚛️', progress: physicsProgress, color: '#6366f1' },
        { key: 'chemistry', label: 'Chemistry', icon: '🧪', progress: chemistryProgress, color: '#10b981' },
        { key: 'maths', label: 'Maths', icon: '📐', progress: mathsProgress, color: '#f59e0b' },
    ];

    const getChapterStats = (subject: Subject) => {
        const data = subjectData[subject];
        if (!data) return { total: 0, completed: 0 };
        return { total: data.chapters.length, completed: 0 };
    };

    const calculateDaysRemaining = () => {
        if (!examDate) return null;
        const target = new Date(examDate);
        const today = new Date();
        // Reset hours to compare just the dates
        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = calculateDaysRemaining();

    const getCountdownColor = (days: number) => {
        // Map days to hue: 60 days -> 120 (Green), 30 days -> 60 (Yellow), 0 days -> 0 (Red)
        const hue = Math.min(Math.max(days * 2, 0), 120);
        return `hsl(${hue}, 80%, 45%)`;
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Your Progress</h1>
                <p className="dashboard-subtitle">Track your JEE preparation journey</p>
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
                            <label htmlFor="exam-date">Target Date:</label>
                            <input 
                                type="date" 
                                id="exam-date" 
                                value={examDate} 
                                onChange={(e) => setExamDate(e.target.value)} 
                            />
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

            <div className="motivation-card">
                <div className="motivation-icon">💪</div>
                <div className="motivation-text">
                    <h3>Keep Going!</h3>
                    <p>Consistency is the key to cracking JEE. Complete at least one chapter today!</p>
                </div>
            </div>
        </div>
    );
}
