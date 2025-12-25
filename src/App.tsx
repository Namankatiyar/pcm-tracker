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
            />
            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
}

export default App;
