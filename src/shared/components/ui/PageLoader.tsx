import { Atom } from 'lucide-react';

export function PageLoader() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '50vh',
            gap: '1rem',
            color: 'var(--text-secondary)'
        }}>
            <div className="loader-spinner">
                <Atom size={48} className="spin-icon" style={{ color: 'var(--accent)' }} />
            </div>
            <p>Loading...</p>
            <style>{`
                .spin-icon {
                    animation: spin 2s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
