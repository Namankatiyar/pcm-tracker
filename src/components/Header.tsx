import { useState } from 'react';
import { Subject } from '../types';
import { LayoutDashboard, Atom, FlaskConical, Calculator, Sun, Moon, Palette, Settings, Calendar } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
    currentView: 'dashboard' | 'planner' | Subject;
    onNavigate: (view: 'dashboard' | 'planner' | Subject) => void;
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
    { name: 'Sky', value: '#0ea5e9' },
];

export function Header({ currentView, onNavigate, theme, onThemeToggle, accentColor, onAccentChange }: HeaderProps) {
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const navItems: { key: 'dashboard' | 'planner' | Subject; label: string; icon: React.ReactNode }[] = [
        { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { key: 'physics', label: 'Physics', icon: <Atom size={20} /> },
        { key: 'chemistry', label: 'Chemistry', icon: <FlaskConical size={20} /> },
        { key: 'maths', label: 'Maths', icon: <Calculator size={20} /> },
        { key: 'planner', label: 'Planner', icon: <Calendar size={20} /> },
    ];

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
                    <div className="color-picker-container">
                        <button 
                            className="color-picker-toggle"
                            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                            aria-label="Change accent color"
                            title="Change accent color"
                        >
                            <div className="current-color-indicator" style={{ backgroundColor: accentColor }}>
                                <Palette size={20} color="white" style={{ opacity: 0.8 }} />
                            </div>
                        </button>

                        {isColorPickerOpen && (
                            <>
                                <div className="color-picker-backdrop" onClick={() => setIsColorPickerOpen(false)}></div>
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
                                    </div>
                                </div>
                            </>
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
        </header>
    );
}

