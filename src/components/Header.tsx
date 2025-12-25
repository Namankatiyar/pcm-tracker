import { useState } from 'react';
import { Subject } from '../types';

interface HeaderProps {
    currentView: 'dashboard' | Subject;
    onNavigate: (view: 'dashboard' | Subject) => void;
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

    const navItems: { key: 'dashboard' | Subject; label: string; icon: string }[] = [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'physics', label: 'Physics', icon: '⚛️' },
        { key: 'chemistry', label: 'Chemistry', icon: '🧪' },
        { key: 'maths', label: 'Maths', icon: '📐' },
    ];

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <span className="logo-text">JEE Tracker</span>
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
                            <div className="current-color-indicator" style={{ backgroundColor: accentColor }}></div>
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
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </div>
        </header>
    );
}
