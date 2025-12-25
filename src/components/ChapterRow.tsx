import { useEffect, useRef } from 'react';
import { Chapter, ChapterProgress, Priority } from '../types';
import { PrioritySelector } from './PrioritySelector';
import { triggerConfetti } from '../utils/confetti';

interface ChapterRowProps {
    chapter: Chapter;
    materialNames: string[];
    progress: ChapterProgress | undefined;
    onToggleMaterial: (chapterSerial: number, material: string) => void;
    onSetPriority: (chapterSerial: number, priority: Priority) => void;
}

export function ChapterRow({
    chapter,
    materialNames,
    progress,
    onToggleMaterial,
    onSetPriority
}: ChapterRowProps) {
    const completed = progress?.completed || {};
    const priority = progress?.priority || 'none';
    const prevCompletedRef = useRef<number>(0);

    const completedCount = materialNames.filter(m => completed[m]).length;
    const isFullyCompleted = completedCount === materialNames.length;

    useEffect(() => {
        const prevCompleted = prevCompletedRef.current;
        if (isFullyCompleted && prevCompleted < materialNames.length && prevCompleted > 0) {
            triggerConfetti();
        }
        prevCompletedRef.current = completedCount;
    }, [completedCount, isFullyCompleted, materialNames.length]);

    const getPriorityClass = () => {
        if (isFullyCompleted) return 'completed';
        return priority !== 'none' ? `priority-${priority}` : '';
    };

    return (
        <tr className={`chapter-row ${getPriorityClass()}`}>
            <td className="serial-cell">{chapter.serial}</td>
            <td className="chapter-cell">
                <span className={isFullyCompleted ? 'chapter-name completed' : 'chapter-name'}>
                    {chapter.name}
                </span>
                {isFullyCompleted && <span className="completed-badge">✓</span>}
            </td>
            {materialNames.map((material) => (
                <td key={material} className="material-cell">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={!!completed[material]}
                            onChange={() => onToggleMaterial(chapter.serial, material)}
                        />
                        <span className="checkmark"></span>
                    </label>
                </td>
            ))}
            <td className="priority-cell">
                <PrioritySelector
                    priority={priority}
                    onChange={(p) => onSetPriority(chapter.serial, p)}
                />
            </td>
        </tr>
    );
}
