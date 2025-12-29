import { useState, useEffect, useMemo } from 'react';
import { X, BookOpen, Type, Clock, Search, ChevronRight } from 'lucide-react';
import { Subject, SubjectData, Chapter, PlannerTask } from '../types';

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
    const [selectedSubject, setSelectedSubject] = useState<Subject | ''>('');
    const [selectedChapterSerial, setSelectedChapterSerial] = useState<number | ''>('');
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [time, setTime] = useState('');
    const [date, setDate] = useState(initialDate);
    const [chapterSearch, setChapterSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            setChapterSearch('');
            if (taskToEdit) {
                setTaskType(taskToEdit.type);
                setStep(2);
                setTime(taskToEdit.time);
                setDate(taskToEdit.date);
                
                if (taskToEdit.type === 'custom') {
                    setCustomTitle(taskToEdit.title);
                } else {
                    setSelectedSubject(taskToEdit.subject || '');
                    setSelectedChapterSerial(taskToEdit.chapterSerial || '');
                    setSelectedMaterial(taskToEdit.material || '');
                }
            } else {
                setStep(1);
                setTaskType(null);
                setCustomTitle('');
                setSelectedSubject('');
                setSelectedChapterSerial('');
                setSelectedMaterial('');
                setTime('');
                setDate(initialDate);
            }
        }
    }, [isOpen, initialDate, taskToEdit]);

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
            });
        } else {
            if (!selectedSubject || selectedChapterSerial === '' || !selectedMaterial) return;
            
            const subjectInfo = subjectData[selectedSubject as Subject];
            const chapter = subjectInfo?.chapters.find(c => c.serial === selectedChapterSerial);
            
            if (!chapter) return;

            onSave({
                ...baseTask,
                title: chapter.name,
                subtitle: selectedMaterial,
                subject: selectedSubject,
                chapterSerial: selectedChapterSerial,
                material: selectedMaterial
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

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'center' }}>
            <div className="modal-content input-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{step === 1 ? 'Add New Task' : `Add ${taskType === 'chapter' ? 'Chapter' : 'Task'}`}</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body" style={{ minHeight: '300px' }}>
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
                                                        setSelectedMaterial('');
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
                                                    <div className="chapter-search">
                                                        <Search size={16} className="search-icon" />
                                                        <input 
                                                            type="text" 
                                                            placeholder="Search chapters..." 
                                                            value={chapterSearch}
                                                            onChange={e => setChapterSearch(e.target.value)}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="chapter-list">
                                                        {filteredChapters.map((c) => (
                                                            <button 
                                                                key={c.serial} 
                                                                className="chapter-item"
                                                                onClick={() => setSelectedChapterSerial(c.serial)}
                                                            >
                                                                <span>{c.serial}. {c.name}</span>
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
                                                        setSelectedMaterial('');
                                                    }}>Change</button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedChapterSerial !== '' && (
                                        <div className="form-group">
                                            <label>Material</label>
                                            <select 
                                                value={selectedMaterial} 
                                                onChange={(e) => setSelectedMaterial(e.target.value)}
                                                className="custom-select"
                                            >
                                                <option value="">Select Material</option>
                                                {subjectData[selectedSubject as Subject]?.chapters
                                                    .find(c => c.serial === selectedChapterSerial)?.materials.map((m) => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    )}
                                </>
                            ) : (
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
                            )}

                            <div className="form-group">
                                <label>Till when? (Deadline)</label>
                                <div className="time-input-wrapper">
                                    <input 
                                        type="time" 
                                        value={time} 
                                        onChange={e => setTime(e.target.value)}
                                        required
                                        className="styled-time-input"
                                    />
                                    <Clock size={18} className="input-icon-right" />
                                </div>
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
                                    !time || 
                                    (taskType === 'custom' && !customTitle) || 
                                    (taskType === 'chapter' && (!selectedSubject || !selectedChapterSerial || !selectedMaterial))
                                }
                            >
                                {taskToEdit ? 'Save Changes' : 'Add Task'}
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            <style>{`
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
                    border: 2px solid var(--border);
                    border-radius: 16px;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 1.1rem;
                    font-weight: 600;
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
                    padding: 0.75rem;
                    border: 2px solid var(--border);
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }
                .subject-option:hover {
                    border-color: var(--subj-color);
                    color: var(--subj-color);
                }
                .subject-option.selected {
                    background: color-mix(in srgb, var(--subj-color), transparent 90%);
                    border-color: var(--subj-color);
                    color: var(--subj-color);
                }

                .chapter-picker {
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    overflow: hidden;
                    background: var(--bg-tertiary);
                    display: flex;
                    flex-direction: column;
                    max-height: 250px;
                }
                .chapter-search {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem;
                    border-bottom: 1px solid var(--border);
                    background: var(--bg-secondary);
                }
                .search-icon {
                    color: var(--text-muted);
                    margin-right: 0.5rem;
                }
                .chapter-search input {
                    border: none;
                    background: transparent;
                    width: 100%;
                    outline: none;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                }
                .chapter-list {
                    overflow-y: auto;
                    flex: 1;
                }
                .chapter-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: none;
                    background: transparent;
                    color: var(--text-primary);
                    text-align: left;
                    cursor: pointer;
                    border-bottom: 1px solid var(--border);
                    transition: background 0.15s;
                }
                .chapter-item:last-child {
                    border-bottom: none;
                }
                .chapter-item:hover {
                    background: var(--accent-light);
                    color: var(--accent);
                }
                .chevron {
                    opacity: 0.5;
                }
                .no-chapters {
                    padding: 2rem;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .selected-chapter-display {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--accent);
                    border-radius: 8px;
                    color: var(--accent);
                    font-weight: 500;
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
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    transition: border-color 0.2s;
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

                .custom-select {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    font-size: 1rem;
                }

                .time-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .styled-time-input {
                    width: 100%;
                    padding: 0.75rem;
                    padding-right: 2.5rem; /* Space for icon */
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    font-size: 1rem;
                    font-family: inherit;
                    appearance: none; /* Attempt to standardise */
                }
                .styled-time-input:focus {
                    outline: none;
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px var(--accent-light);
                }
                .styled-time-input::-webkit-calendar-picker-indicator {
                    opacity: 0; /* Hide native icon */
                    position: absolute;
                    right: 10px;
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    z-index: 2;
                }
                .input-icon-right {
                    position: absolute;
                    right: 12px;
                    color: var(--accent);
                    pointer-events: none;
                    z-index: 1;
                }
            `}</style>
        </div>
    );
}