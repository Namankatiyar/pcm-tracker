import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Trash2, Clock, ChevronDown, X } from 'lucide-react';
import { Subject, SubjectData, StudySession, PlannerTask } from '../types';

interface StudyClockProps {
    subjectData: Record<Subject, SubjectData | null>;
    sessions: StudySession[];
    onAddSession: (session: StudySession) => void;
    onDeleteSession: (sessionId: string) => void;
    plannerTasks: PlannerTask[];
}

type TimerState = 'idle' | 'running' | 'paused';

export function StudyClock({ subjectData, sessions, onAddSession, onDeleteSession, plannerTasks }: StudyClockProps) {
    // Timer state
    const [timerState, setTimerState] = useState<TimerState>('idle');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [pausedTime, setPausedTime] = useState(0); // Accumulated time before pause
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Task selection state
    const [taskType, setTaskType] = useState<'chapter' | 'custom' | 'task'>('chapter');
    const [selectedSubject, setSelectedSubject] = useState<Subject | ''>('');
    const [selectedChapter, setSelectedChapter] = useState<number | ''>('');
    const [selectedMaterial, setSelectedMaterial] = useState<string>('');
    const [customTitle, setCustomTitle] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');

    // Stats filter state
    const [statsSubject, setStatsSubject] = useState<Subject | 'all'>('all');
    const [statsChapter, setStatsChapter] = useState<number | 'all'>('all');
    const [statsMaterial, setStatsMaterial] = useState<string | 'all'>('all');
    const [showDistribution, setShowDistribution] = useState(false);

    const timerRef = useRef<number | null>(null);

    // Sync timer with user's system clock
    useEffect(() => {
        if (timerState === 'running' && startTime) {
            const updateTimer = () => {
                const now = new Date();
                const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000) + pausedTime;
                setElapsedSeconds(elapsed);
            };

            // Update immediately
            updateTimer();

            // Update every second, synced to the clock
            timerRef.current = window.setInterval(updateTimer, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [timerState, startTime, pausedTime]);

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDuration = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) {
            return `${hrs}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const getTaskTitle = (): string => {
        if (taskType === 'custom') {
            return customTitle || 'Untitled Session';
        }
        const parts: string[] = [];
        if (selectedSubject) {
            parts.push(selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1));
        }
        if (selectedChapter && selectedSubject) {
            const chapter = subjectData[selectedSubject]?.chapters.find(c => c.serial === selectedChapter);
            if (chapter) parts.push(chapter.name);
        }
        if (selectedMaterial) {
            parts.push(selectedMaterial);
        }
        return parts.length > 0 ? parts.join(' > ') : 'Untitled Session';
    };

    const getChapterName = (): string | undefined => {
        if (selectedSubject && selectedChapter) {
            const chapter = subjectData[selectedSubject]?.chapters.find(c => c.serial === selectedChapter);
            return chapter?.name;
        }
        return undefined;
    };

    const handleStart = () => {
        setStartTime(new Date());
        setTimerState('running');
    };

    const handlePause = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setPausedTime(elapsedSeconds);
        setTimerState('paused');
    };

    const handleResume = () => {
        setStartTime(new Date());
        setTimerState('running');
    };

    const handleEnd = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (elapsedSeconds > 0) {
            const session: StudySession = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                title: getTaskTitle(),
                subject: taskType === 'chapter' && selectedSubject ? selectedSubject : undefined,
                chapterSerial: taskType === 'chapter' && selectedChapter ? selectedChapter as number : undefined,
                chapterName: taskType === 'chapter' ? getChapterName() : undefined,
                material: taskType === 'chapter' && selectedMaterial ? selectedMaterial : undefined,
                type: taskType,
                startTime: startTime?.toISOString() || new Date().toISOString(),
                endTime: new Date().toISOString(),
                duration: elapsedSeconds
            };
            onAddSession(session);
        }

        // Reset timer
        setTimerState('idle');
        setElapsedSeconds(0);
        setPausedTime(0);
        setStartTime(null);
        setIsFullscreen(false);
    };

    const handleFullscreenClick = () => {
        if (isFullscreen) {
            handlePause();
            setIsFullscreen(false);
        }
    };

    const handleTimerClick = () => {
        if (timerState === 'running') {
            setIsFullscreen(true);
        }
    };

    const handleSpacebarToggle = () => {
        if (timerState === 'idle') {
            handleStart();
        } else if (timerState === 'running') {
            handlePause();
        } else if (timerState === 'paused') {
            handleResume();
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                handleSpacebarToggle();
            } else if (e.code === 'KeyF' && timerState === 'running') {
                e.preventDefault();
                setIsFullscreen(true);
            } else if (e.code === 'Escape' && isFullscreen) {
                e.preventDefault();
                handlePause();
                setIsFullscreen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [timerState, isFullscreen]);

    // Get available chapters for selected subject
    const availableChapters = selectedSubject ? subjectData[selectedSubject]?.chapters || [] : [];

    // Get available materials for selected subject
    const availableMaterials = selectedSubject ? subjectData[selectedSubject]?.materialNames || [] : [];

    // Stats calculations
    const getFilteredSessions = useCallback(() => {
        return sessions.filter(s => {
            if (statsSubject !== 'all' && s.subject !== statsSubject) return false;
            if (statsChapter !== 'all' && s.chapterSerial !== statsChapter) return false;
            if (statsMaterial !== 'all' && s.material !== statsMaterial) return false;
            return true;
        });
    }, [sessions, statsSubject, statsChapter, statsMaterial]);

    const totalFilteredTime = getFilteredSessions().reduce((acc, s) => acc + s.duration, 0);
    const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0);

    // Calculate subject distribution
    const getSubjectDistribution = useCallback(() => {
        const distribution = {
            physics: 0,
            chemistry: 0,
            maths: 0,
            custom: 0
        };
        sessions.forEach(s => {
            if (s.type === 'custom' || !s.subject) {
                distribution.custom += s.duration;
            } else {
                distribution[s.subject] += s.duration;
            }
        });
        return distribution;
    }, [sessions]);

    const subjectDistribution = getSubjectDistribution();

    // Get unique chapters that have sessions for the stats filter
    const statsAvailableChapters = statsSubject !== 'all'
        ? subjectData[statsSubject]?.chapters.filter(ch =>
            sessions.some(s => s.subject === statsSubject && s.chapterSerial === ch.serial)
        ) || []
        : [];

    const statsAvailableMaterials = statsSubject !== 'all'
        ? [...new Set(sessions.filter(s => s.subject === statsSubject && (statsChapter === 'all' || s.chapterSerial === statsChapter)).map(s => s.material).filter(Boolean))]
        : [];

    if (isFullscreen) {
        return (
            <div className="fullscreen-timer">
                <div className="fullscreen-clock">
                    <div
                        className="fullscreen-time"
                        onClick={handleFullscreenClick}
                        title="Click to pause & exit fullscreen"
                    >
                        {formatTime(elapsedSeconds)}
                    </div>
                    <div className="fullscreen-title">{getTaskTitle()}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="study-clock-page">
            <div className="study-clock-header">
                <h1><Clock size={28} /> Study Clock</h1>
                <p>Track your study sessions and analyze your progress</p>
            </div>

            <div className="study-clock-grid">
                <div className="timer-card horizontal">
                    {/* Task selector - collapsible when timer is active */}
                    <div className={`task-selector-section ${timerState !== 'idle' ? 'collapsed' : ''}`}>
                        {timerState !== 'idle' ? (
                            <div className="collapsed-task-info">
                                <div className="collapsed-task-label">Studying:</div>
                                <div className="collapsed-task-title">{getTaskTitle()}</div>
                            </div>
                        ) : (
                            <>
                                <h3>What are you studying?</h3>

                                <div className="task-type-toggle">
                                    <button
                                        className={`type-btn ${taskType === 'chapter' ? 'active' : ''}`}
                                        onClick={() => setTaskType('chapter')}
                                        disabled={timerState !== 'idle'}
                                    >
                                        Syllabus
                                    </button>
                                    <button
                                        className={`type-btn ${taskType === 'task' ? 'active' : ''}`}
                                        onClick={() => setTaskType('task')}
                                        disabled={timerState !== 'idle'}
                                    >
                                        From Tasks
                                    </button>
                                    <button
                                        className={`type-btn ${taskType === 'custom' ? 'active' : ''}`}
                                        onClick={() => setTaskType('custom')}
                                        disabled={timerState !== 'idle'}
                                    >
                                        Custom
                                    </button>
                                </div>

                                {taskType === 'chapter' ? (
                                    <div className="chapter-selectors">
                                        <div className="selector-group">
                                            <label>Subject</label>
                                            <div className="custom-select">
                                                <select
                                                    value={selectedSubject}
                                                    onChange={(e) => {
                                                        setSelectedSubject(e.target.value as Subject | '');
                                                        setSelectedChapter('');
                                                        setSelectedMaterial('');
                                                    }}
                                                    disabled={timerState !== 'idle'}
                                                >
                                                    <option value="">Select Subject</option>
                                                    <option value="physics">Physics</option>
                                                    <option value="chemistry">Chemistry</option>
                                                    <option value="maths">Maths</option>
                                                </select>
                                                <ChevronDown size={16} className="select-icon" />
                                            </div>
                                        </div>

                                        <div className="selector-group">
                                            <label>Chapter</label>
                                            <div className="custom-select">
                                                <select
                                                    value={selectedChapter}
                                                    onChange={(e) => {
                                                        setSelectedChapter(e.target.value ? parseInt(e.target.value) : '');
                                                    }}
                                                    disabled={timerState !== 'idle' || !selectedSubject}
                                                >
                                                    <option value="">Select Chapter</option>
                                                    {availableChapters.map(ch => (
                                                        <option key={ch.serial} value={ch.serial}>{ch.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={16} className="select-icon" />
                                            </div>
                                        </div>

                                        <div className="selector-group">
                                            <label>Material</label>
                                            <div className="custom-select">
                                                <select
                                                    value={selectedMaterial}
                                                    onChange={(e) => setSelectedMaterial(e.target.value)}
                                                    disabled={timerState !== 'idle' || !selectedSubject}
                                                >
                                                    <option value="">Select Material</option>
                                                    {availableMaterials.map(mat => (
                                                        <option key={mat} value={mat}>{mat}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={16} className="select-icon" />
                                            </div>
                                        </div>
                                    </div>
                                ) : taskType === 'task' ? (
                                    <div className="task-selector">
                                        <div className="selector-group">
                                            <label>Select Task</label>
                                            <div className="custom-select">
                                                <select
                                                    value={selectedTaskId}
                                                    onChange={(e) => {
                                                        const taskId = e.target.value;
                                                        setSelectedTaskId(taskId);
                                                        const task = plannerTasks.find(t => t.id === taskId);
                                                        if (task) {
                                                            if (task.type === 'chapter' && task.subject) {
                                                                setSelectedSubject(task.subject);
                                                                setSelectedChapter(task.chapterSerial || '');
                                                                setSelectedMaterial(task.material || '');
                                                                setCustomTitle('');
                                                            } else {
                                                                setSelectedSubject('');
                                                                setSelectedChapter('');
                                                                setSelectedMaterial('');
                                                                setCustomTitle(task.title);
                                                            }
                                                        }
                                                    }}
                                                    disabled={timerState !== 'idle'}
                                                >
                                                    <option value="">Select a task...</option>
                                                    {plannerTasks.filter(t => !t.completed).map(task => (
                                                        <option key={task.id} value={task.id}>
                                                            {task.title}{task.subtitle ? ` - ${task.subtitle}` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={16} className="select-icon" />
                                            </div>
                                        </div>
                                        {selectedTaskId && (() => {
                                            const task = plannerTasks.find(t => t.id === selectedTaskId);
                                            if (task?.type === 'chapter' && task.subject) {
                                                return (
                                                    <div className="task-auto-filled">
                                                        <div className="auto-filled-item"><span>Subject:</span> {task.subject.charAt(0).toUpperCase() + task.subject.slice(1)}</div>
                                                        {task.chapterSerial && <div className="auto-filled-item"><span>Chapter:</span> {subjectData[task.subject]?.chapters.find(c => c.serial === task.chapterSerial)?.name || `#${task.chapterSerial}`}</div>}
                                                        {task.material && <div className="auto-filled-item"><span>Material:</span> {task.material}</div>}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                ) : (
                                    <div className="custom-title-input">
                                        <input
                                            type="text"
                                            placeholder="Enter session title..."
                                            value={customTitle}
                                            onChange={(e) => setCustomTitle(e.target.value)}
                                            disabled={timerState !== 'idle'}
                                        />
                                    </div>
                                )}

                                {(selectedSubject || customTitle) && (
                                    <div className="current-task-preview">
                                        <span>Session:</span> {getTaskTitle()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="timer-display-section">
                        <div
                            className={`timer-circle ${timerState}`}
                            onClick={handleTimerClick}
                            title={timerState === 'running' ? 'Click to enter fullscreen (or press F)' : ''}
                        >
                            <div className="timer-time">{formatTime(elapsedSeconds)}</div>
                            <div className="timer-state-label">
                                {timerState === 'idle' && 'Ready'}
                                {timerState === 'running' && 'Click for fullscreen'}
                                {timerState === 'paused' && 'Paused'}
                            </div>
                        </div>

                        <div className="timer-controls">
                            {timerState === 'idle' && (
                                <button className="timer-btn start" onClick={handleStart} title="Start (Space)">
                                    <Play size={24} />
                                </button>
                            )}
                            {timerState === 'running' && (
                                <>
                                    <button className="timer-btn pause" onClick={handlePause} title="Pause (Space)">
                                        <Pause size={24} />
                                    </button>
                                    <button className="timer-btn end" onClick={handleEnd} title="End Session">
                                        <Square size={24} />
                                    </button>
                                </>
                            )}
                            {timerState === 'paused' && (
                                <>
                                    <button className="timer-btn resume" onClick={handleResume} title="Resume (Space)">
                                        <Play size={24} />
                                    </button>
                                    <button className="timer-btn end" onClick={handleEnd} title="End Session">
                                        <Square size={24} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics Panel - BEFORE Session Log */}
                <div className="statistics-card">
                    <h3>Statistics</h3>

                    <div className="stats-total" onClick={() => setShowDistribution(true)}>
                        <div className="stats-total-label">Total Study Time</div>
                        <div className="stats-total-value">{formatDuration(totalTime)}</div>
                        <div className="stats-total-hint">Click to see breakdown</div>
                    </div>

                    <div className="stats-filters">
                        <div className="stats-filter-group">
                            <label>Subject</label>
                            <div className="custom-select">
                                <select
                                    value={statsSubject}
                                    onChange={(e) => {
                                        setStatsSubject(e.target.value as Subject | 'all');
                                        setStatsChapter('all');
                                        setStatsMaterial('all');
                                    }}
                                >
                                    <option value="all">All Subjects</option>
                                    <option value="physics">Physics</option>
                                    <option value="chemistry">Chemistry</option>
                                    <option value="maths">Maths</option>
                                </select>
                                <ChevronDown size={16} className="select-icon" />
                            </div>
                        </div>

                        {statsSubject !== 'all' && (
                            <div className="stats-filter-group">
                                <label>Chapter</label>
                                <div className="custom-select">
                                    <select
                                        value={statsChapter}
                                        onChange={(e) => {
                                            setStatsChapter(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
                                            setStatsMaterial('all');
                                        }}
                                    >
                                        <option value="all">All Chapters</option>
                                        {statsAvailableChapters.map(ch => (
                                            <option key={ch.serial} value={ch.serial}>{ch.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="select-icon" />
                                </div>
                            </div>
                        )}

                        {statsSubject !== 'all' && (
                            <div className="stats-filter-group">
                                <label>Material</label>
                                <div className="custom-select">
                                    <select
                                        value={statsMaterial}
                                        onChange={(e) => setStatsMaterial(e.target.value)}
                                    >
                                        <option value="all">All Materials</option>
                                        {statsAvailableMaterials.map(mat => (
                                            <option key={mat} value={mat}>{mat}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="select-icon" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="stats-filtered-result">
                        <div className="stats-filtered-label">
                            {statsSubject === 'all' ? 'All Sessions' : (
                                <>
                                    {statsSubject.charAt(0).toUpperCase() + statsSubject.slice(1)}
                                    {statsChapter !== 'all' && ` > ${subjectData[statsSubject]?.chapters.find(c => c.serial === statsChapter)?.name || ''}`}
                                    {statsMaterial !== 'all' && ` > ${statsMaterial}`}
                                </>
                            )}
                        </div>
                        <div className="stats-filtered-value">{formatDuration(totalFilteredTime)}</div>
                        <div className="stats-filtered-count">{getFilteredSessions().length} sessions</div>
                    </div>
                </div>

                {/* Session Log - AFTER Statistics */}
                <div className="session-log-card">
                    <h3>Session Log</h3>
                    <div className="session-log-list">
                        {sessions.length === 0 ? (
                            <div className="empty-log">
                                <Clock size={32} />
                                <p>No sessions recorded yet</p>
                                <span>Start a timer to track your study time</span>
                            </div>
                        ) : (
                            sessions.slice().reverse().map(session => (
                                <div key={session.id} className="session-log-item">
                                    <div className="session-info">
                                        <div className="session-title">{session.title}</div>
                                        <div className="session-meta">
                                            {new Date(session.endTime).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <div className="session-duration">{formatDuration(session.duration)}</div>
                                    <button
                                        className="session-delete-btn"
                                        onClick={() => onDeleteSession(session.id)}
                                        title="Delete session"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Distribution Modal */}
            {showDistribution && (
                <div className="distribution-modal-overlay" onClick={() => setShowDistribution(false)}>
                    <div className="distribution-modal" onClick={e => e.stopPropagation()}>
                        <div className="distribution-modal-header">
                            <h3>Study Time Breakdown</h3>
                            <button className="distribution-modal-close" onClick={() => setShowDistribution(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="distribution-total-time">
                            <div className="distribution-total-label">Total Study Time</div>
                            <div className="distribution-total-value">{formatDuration(totalTime)}</div>
                        </div>

                        <div className="distribution-section-title">Time by Subject</div>
                        <div className="distribution-chart">
                            {[
                                { key: 'physics', label: 'Physics', time: subjectDistribution.physics },
                                { key: 'chemistry', label: 'Chemistry', time: subjectDistribution.chemistry },
                                { key: 'maths', label: 'Maths', time: subjectDistribution.maths },
                                { key: 'custom', label: 'Custom', time: subjectDistribution.custom },
                            ].map(item => (
                                <div key={item.key} className="distribution-bar-item">
                                    <div className="distribution-bar-header">
                                        <span className="distribution-bar-label">{item.label}</span>
                                        <span className="distribution-bar-value">
                                            {formatDuration(item.time)} ({totalTime > 0 ? Math.round((item.time / totalTime) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="distribution-bar-track">
                                        <div
                                            className={`distribution-bar-fill ${item.key}`}
                                            style={{ width: `${totalTime > 0 ? (item.time / totalTime) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
