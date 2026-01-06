import { useState, useEffect, useMemo } from 'react';
import { X, BookOpen, Type, Clock, Search, ChevronRight } from 'lucide-react';
import { Subject, SubjectData, PlannerTask } from '../types';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: PlannerTask) => void;
    initialDate: string;
    subjectData: Record<Subject, SubjectData | null>;
    taskToEdit?: PlannerTask | null;
}

type TaskType = 'chapter' | 'custom' | null;

export function TaskModal({ isOpen, onClose, onSave, initialDate, subjectData, taskToEdit }: TaskModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [taskType, setTaskType] = useState<TaskType>(null);

    // Form States
    const [customTitle, setCustomTitle] = useState('');
    const [customSubject, setCustomSubject] = useState<Subject | 'none'>('none');
    const [selectedSubject, setSelectedSubject] = useState<Subject | ''>('');
    const [selectedChapterSerial, setSelectedChapterSerial] = useState<number | ''>('');
    const [selectedMaterial, setSelectedMaterial] = useState<string[]>([]);
    const [time, setTime] = useState('');
    const [date, setDate] = useState(initialDate);
    const [chapterSearch, setChapterSearch] = useState('');

    // Time Picker States
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState('12');
    const [selectedMinute, setSelectedMinute] = useState('00');
    const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

    useEffect(() => {
        if (isOpen) {
            setChapterSearch('');
            setIsTimePickerOpen(false);
            if (taskToEdit) {
                setTaskType(taskToEdit.type);
                setStep(2);
                setTime(taskToEdit.time);

                // Parse time for picker
                const [h, m] = taskToEdit.time.split(':');
                let hour = parseInt(h);
                const period = hour >= 12 ? 'PM' : 'AM';
                if (hour > 12) hour -= 12;
                if (hour === 0) hour = 12;

                setSelectedHour(hour.toString().padStart(2, '0'));
                setSelectedMinute(m);
                setSelectedPeriod(period);

                setDate(taskToEdit.date);

                if (taskToEdit.type === 'custom') {
                    setCustomTitle(taskToEdit.title);
                    setCustomSubject(taskToEdit.subject || 'none');
                } else {
                    setSelectedSubject(taskToEdit.subject || '');
                    setSelectedChapterSerial(taskToEdit.chapterSerial || '');
                    setSelectedMaterial(taskToEdit.material ? [taskToEdit.material] : []);
                }
            } else {
                setStep(1);
                setTaskType(null);
                setCustomTitle('');
                setCustomSubject('none');
                setSelectedSubject('');
                setSelectedChapterSerial('');
                setSelectedMaterial([]);
                setTime('');
                setDate(initialDate);

                // Default time states
                const now = new Date();
                let h = now.getHours();
                let m = Math.ceil(now.getMinutes() / 5) * 5; // Round to nearest 5

                if (m === 60) {
                    m = 0;
                    h += 1;
                    if (h === 24) h = 0;
                }

                const p = h >= 12 ? 'PM' : 'AM';
                if (h > 12) h -= 12;
                if (h === 0) h = 12;

                setSelectedHour(h.toString().padStart(2, '0'));
                setSelectedMinute(m.toString().padStart(2, '0'));
                setSelectedPeriod(p);
            }
        }
    }, [isOpen, initialDate, taskToEdit]);

    // Update time string when picker components change
    useEffect(() => {
        if (step === 2) {
            let h = parseInt(selectedHour);
            if (selectedPeriod === 'PM' && h !== 12) h += 12;
            if (selectedPeriod === 'AM' && h === 12) h = 0;
            setTime(`${h.toString().padStart(2, '0')}:${selectedMinute}`);
        }
    }, [selectedHour, selectedMinute, selectedPeriod, step]);

    const handleNext = (type: 'chapter' | 'custom') => {
        setTaskType(type);
        setStep(2);
    };

    const handleSave = () => {
        if (!time) return;

        const baseTask = {
            id: taskToEdit ? taskToEdit.id : crypto.randomUUID(),
            date,
            time,
            completed: taskToEdit ? taskToEdit.completed : false,
            type: taskType!
        };

        if (taskType === 'custom') {
            if (!customTitle.trim()) return;
            onSave({
                ...baseTask,
                title: customTitle,
                subject: customSubject === 'none' ? undefined : customSubject
            });
        } else {
            if (!selectedSubject || selectedChapterSerial === '' || selectedMaterial.length === 0) return;

            const subjectInfo = subjectData[selectedSubject as Subject];
            const chapter = subjectInfo?.chapters.find(c => c.serial === selectedChapterSerial);

            if (!chapter) return;

            // Create a task for each selected material
            selectedMaterial.forEach((material, index) => {
                onSave({
                    ...baseTask,
                    id: index === 0 ? baseTask.id : crypto.randomUUID(), // Keep original ID for first, new IDs for rest
                    title: chapter.name,
                    subtitle: material,
                    subject: selectedSubject,
                    chapterSerial: selectedChapterSerial,
                    material: material
                });
            });
        }
        onClose();
    };

    const filteredChapters = useMemo(() => {
        if (!selectedSubject) return [];
        const chapters = subjectData[selectedSubject as Subject]?.chapters || [];
        if (!chapterSearch) return chapters;
        return chapters.filter(c => c.name.toLowerCase().includes(chapterSearch.toLowerCase()));
    }, [selectedSubject, subjectData, chapterSearch]);

    const availableMaterials = useMemo(() => {
        if (!selectedSubject || selectedChapterSerial === '') return [];
        return subjectData[selectedSubject as Subject]?.chapters
            .find(c => c.serial === selectedChapterSerial)?.materials || [];
    }, [selectedSubject, selectedChapterSerial, subjectData]);

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'center' }}>
            <div className="modal-content input-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{step === 1 ? 'Add New Task' : `Add ${taskType === 'chapter' ? 'Chapter' : 'Task'}`}</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body-scrollable">
                    {step === 1 ? (
                        <div className="task-type-selection">
                            <button className="type-btn" onClick={() => handleNext('chapter')}>
                                <BookOpen size={28} />
                                <span>Add Chapter</span>
                            </button>
                            <button className="type-btn" onClick={() => handleNext('custom')}>
                                <Type size={28} />
                                <span>Add Other</span>
                            </button>
                        </div>
                    ) : (
                        <div className="task-form">
                            {taskType === 'chapter' ? (
                                <>
                                    <div className="form-group">
                                        <label>Subject</label>
                                        <div className="subject-selector">
                                            {(['physics', 'chemistry', 'maths'] as Subject[]).map(subj => (
                                                <button
                                                    key={subj}
                                                    className={`subject-option ${selectedSubject === subj ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setSelectedSubject(subj);
                                                        setSelectedChapterSerial('');
                                                        setSelectedMaterial([]);
                                                        setChapterSearch('');
                                                    }}
                                                    style={{ '--subj-color': `var(--${subj})` } as any}
                                                >
                                                    {subj.charAt(0).toUpperCase() + subj.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedSubject && (
                                        <div className="form-group">
                                            <label>Chapter</label>
                                            {selectedChapterSerial === '' ? (
                                                <div className="chapter-picker">
                                                    <div className="chapter-search-box">
                                                        <Search size={18} className="search-icon" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search chapters..."
                                                            value={chapterSearch}
                                                            onChange={e => setChapterSearch(e.target.value)}
                                                            autoFocus
                                                            className="search-input"
                                                        />
                                                    </div>
                                                    <div className="chapter-list">
                                                        {filteredChapters.map((c) => (
                                                            <button
                                                                key={c.serial}
                                                                className="chapter-item"
                                                                onClick={() => setSelectedChapterSerial(c.serial)}
                                                            >
                                                                <span><span className="bullet-icon">•</span> {c.name}</span>
                                                                <ChevronRight size={16} className="chevron" />
                                                            </button>
                                                        ))}
                                                        {filteredChapters.length === 0 && (
                                                            <div className="no-chapters">No chapters found</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="selected-chapter-display">
                                                    <span>
                                                        {subjectData[selectedSubject as Subject]?.chapters.find(c => c.serial === selectedChapterSerial)?.name}
                                                    </span>
                                                    <button className="change-btn" onClick={() => {
                                                        setSelectedChapterSerial('');
                                                        setSelectedMaterial([]);
                                                    }}>Change</button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedChapterSerial !== '' && (
                                        <div className="form-group">
                                            <label>Materials (select multiple)</label>
                                            <div className="material-pills">
                                                {availableMaterials.map((m) => (
                                                    <button
                                                        key={m}
                                                        className={`material-pill ${selectedMaterial.includes(m) ? 'selected' : ''}`}
                                                        onClick={() => setSelectedMaterial(prev =>
                                                            prev.includes(m)
                                                                ? prev.filter(mat => mat !== m)
                                                                : [...prev, m]
                                                        )}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                                {availableMaterials.length === 0 && (
                                                    <div className="no-materials">No materials available</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>Task Name</label>
                                        <input
                                            type="text"
                                            value={customTitle}
                                            onChange={e => setCustomTitle(e.target.value)}
                                            placeholder="Enter task details..."
                                            autoFocus
                                            className="large-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Subject (Optional)</label>
                                        <div className="material-pills">
                                            {(['physics', 'chemistry', 'maths'] as Subject[]).map((subj) => (
                                                <button
                                                    key={subj}
                                                    className={`material-pill ${customSubject === subj ? 'selected' : ''}`}
                                                    onClick={() => setCustomSubject(subj)}
                                                    style={{
                                                        borderColor: customSubject === subj ? `var(--${subj})` : 'var(--border)',
                                                        backgroundColor: customSubject === subj ? `var(--${subj})` : 'var(--bg-tertiary)',
                                                        color: customSubject === subj ? '#fff' : 'var(--text-secondary)'
                                                    }}
                                                >
                                                    {subj.charAt(0).toUpperCase() + subj.slice(1)}
                                                </button>
                                            ))}
                                            <button
                                                className={`material-pill ${customSubject === 'none' ? 'selected' : ''}`}
                                                onClick={() => setCustomSubject('none')}
                                            >
                                                None
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label>Till when? (Deadline)</label>
                                <div
                                    className={`time-display-box ${isTimePickerOpen ? 'active' : ''}`}
                                    onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                                >
                                    <span className="time-value">
                                        {selectedHour}:{selectedMinute} <span className="period">{selectedPeriod}</span>
                                    </span>
                                    <Clock size={20} className="time-icon" />
                                </div>

                                {isTimePickerOpen && (
                                    <div className="custom-time-picker">
                                        <div className="time-column">
                                            <span className="col-label">Hour</span>
                                            <div className="scroll-container">
                                                {hours.map(h => (
                                                    <button
                                                        key={h}
                                                        className={`time-btn ${selectedHour === h ? 'selected' : ''}`}
                                                        onClick={() => setSelectedHour(h)}
                                                    >
                                                        {h}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="time-column">
                                            <span className="col-label">Min</span>
                                            <div className="scroll-container">
                                                {minutes.map(m => (
                                                    <button
                                                        key={m}
                                                        className={`time-btn ${selectedMinute === m ? 'selected' : ''}`}
                                                        onClick={() => setSelectedMinute(m)}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="time-column period-col">
                                            <button
                                                className={`period-btn ${selectedPeriod === 'AM' ? 'selected' : ''}`}
                                                onClick={() => setSelectedPeriod('AM')}
                                            >
                                                AM
                                            </button>
                                            <button
                                                className={`period-btn ${selectedPeriod === 'PM' ? 'selected' : ''}`}
                                                onClick={() => setSelectedPeriod('PM')}
                                            >
                                                PM
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {step === 2 && (
                        <>
                            <button className="secondary-btn" onClick={() => setStep(1)}>Back</button>
                            <button
                                className="primary-btn"
                                onClick={handleSave}
                                disabled={
                                    (taskType === 'custom' && !customTitle) ||
                                    (taskType === 'chapter' && (!selectedSubject || !selectedChapterSerial || selectedMaterial.length === 0))
                                }
                            >
                                {taskToEdit ? 'Save Changes' : 'Add Task'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                /* Layout Fixes */
                .modal-overlay {
                    backdrop-filter: blur(6px) !important;
                    background: rgba(0, 0, 0, 0.4) !important;
                }
                .modal-content.input-modal {
                    display: flex;
                    flex-direction: column;
                    max-height: 85vh; /* Prevent overflowing screen */
                    border-radius: 24px;
                    background: var(--glass-bg);
                    backdrop-filter: blur(var(--glass-blur));
                    -webkit-backdrop-filter: blur(var(--glass-blur));
                    border: 1px solid var(--glass-border);
                    box-shadow: var(--glass-inner-glow), var(--glass-shadow);
                    overflow: hidden;
                }
                .modal-body-scrollable {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    /* Custom Scrollbar */
                    scrollbar-width: thin;
                    scrollbar-color: var(--border) transparent;
                }
                .modal-body-scrollable::-webkit-scrollbar {
                    width: 6px;
                }
                .modal-body-scrollable::-webkit-scrollbar-thumb {
                    background-color: var(--border);
                    border-radius: 4px;
                }
                .modal-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid var(--glass-border);
                    background: rgba(27, 27, 27, 0.08);
                    backdrop-filter: blur(var(--glass-blur));
                    border-radius: 0 0 24px 24px;
                    flex-shrink: 0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .task-type-selection {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    padding: 2rem 0;
                }
                .type-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    padding: 3rem 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 20px;
                    background: rgba(44, 44, 44, 0.12);
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 1.1rem;
                    font-weight: 600;
                    backdrop-filter: blur(5px);
                }
                .type-btn:hover {
                    border-color: var(--accent);
                    background: var(--accent-light);
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-md);
                }
                
                .form-group {
                    margin-bottom: 1.5rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                
                .subject-selector {
                    display: flex;
                    gap: 0.75rem;
                }
                .subject-option {
                    flex: 1;
                    padding: 1rem 0.75rem; /* Larger padding */
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(8px);
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 700; /* Bolder font */
                    font-size: 1.1rem; /* Larger font */
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }
                .subject-option:hover {
                    border-color: var(--subj-color);
                    color: var(--subj-color);
                }
                .subject-option.selected {
                    background: color-mix(in srgb, var(--subj-color), transparent 85%);
                    backdrop-filter: blur(12px);
                    border-color: var(--subj-color);
                    color: var(--subj-color);
                    box-shadow: 0 0 15px color-mix(in srgb, var(--subj-color), transparent 80%);
                }

                .chapter-picker {
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    overflow: hidden;
                    background: rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(8px);
                    display: flex;
                    flex-direction: column;
                    max-height: 280px;
                }
                .chapter-search-box {
                    display: flex;
                    align-items: center;
                    padding: 0 1.25rem;
                    height: 56px;
                    background: rgba(0, 0, 0, 0.35) !important;
                    border-bottom: 1px solid var(--glass-border);
                    backdrop-filter: blur(6px);
                }
                .search-icon {
                    color: var(--text-muted) !important;
                    margin-right: 0.75rem;
                }
                .search-input {
                    border: none;
                    background: transparent;
                    width: 100%;
                    outline: none !important;
                    box-shadow: none !important;
                    color: var(--text-primary);
                    font-size: 1rem;
                    padding: 0.5rem 0;
                    caret-color: var(--text-primary);
                }
                .chapter-list {
                    overflow-y: auto;
                    flex: 1;
                    padding: 4px;
                }
                .chapter-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    padding: 0.85rem 1rem;
                    border: none;
                    background: transparent;
                    color: var(--text-primary);
                    text-align: left;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.2s;
                    margin-bottom: 2px;
                }
                .chapter-item:hover {
                    background: var(--accent-light);
                    color: var(--accent);
                    transform: translateX(4px);
                }
                .bullet-icon {
                    color: var(--accent);
                    margin-right: 6px;
                    font-size: 1.2rem;
                    vertical-align: middle;
                }
                .chevron {
                    opacity: 0.3;
                }
                .no-chapters {
                    padding: 2rem;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }

                .selected-chapter-display {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    color: var(--text-primary);
                    font-weight: 600;
                    box-shadow: var(--shadow-sm);
                }
                .change-btn {
                    font-size: 0.8rem;
                    text-decoration: underline;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--text-secondary);
                }
                .change-btn:hover {
                    color: var(--text-primary);
                }

                .large-input {
                    width: 100%;
                    padding: 1rem;
                    font-size: 1.1rem;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    color: var(--text-primary);
                    transition: all 0.2s;
                }
                .large-input:focus {
                    outline: none;
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px var(--accent-light);
                }
                .large-input::placeholder {
                    font-size: 1.1rem;
                    opacity: 0.6;
                }

                /* Material Pills */
                .material-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }
                .material-pill {
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }
                .material-pill:hover {
                    background: var(--bg-primary);
                    border-color: var(--accent);
                }
                .material-pill.selected {
                    background: color-mix(in srgb, var(--accent), transparent 80%);
                    backdrop-filter: blur(12px);
                    color: var(--accent);
                    border-color: var(--accent);
                    box-shadow: 0 0 10px color-mix(in srgb, var(--accent), transparent 80%);
                }
                .no-materials {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-style: italic;
                }

                /* Time Picker UI */
                .time-display-box {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .time-display-box.active {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px var(--accent-light);
                    background: var(--bg-secondary);
                }
                .time-value {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .period {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    margin-left: 2px;
                }
                .time-icon {
                    color: var(--accent);
                }

                .custom-time-picker {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    animation: slideDown 0.2s ease;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .time-column {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }
                .col-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }
                .scroll-container {
                    height: 150px;
                    overflow-y: auto;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 0 4px;
                }
                /* Hide scrollbar for cleaner UI */
                .scroll-container::-webkit-scrollbar {
                    display: none;
                }
                .scroll-container {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .time-btn {
                    padding: 0.5rem;
                    border: 1px solid transparent;
                    border-radius: 6px;
                    background: transparent;
                    cursor: pointer;
                    color: var(--text-secondary);
                    font-weight: 500;
                    transition: all 0.1s;
                }
                .time-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-primary);
                }
                .time-btn.selected {
                    background: color-mix(in srgb, var(--accent), transparent 80%);
                    backdrop-filter: blur(8px);
                    color: var(--accent);
                    font-weight: 700;
                    border-color: var(--accent);
                }

                .period-col {
                    justify-content: center;
                    gap: 0.75rem;
                }
                .period-btn {
                    padding: 0.75rem 1rem;
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }
                .period-btn.selected {
                    background: color-mix(in srgb, var(--accent), transparent 80%);
                    backdrop-filter: blur(8px);
                    color: var(--accent);
                    border-color: var(--accent);
                }

                @media (max-width: 480px) {
                    .task-type-selection {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                        padding: 1rem 0;
                    }
                    .type-btn {
                        padding: 1.5rem;
                        flex-direction: row;
                    }
                    .modal-body-scrollable {
                        padding: 1rem;
                    }
                    .modal-footer {
                        padding: 1rem;
                    }
                }

                /* ===== Light Mode Overrides ===== */
                :root:not([data-theme="dark"]) .type-btn,
                [data-theme="light"] .type-btn {
                    border: 1px solid var(--border);
                    background: var(--bg-tertiary);
                }

                :root:not([data-theme="dark"]) .subject-option,
                [data-theme="light"] .subject-option {
                    border: 1px solid var(--border);
                    background: var(--bg-tertiary);
                }

                :root:not([data-theme="dark"]) .large-input,
                [data-theme="light"] .large-input {
                    border: 1px solid var(--border);
                    background: var(--bg-tertiary);
                }

                :root:not([data-theme="dark"]) .material-pill,
                [data-theme="light"] .material-pill {
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                }

                :root:not([data-theme="dark"]) .time-display-box,
                [data-theme="light"] .time-display-box {
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                }

                :root:not([data-theme="dark"]) .custom-time-picker,
                [data-theme="light"] .custom-time-picker {
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                }

                :root:not([data-theme="dark"]) .time-btn:hover,
                [data-theme="light"] .time-btn:hover {
                    background: var(--bg-secondary);
                }

                :root:not([data-theme="dark"]) .period-btn,
                [data-theme="light"] .period-btn {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                }

                :root:not([data-theme="dark"]) .modal-content.input-modal,
                [data-theme="light"] .modal-content.input-modal {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                }

                :root:not([data-theme="dark"]) .modal-footer,
                [data-theme="light"] .modal-footer {
                    background: rgba(240, 240, 240, 0.5);
                }
            `}</style>
        </div >
    );
}
