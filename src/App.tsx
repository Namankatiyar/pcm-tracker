import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SubjectPage } from './components/SubjectPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProgress } from './hooks/useProgress';
import { parseSubjectCSV } from './utils/csvParser';
import { AppProgress, Subject, SubjectData, Priority } from './types';
import quotes from './quotes.json';

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
    const [customColumns, setCustomColumns] = useLocalStorage<Record<Subject, string[]>>('jee-tracker-custom-columns', {
        physics: [],
        chemistry: [],
        maths: []
    });
    const [excludedColumns, setExcludedColumns] = useLocalStorage<Record<Subject, string[]>>('jee-tracker-excluded-columns', {
        physics: [],
        chemistry: [],
        maths: []
    });

    const [subjectData, setSubjectData] = useState<Record<Subject, SubjectData | null>>({
        physics: null,
        chemistry: null,
        maths: null,
    });
    
    const [dailyQuote, setDailyQuote] = useState<{ quote: string; author: string } | null>(null);

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

    // Load Quote Once per Session/Load
    useEffect(() => {
        const storedIndex = localStorage.getItem('jee-tracker-quote-index');
        let index = storedIndex ? parseInt(storedIndex, 10) : 0;

        if (isNaN(index) || index >= quotes.length) {
            index = 0;
        }

        setDailyQuote(quotes[index]);

        const nextIndex = (index + 1) % quotes.length;
        localStorage.setItem('jee-tracker-quote-index', nextIndex.toString());
    }, []);

    // Apply theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Apply accent color
    useEffect(() => {
        document.documentElement.style.setProperty('--accent', accentColor);
        document.documentElement.style.setProperty('--accent-light', `color-mix(in srgb, ${accentColor}, transparent 90%)`);
        document.documentElement.style.setProperty('--accent-hover', `color-mix(in srgb, ${accentColor}, black 10%)`);
        
        // Update PWA theme color
        const metaThemeColor = document.querySelector("meta[name=theme-color]");
        if (metaThemeColor) {
            metaThemeColor.setAttribute("content", accentColor);
        }
    }, [accentColor]);

    // Merge CSV data with custom columns and filter excluded ones
    const mergedSubjectData = useMemo(() => {
        const merged: Record<Subject, SubjectData | null> = { physics: null, chemistry: null, maths: null };
        (['physics', 'chemistry', 'maths'] as Subject[]).forEach(subject => {
            const data = subjectData[subject];
            if (!data) return;
            
            const custom = customColumns[subject] || [];
            const excluded = excludedColumns[subject] || [];
            
            // Prevent duplicates and filter excluded
            const uniqueCustom = custom.filter(c => !data.materialNames.includes(c));
            const allMaterials = [...data.materialNames, ...uniqueCustom].filter(m => !excluded.includes(m));
            
            merged[subject] = {
                ...data,
                materialNames: allMaterials,
                chapters: data.chapters.map(c => ({
                    ...c,
                    materials: allMaterials
                }))
            };
        });
        return merged;
    }, [subjectData, customColumns, excludedColumns]);

    const { physicsProgress, chemistryProgress, mathsProgress, overallProgress, calculateSubjectProgress } = useProgress(progress, mergedSubjectData);

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

    const handleAddColumn = useCallback((subject: Subject, columnName: string) => {
        if (!columnName.trim()) return;
        // If it was excluded previously, remove from excluded list
        if (excludedColumns[subject]?.includes(columnName.trim())) {
             setExcludedColumns(prev => ({
                ...prev,
                [subject]: prev[subject].filter(c => c !== columnName.trim())
            }));
            return;
        }

        setCustomColumns(prev => ({
            ...prev,
            [subject]: [...(prev[subject] || []), columnName.trim()]
        }));
    }, [excludedColumns, setExcludedColumns, setCustomColumns]);

    const handleRemoveColumn = useCallback((subject: Subject, columnName: string) => {
        const isCustom = customColumns[subject]?.includes(columnName);
        
        if (isCustom) {
            setCustomColumns(prev => ({
                ...prev,
                [subject]: prev[subject].filter(c => c !== columnName)
            }));
        } else {
            setExcludedColumns(prev => ({
                ...prev,
                [subject]: [...(prev[subject] || []), columnName]
            }));
        }
    }, [customColumns, setCustomColumns, setExcludedColumns]);

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
                    subjectData={mergedSubjectData}
                    onNavigate={setCurrentView}
                    quote={dailyQuote}
                />
            );
        }

        const subject = currentView as Subject;
        return (
            <SubjectPage
                subject={subject}
                data={mergedSubjectData[subject]}
                progress={progress[subject]}
                subjectProgress={calculateSubjectProgress(subject)}
                onToggleMaterial={(serial, material) => handleToggleMaterial(subject, serial, material)}
                onSetPriority={(serial, priority) => handleSetPriority(subject, serial, priority)}
                onAddMaterial={(name) => handleAddColumn(subject, name)}
                onRemoveMaterial={(name) => handleRemoveColumn(subject, name)}
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
