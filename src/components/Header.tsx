import { useState, useRef, useEffect } from 'react';
import { Subject } from '../types';
import { LayoutDashboard, Atom, FlaskConical, Calculator, Sun, Moon, Palette, Settings, Calendar, Clock } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { ColorPickerModal } from './ColorPickerModal';

interface HeaderProps {
    currentView: 'dashboard' | 'planner' | 'studyclock' | Subject;
    onNavigate: (view: 'dashboard' | 'planner' | 'studyclock' | Subject) => void;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
    accentColor: string;
    onAccentChange: (color: string) => void;
}

const ACCENT_COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Fuchsia', value: '#d946ef' },
];

export function Header({ currentView, onNavigate, theme, onThemeToggle, accentColor, onAccentChange }: HeaderProps) {
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCustomColorModalOpen, setIsCustomColorModalOpen] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setIsColorPickerOpen(false);
            }
        };

        if (isColorPickerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isColorPickerOpen]);

    const navItems: { key: 'dashboard' | 'planner' | 'studyclock' | Subject; label: string; icon: React.ReactNode }[] = [
        { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { key: 'physics', label: 'Physics', icon: <Atom size={20} /> },
        { key: 'chemistry', label: 'Chemistry', icon: <FlaskConical size={20} /> },
        { key: 'maths', label: 'Maths', icon: <Calculator size={20} /> },
        { key: 'planner', label: 'Planner', icon: <Calendar size={20} /> },
        { key: 'studyclock', label: 'Study Clock', icon: <Clock size={20} /> },
    ];

    const isCustomColor = !ACCENT_COLORS.some(c => c.value === accentColor);

    const handleCustomColorConfirm = (color: string) => {
        onAccentChange(color);
        setIsCustomColorModalOpen(false);
        setIsColorPickerOpen(false);
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <span className="logo-text">PCM Tracker</span>
                </div>

                <nav className="nav">
                    {navItems.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            className={`nav-item ${currentView === key ? 'active' : ''}`}
                            onClick={() => onNavigate(key)}
                        >
                            <span className="nav-icon">{icon}</span>
                            <span className="nav-label">{label}</span>
                        </button>
                    ))}
                </nav>

                <div className="header-actions">
                    <div className="color-picker-container" ref={colorPickerRef}>
                        <button
                            className="color-picker-toggle"
                            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                            aria-label="Change accent color"
                            title="Change accent color"
                        >
                            <div className="current-color-indicator" style={{ backgroundColor: accentColor }}>
                                <Palette size={20} color="var(--accent-text)" style={{ opacity: 0.8 }} />
                            </div>
                        </button>

                        {isColorPickerOpen && (
                            <div className="color-picker-popup">
                                <div className="color-grid">
                                    {ACCENT_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            className={`color-option ${accentColor === color.value ? 'selected' : ''}`}
                                            style={{ backgroundColor: color.value }}
                                            onClick={() => {
                                                onAccentChange(color.value);
                                                setIsColorPickerOpen(false);
                                            }}
                                            title={color.name}
                                            aria-label={`Select ${color.name}`}
                                        />
                                    ))}
                                    {/* Custom color picker button */}
                                    <button
                                        className={`color-option custom-color-option ${isCustomColor ? 'selected' : ''}`}
                                        style={{
                                            background: isCustomColor ? accentColor : 'var(--bg-tertiary)',
                                            border: isCustomColor ? '2px solid var(--text-primary)' : '2px dashed var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onClick={() => {
                                            setIsCustomColorModalOpen(true);
                                            setIsColorPickerOpen(false);
                                        }}
                                        title="Custom Color"
                                        aria-label="Pick a custom color"
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke={isCustomColor ? 'var(--accent-text)' : 'var(--text-muted)'}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className="theme-toggle"
                        onClick={onThemeToggle}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        style={{ color: theme === 'dark' ? accentColor : '#000000' }}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <button
                        className="theme-toggle"
                        onClick={() => setIsSettingsOpen(true)}
                        aria-label="Open settings"
                        title="Settings & Data Backup"
                        style={{ color: theme === 'dark' ? accentColor : '#000000' }}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <ColorPickerModal
                isOpen={isCustomColorModalOpen}
                currentColor={accentColor}
                onConfirm={handleCustomColorConfirm}
                onClose={() => setIsCustomColorModalOpen(false)}
            />
        </header>
    );
}

