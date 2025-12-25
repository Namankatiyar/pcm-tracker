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
