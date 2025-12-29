export type Priority = 'high' | 'medium' | 'low' | 'none';

export type Subject = 'physics' | 'chemistry' | 'maths';

export interface Chapter {
    serial: number;
    name: string;
    materials: string[];
}

export interface ChapterProgress {
    completed: Record<string, boolean>;
    priority: Priority;
}

export interface SubjectProgress {
    [chapterSerial: number]: ChapterProgress;
}

export interface AppProgress {
    physics: SubjectProgress;
    chemistry: SubjectProgress;
    maths: SubjectProgress;
}

export interface SubjectData {
    chapters: Chapter[];
    materialNames: string[];
}

export interface PlannerTask {
    id: string;
    title: string;
    subtitle?: string; // Material name for chapter tasks
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    completed: boolean;
    type: 'chapter' | 'custom';
    subject?: Subject;
    chapterSerial?: number;
    material?: string;
}
