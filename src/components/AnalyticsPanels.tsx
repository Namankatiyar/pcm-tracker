import { useState, useMemo, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { StudySession, MockScore } from '../types';
import { formatDateLocal } from '../utils/date';
import { Plus, TrendingUp, Clock, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

interface AnalyticsPanelsProps {
    studySessions: StudySession[];
    mockScores: MockScore[];
    onAddMockScore: (score: Omit<MockScore, 'id'>) => void;
    onDeleteMockScore: (id: string) => void;
}

type StudyViewMode = 'weekly' | 'monthly';

export function AnalyticsPanels({
    studySessions,
    mockScores,
    onAddMockScore,
    onDeleteMockScore
}: AnalyticsPanelsProps) {
    const [studyViewMode, setStudyViewMode] = useState<StudyViewMode>('weekly');
    const [weekOffset, setWeekOffset] = useState(0);
    const [monthOffset, setMonthOffset] = useState(0);
    const [isAddingMock, setIsAddingMock] = useState(false);
    const [newMock, setNewMock] = useState({
        name: '',
        date: formatDateLocal(new Date()),
        physicsMarks: 0,
        chemistryMarks: 0,
        mathsMarks: 0,
        maxMarks: 300
    });

    // Subject colors matching site-wide theme
    const subjectColors = {
        physics: '#6366f1',
        chemistry: '#10b981',
        maths: '#f59e0b',
        custom: '#8b5cf6'
    };

    // Detect theme for chart colors
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.getAttribute('data-theme') === 'dark');

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    const axisColor = isDarkMode ? '#ffffff' : '#000000';
    const gridColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    // Get week days for the selected week
    const getWeekDays = (offset: number) => {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1 + (offset * 7));

        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            days.push(day);
        }
        return days;
    };

    // Get month days for the selected month
    const getMonthDays = (offset: number) => {
        const today = new Date();
        const targetMonth = new Date(today.getFullYear(), today.getMonth() + offset, 1);
        const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();

        const days: Date[] = [];
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(targetMonth.getFullYear(), targetMonth.getMonth(), i));
        }
        return days;
    };

    // Calculate study time per subject for a given date
    const getStudyTimeBySubject = (dateStr: string) => {
        const daySessions = studySessions.filter(s => s.startTime.startsWith(dateStr));

        return {
            physics: daySessions.filter(s => s.subject === 'physics').reduce((acc, s) => acc + s.duration, 0) / 3600,
            chemistry: daySessions.filter(s => s.subject === 'chemistry').reduce((acc, s) => acc + s.duration, 0) / 3600,
            maths: daySessions.filter(s => s.subject === 'maths').reduce((acc, s) => acc + s.duration, 0) / 3600,
            other: daySessions.filter(s => !s.subject).reduce((acc, s) => acc + s.duration, 0) / 3600
        };
    };

    // Weekly chart data
    const weeklyChartData = useMemo(() => {
        const weekDays = getWeekDays(weekOffset);
        const labels = weekDays.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));

        const physicsData: number[] = [];
        const chemistryData: number[] = [];
        const mathsData: number[] = [];
        const customData: number[] = [];

        weekDays.forEach(day => {
            const dateStr = formatDateLocal(day);
            const times = getStudyTimeBySubject(dateStr);
            physicsData.push(Number(times.physics.toFixed(2)));
            chemistryData.push(Number(times.chemistry.toFixed(2)));
            mathsData.push(Number(times.maths.toFixed(2)));
            customData.push(Number(times.other.toFixed(2)));
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Physics',
                    data: physicsData,
                    backgroundColor: subjectColors.physics,
                    borderRadius: 4,
                    barPercentage: 0.7
                },
                {
                    label: 'Chemistry',
                    data: chemistryData,
                    backgroundColor: subjectColors.chemistry,
                    borderRadius: 4,
                    barPercentage: 0.7
                },
                {
                    label: 'Maths',
                    data: mathsData,
                    backgroundColor: subjectColors.maths,
                    borderRadius: 4,
                    barPercentage: 0.7
                },
                {
                    label: 'Custom',
                    data: customData,
                    backgroundColor: subjectColors.custom,
                    borderRadius: 4,
                    barPercentage: 0.7
                }
            ]
        };
    }, [studySessions, weekOffset]);

    // Monthly chart data - using a heat-map style area chart
    const monthlyChartData = useMemo(() => {
        const monthDays = getMonthDays(monthOffset);
        const labels = monthDays.map(d => d.getDate().toString());

        const totalData: number[] = [];

        monthDays.forEach(day => {
            const dateStr = formatDateLocal(day);
            const times = getStudyTimeBySubject(dateStr);
            const total = times.physics + times.chemistry + times.maths + times.other;
            totalData.push(Number(total.toFixed(2)));
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Total Hours',
                    data: totalData,
                    fill: true,
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: '#6366f1',
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    tension: 0.4
                }
            ]
        };
    }, [studySessions, monthOffset]);

    // Mock scores chart data
    const mockScoresChartData = useMemo(() => {
        const sortedScores = [...mockScores].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // Use serial numbers if density is high (more than 3), otherwise names
        const useSerialNumbers = sortedScores.length > 3;
        const labels = sortedScores.map((s, index) => useSerialNumbers ? (index + 1).toString() : s.name);

        return {
            labels,
            datasets: [
                {
                    label: 'Total',
                    data: sortedScores.map(s => s.totalMarks),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.3,
                    fill: true,
                    borderWidth: 3
                },
                {
                    label: 'Physics',
                    data: sortedScores.map(s => s.physicsMarks),
                    borderColor: subjectColors.physics,
                    backgroundColor: 'transparent',
                    pointBackgroundColor: subjectColors.physics,
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    borderWidth: 2,
                    borderDash: [5, 5]
                },
                {
                    label: 'Chemistry',
                    data: sortedScores.map(s => s.chemistryMarks),
                    borderColor: subjectColors.chemistry,
                    backgroundColor: 'transparent',
                    pointBackgroundColor: subjectColors.chemistry,
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    borderWidth: 2,
                    borderDash: [5, 5]
                },
                {
                    label: 'Maths',
                    data: sortedScores.map(s => s.mathsMarks),
                    borderColor: subjectColors.maths,
                    backgroundColor: 'transparent',
                    pointBackgroundColor: subjectColors.maths,
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,
                    borderWidth: 2,
                    borderDash: [5, 5]
                }
            ]
        };
    }, [mockScores]);

    // Chart options
    const barChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: axisColor,
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 11, family: 'Inter' }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { family: 'Inter' },
                bodyFont: { family: 'Inter' },
                padding: 10,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { color: axisColor, font: { size: 11, family: 'Inter' } }
            },
            y: {
                stacked: true,
                grid: { color: gridColor },
                ticks: {
                    color: axisColor,
                    font: { size: 11, family: 'Inter' },
                    callback: (value: number | string) => `${value}h`
                },
                title: {
                    display: true,
                    text: 'Hours',
                    color: axisColor,
                    font: { size: 12, family: 'Inter' }
                }
            }
        }
    }), [axisColor, gridColor]);

    const lineChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: axisColor,
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 11, family: 'Inter' }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { family: 'Inter' },
                bodyFont: { family: 'Inter' },
                padding: 10,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: axisColor, font: { size: 10, family: 'Inter' } }
            },
            y: {
                grid: { color: gridColor },
                ticks: {
                    color: axisColor,
                    font: { size: 11, family: 'Inter' },
                    callback: (value: number | string) => `${value}h`
                }
            }
        }
    }), [axisColor, gridColor]);

    const mockChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: axisColor,
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 11, family: 'Inter' }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { family: 'Inter' },
                bodyFont: { family: 'Inter' },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                    title: (context: any) => {
                        // Use original name in tooltip if we are showing serial numbers
                        if (mockScores.length > 3) {
                            const sortedScores = [...mockScores].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                            const index = context[0].dataIndex;
                            return `${index + 1}. ${sortedScores[index].name}`;
                        }
                        return context[0].label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: axisColor, font: { size: 11, family: 'Inter' } }
            },
            y: {
                grid: { color: gridColor },
                ticks: { color: axisColor, font: { size: 11, family: 'Inter' } },
                title: {
                    display: true,
                    text: 'Marks',
                    color: axisColor,
                    font: { size: 12, family: 'Inter' }
                },
                min: 0,
                max: 300
            }
        }
    }), [axisColor, gridColor, mockScores]);

    // Get week/month display label
    const getWeekLabel = () => {
        const weekDays = getWeekDays(weekOffset);
        const start = weekDays[0];
        const end = weekDays[6];
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    const getMonthLabel = () => {
        const today = new Date();
        const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
        return targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Handle adding mock score
    const handleAddMock = () => {
        if (!newMock.name.trim()) return;

        onAddMockScore({
            name: newMock.name,
            date: newMock.date,
            physicsMarks: newMock.physicsMarks,
            chemistryMarks: newMock.chemistryMarks,
            mathsMarks: newMock.mathsMarks,
            totalMarks: newMock.physicsMarks + newMock.chemistryMarks + newMock.mathsMarks,
            maxMarks: newMock.maxMarks
        });

        setNewMock({
            name: '',
            date: formatDateLocal(new Date()),
            physicsMarks: 0,
            chemistryMarks: 0,
            mathsMarks: 0,
            maxMarks: 300
        });
        setIsAddingMock(false);
    };

    return (
        <div className="analytics-panels-row">
            {/* Study Time Panel */}
            <div className="analytics-panel study-time-panel">
                <div className="panel-header">
                    <div className="panel-title">
                        <Clock size={20} />
                        <h3>Study Time</h3>
                    </div>
                    <div className="view-toggle-small">
                        <button
                            className={studyViewMode === 'weekly' ? 'active' : ''}
                            onClick={() => setStudyViewMode('weekly')}
                        >
                            Weekly
                        </button>
                        <button
                            className={studyViewMode === 'monthly' ? 'active' : ''}
                            onClick={() => setStudyViewMode('monthly')}
                        >
                            Monthly
                        </button>
                    </div>
                </div>

                <div className="date-navigator">
                    <button onClick={() => studyViewMode === 'weekly' ? setWeekOffset(w => w - 1) : setMonthOffset(m => m - 1)}>
                        <ChevronLeft size={18} />
                    </button>
                    <span>{studyViewMode === 'weekly' ? getWeekLabel() : getMonthLabel()}</span>
                    <button
                        onClick={() => studyViewMode === 'weekly' ? setWeekOffset(w => w + 1) : setMonthOffset(m => m + 1)}
                        disabled={studyViewMode === 'weekly' ? weekOffset >= 0 : monthOffset >= 0}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className="chart-container">
                    {studyViewMode === 'weekly' ? (
                        <Bar data={weeklyChartData} options={barChartOptions} />
                    ) : (
                        <Line data={monthlyChartData} options={lineChartOptions} />
                    )}
                </div>
            </div>

            {/* Mock Scores Panel */}
            <div className="analytics-panel mock-scores-panel">
                <div className="panel-header">
                    <div className="panel-title">
                        <TrendingUp size={20} />
                        <h3>Mock Scores</h3>
                    </div>
                    <button className="add-mock-btn" onClick={() => setIsAddingMock(true)}>
                        <Plus size={16} />
                        <span>Add</span>
                    </button>
                </div>

                {mockScores.length > 0 ? (
                    <div className={`chart-container ${mockScores.length > 3 ? 'scrollable' : ''}`}>
                        <div style={{ minWidth: mockScores.length > 3 ? `${mockScores.length * 60}px` : '100%', height: '100%' }}>
                            <Line data={mockScoresChartData} options={mockChartOptions} />
                        </div>
                    </div>
                ) : (
                    <div className="empty-mock-state">
                        <TrendingUp size={48} strokeWidth={1} />
                        <p>No mock tests recorded yet</p>
                        <button onClick={() => setIsAddingMock(true)}>Add Your First Mock</button>
                    </div>
                )}

                {mockScores.length > 0 && (
                    <div className={`mock-list ${mockScores.length > 3 ? 'scrollable-list' : ''}`}>
                        {[...mockScores]
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .reverse()
                            .map((score) => {
                                // Find the original index/serial number
                                const sortedScores = [...mockScores].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                const serialNumber = sortedScores.findIndex(s => s.id === score.id) + 1;

                                return (
                                    <div key={score.id} className="mock-item">
                                        <div className="mock-info">
                                            <span className="mock-name">
                                                <span className="serial-badge">#{serialNumber}</span> {score.name}
                                            </span>
                                            <span className="mock-date">{new Date(score.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <div className="mock-scores-mini">
                                            <span style={{ color: subjectColors.physics }}>{score.physicsMarks}</span>
                                            <span style={{ color: subjectColors.chemistry }}>{score.chemistryMarks}</span>
                                            <span style={{ color: subjectColors.maths }}>{score.mathsMarks}</span>
                                            <span className="total-score">{score.totalMarks}/{score.maxMarks || 300}</span>
                                        </div>
                                        <button className="delete-mock-btn" onClick={() => onDeleteMockScore(score.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Add Mock Modal */}
            {isAddingMock && (
                <div className="modal-overlay" onClick={() => setIsAddingMock(false)}>
                    <div className="add-mock-modal" onClick={e => e.stopPropagation()}>
                        <h3>Add Mock Test Score</h3>

                        <div className="form-group">
                            <label>Test Name</label>
                            <input
                                type="text"
                                placeholder="e.g., NTA Mock 1"
                                value={newMock.name}
                                onChange={e => setNewMock(m => ({ ...m, name: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={newMock.date}
                                onChange={e => setNewMock(m => ({ ...m, date: e.target.value }))}
                            />
                        </div>

                        <div className="marks-grid">
                            <div className="form-group">
                                <label style={{ color: subjectColors.physics }}>Physics</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newMock.physicsMarks}
                                    onChange={e => setNewMock(m => ({ ...m, physicsMarks: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: subjectColors.chemistry }}>Chemistry</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newMock.chemistryMarks}
                                    onChange={e => setNewMock(m => ({ ...m, chemistryMarks: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: subjectColors.maths }}>Maths</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newMock.mathsMarks}
                                    onChange={e => setNewMock(m => ({ ...m, mathsMarks: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div className="total-display">
                            Total: <strong>{newMock.physicsMarks + newMock.chemistryMarks + newMock.mathsMarks}</strong> / 300
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setIsAddingMock(false)}>Cancel</button>
                            <button className="save-btn" onClick={handleAddMock} disabled={!newMock.name.trim()}>
                                Save Score
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .analytics-panels-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 0;
                }

                .analytics-panel {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: var(--border-radius);
                    padding: 1.25rem;
                    box-shadow: var(--shadow-lg), var(--shadow-glow);
                    display: flex;
                    flex-direction: column;
                    min-height: 380px;
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .panel-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-primary);
                }

                .panel-title h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0;
                }

                .view-toggle-small {
                    display: flex;
                    background: var(--bg-tertiary);
                    border-radius: 6px;
                    padding: 3px;
                    border: 1px solid var(--border);
                }

                .view-toggle-small button {
                    padding: 6px 12px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    font-weight: 600;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .view-toggle-small button.active {
                    background: var(--accent);
                    color: white;
                }

                .date-navigator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .date-navigator button {
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }

                .date-navigator button:hover:not(:disabled) {
                    border-color: var(--accent);
                    color: var(--accent);
                }

                .date-navigator button:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .chart-container {
                    flex: 1;
                    min-height: 220px;
                    position: relative;
                }

                .chart-container.scrollable {
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }

                .chart-container.scrollable::-webkit-scrollbar {
                    height: 6px;
                }

                .chart-container.scrollable::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 10px;
                }

                .add-mock-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    background: var(--accent);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .add-mock-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 12px var(--accent);
                }

                .empty-mock-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    gap: 1rem;
                    padding: 2rem;
                }

                .empty-mock-state p {
                    font-size: 0.9rem;
                }

                .empty-mock-state button {
                    padding: 10px 20px;
                    background: var(--accent);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .empty-mock-state button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px var(--accent);
                }

                .mock-list {
                    margin-top: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    border-top: 1px solid var(--border);
                    padding-top: 1rem;
                }

                .mock-list.scrollable-list {
                    max-height: 200px;
                    overflow-y: auto;
                    padding-right: 4px;
                }

                .mock-list.scrollable-list::-webkit-scrollbar {
                    width: 4px;
                }

                .mock-list.scrollable-list::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 10px;
                }

                .mock-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.5rem 0.75rem;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    font-size: 0.85rem;
                }

                .mock-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .mock-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .mock-date {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .mock-scores-mini {
                    display: flex;
                    gap: 0.75rem;
                    font-weight: 600;
                    font-size: 0.8rem;
                }

                .mock-scores-mini .total-score {
                    color: var(--text-primary);
                    padding-left: 0.5rem;
                    border-left: 1px solid var(--border);
                }

                .delete-mock-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .delete-mock-btn:hover {
                    color: var(--priority-high);
                    background: rgba(239, 68, 68, 0.1);
                }

                .add-mock-modal {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: var(--border-radius);
                    padding: 1.5rem;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: var(--shadow-lg);
                }

                .add-mock-modal h3 {
                    margin: 0 0 1.5rem 0;
                    font-size: 1.2rem;
                    color: var(--text-primary);
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin-bottom: 0.4rem;
                }

                .form-group input {
                    width: 100%;
                    padding: 0.6rem 0.75rem;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    color: var(--text-primary);
                    font-family: inherit;
                    font-size: 0.9rem;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: var(--accent);
                }

                .marks-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.75rem;
                }

                .total-display {
                    text-align: center;
                    padding: 1rem;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    font-size: 1rem;
                    color: var(--text-secondary);
                    margin-bottom: 1rem;
                }

                .total-display strong {
                    font-size: 1.5rem;
                    color: var(--accent);
                }

                .modal-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                }

                .modal-actions button {
                    padding: 0.6rem 1.25rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .cancel-btn {
                    background: transparent;
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                }

                .cancel-btn:hover {
                    border-color: var(--text-primary);
                    color: var(--text-primary);
                }

                .save-btn {
                    background: var(--accent);
                    border: none;
                    color: white;
                }

                .save-btn:hover:not(:disabled) {
                    transform: scale(1.02);
                }

                .save-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 900px) {
                    .analytics-panels-row {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 500px) {
                    .marks-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
