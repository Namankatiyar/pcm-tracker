import { useState } from 'react';
import { Subject, SubjectData, SubjectProgress, Priority } from '../types';
import { ChapterRow } from './ChapterRow';
import { ProgressBar } from './ProgressBar';
import { ConfirmationModal } from './ConfirmationModal';

interface SubjectPageProps {
    subject: Subject;
    data: SubjectData | null;
    progress: SubjectProgress;
    subjectProgress: number;
    onToggleMaterial: (chapterSerial: number, material: string) => void;
    onSetPriority: (chapterSerial: number, priority: Priority) => void;
    onAddMaterial?: (name: string) => void;
    onRemoveMaterial?: (name: string) => void;
}

const subjectConfig: Record<Subject, { label: string; icon: string; color: string }> = {
    physics: { label: 'Physics', icon: '⚛️', color: '#6366f1' },
    chemistry: { label: 'Chemistry', icon: '🧪', color: '#10b981' },
    maths: { label: 'Maths', icon: '📐', color: '#f59e0b' },
};

export function SubjectPage({
    subject,
    data,
    progress,
    subjectProgress,
    onToggleMaterial,
    onSetPriority,
    onAddMaterial,
    onRemoveMaterial
}: SubjectPageProps) {
    const config = subjectConfig[subject];
    const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; material: string | null }>({
        isOpen: false,
        material: null
    });

    if (!data) {
        return (
            <div className="subject-page loading">
                <div className="loader"></div>
                <p>Loading {config.label} chapters...</p>
            </div>
        );
    }

    const handleAddMaterialClick = () => {
        if (!onAddMaterial) return;
        const name = window.prompt("Enter the name of the new study material (e.g., 'YouTube', 'Notes'):");
        if (name && name.trim()) {
            onAddMaterial(name.trim());
        }
    };

    const confirmDelete = () => {
        if (onRemoveMaterial && deleteModalState.material) {
            onRemoveMaterial(deleteModalState.material);
        }
        setDeleteModalState({ isOpen: false, material: null });
    };

    return (
        <div className="subject-page">
            <div className="subject-header">
                <div className="subject-title">
                    <span className="subject-icon-large">{config.icon}</span>
                    <div>
                        <h1>{config.label}</h1>
                        <p>
                            {data.chapters.length} Chapters • {data.materialNames.length} Study Materials
                            {onAddMaterial && (
                                <button 
                                    className="add-material-btn"
                                    onClick={handleAddMaterialClick}
                                    title="Add new study material column"
                                >
                                    + Add
                                </button>
                            )}
                        </p>
                    </div>
                </div>
                <div className="subject-progress-summary">
                    <ProgressBar progress={subjectProgress} height={12} />
                </div>
            </div>

            <div className="chapter-table-container">
                <table className="chapter-table">
                    <thead>
                        <tr>
                            <th className="serial-header">#</th>
                            <th className="chapter-header">Chapter</th>
                            {data.materialNames.map((material) => (
                                <th key={material} className="material-header">
                                    <div className="material-header-content">
                                        <span>{material}</span>
                                        {onRemoveMaterial && (
                                            <button 
                                                className="remove-material-btn"
                                                onClick={() => setDeleteModalState({ isOpen: true, material })}
                                                title="Remove column"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="priority-header">Priority</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.chapters.map((chapter) => (
                            <ChapterRow
                                key={chapter.serial}
                                chapter={chapter}
                                materialNames={data.materialNames}
                                progress={progress[chapter.serial]}
                                onToggleMaterial={onToggleMaterial}
                                onSetPriority={onSetPriority}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="legend">
                <h4>Priority Legend</h4>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="legend-color high"></span>
                        <span>High Priority</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color medium"></span>
                        <span>Medium Priority</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color low"></span>
                        <span>Low Priority</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color completed"></span>
                        <span>Completed</span>
                    </div>
                </div>
            </div>

            <ConfirmationModal 
                isOpen={deleteModalState.isOpen}
                title="Remove Study Material"
                message={`Are you sure you want to remove the '${deleteModalState.material}' column? This will hide it from your view.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalState({ isOpen: false, material: null })}
            />
        </div>
    );
}
