import { Subject } from '../types';

interface HeaderProps {
    currentView: 'dashboard' | Subject;
    onNavigate: (view: 'dashboard' | Subject) => void;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
}

export function Header({ currentView, onNavigate, theme, onThemeToggle }: HeaderProps) {
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
                    <span className="logo-icon">🎯</span>
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

                <button
                    className="theme-toggle"
                    onClick={onThemeToggle}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
        </header>
    );
}
