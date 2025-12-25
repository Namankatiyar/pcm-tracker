import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SubjectPage } from './components/SubjectPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProgress } from './hooks/useProgress';
import { parseSubjectCSV } from './utils/csvParser';
import { AppProgress, Subject, SubjectData, Priority } from './types';

type View = 'dashboard' | Subject;

const initialProgress: AppProgress = {
    physics: {},
    chemistry: {},
    maths: {},
};

function App() {
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('jee-tracker-theme', 'dark');
    const [currentView, setCurrentView] = useLocalStorage<View>('jee-tracker-view', 'dashboard');
    const [progress, setProgress] = useLocalStorage<AppProgress>('jee-tracker-progress', initialProgress);
    const [accentColor, setAccentColor] = useLocalStorage<string>('jee-tracker-accent', '#6366f1');

    const [subjectData, setSubjectData] = useState<Record<Subject, SubjectData | null>>({
        physics: null,
        chemistry: null,
        maths: null,
    });

    // Load CSV data
    useEffect(() => {
        const loadSubjectData = async (subject: Subject) => {
            try {
                const data = await parseSubjectCSV(subject);
                setSubjectData(prev => ({ ...prev, [subject]: data }));
            } catch (error) {
                console.error(`Failed to load ${subject} data:`, error);
            }
        };

        loadSubjectData('physics');
        loadSubjectData('chemistry');
        loadSubjectData('maths');
    }, []);

    // Apply theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Apply accent color
    useEffect(() => {
        document.documentElement.style.setProperty('--accent', accentColor);
        // Simple approximation for light variant: use the color with opacity
        // We can't easily convert hex to rgba here without a helper, but we can use color-mix if supported 
        // or just rely on opacity in CSS if it was using variables.
        // Current CSS uses rgba(99, 102, 241, 0.1).
        // Let's try to set --accent-light using color-mix which is widely supported now
        document.documentElement.style.setProperty('--accent-light', `color-mix(in srgb, ${accentColor}, transparent 90%)`);
        document.documentElement.style.setProperty('--accent-hover', `color-mix(in srgb, ${accentColor}, black 10%)`);
    }, [accentColor]);

    const { physicsProgress, chemistryProgress, mathsProgress, overallProgress, calculateSubjectProgress } = useProgress(progress, subjectData);

    const handleToggleMaterial = useCallback((subject: Subject, chapterSerial: number, material: string) => {
        setProgress(prev => {
            const subjectProgress = prev[subject];
            const chapterProgress = subjectProgress[chapterSerial] || { completed: {}, priority: 'none' as Priority };

            return {
                ...prev,
                [subject]: {
                    ...subjectProgress,
                    [chapterSerial]: {
                        ...chapterProgress,
                        completed: {
                            ...chapterProgress.completed,
                            [material]: !chapterProgress.completed[material],
                        },
                    },
                },
            };
        });
    }, [setProgress]);

    const handleSetPriority = useCallback((subject: Subject, chapterSerial: number, priority: Priority) => {
        setProgress(prev => {
            const subjectProgress = prev[subject];
            const chapterProgress = subjectProgress[chapterSerial] || { completed: {}, priority: 'none' as Priority };

            return {
                ...prev,
                [subject]: {
                    ...subjectProgress,
                    [chapterSerial]: {
                        ...chapterProgress,
                        priority,
                    },
                },
            };
        });
    }, [setProgress]);

    const handleThemeToggle = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const renderContent = () => {
        if (currentView === 'dashboard') {
            return (
                <Dashboard
                    physicsProgress={physicsProgress}
                    chemistryProgress={chemistryProgress}
                    mathsProgress={mathsProgress}
                    overallProgress={overallProgress}
                    subjectData={subjectData}
                    onNavigate={setCurrentView}
                />
            );
        }

        const subject = currentView as Subject;
        return (
            <SubjectPage
                subject={subject}
                data={subjectData[subject]}
                progress={progress[subject]}
                subjectProgress={calculateSubjectProgress(subject)}
                onToggleMaterial={(serial, material) => handleToggleMaterial(subject, serial, material)}
                onSetPriority={(serial, priority) => handleSetPriority(subject, serial, priority)}
            />
        );
    };

    return (
        <div className="app">
            <Header
                currentView={currentView}
                onNavigate={setCurrentView}
                theme={theme}
                onThemeToggle={handleThemeToggle}
                accentColor={accentColor}
                onAccentChange={setAccentColor}
            />
            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
}

export default App;
