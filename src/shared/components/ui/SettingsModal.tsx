import { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Download, Upload, X, AlertTriangle, Check } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STORAGE_KEYS = {
    theme: 'jee-tracker-theme',
    view: 'jee-tracker-view',
    progress: 'jee-tracker-progress',
    accent: 'jee-tracker-accent',
    customColumns: 'jee-tracker-custom-columns',
    excludedColumns: 'jee-tracker-excluded-columns',
    examDate: 'jee-exam-date',
    plannerTasks: 'jee-tracker-planner-tasks' // Added for backup
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    const modalRoot = document.getElementById('modal-root');

    if (!isOpen || !modalRoot) return null;

    const handleExport = () => {
        try {
            const dataToExport: Record<string, any> = {};
            for (const key of Object.values(STORAGE_KEYS)) {
                const item = localStorage.getItem(key);
                if (item) {
                    try {
                        dataToExport[key] = JSON.parse(item);
                    } catch {
                        dataToExport[key] = item; // Store as raw string if not JSON
                    }
                }
            }
            
            const backupData = {
                version: 1,
                timestamp: new Date().toISOString(),
                export: dataToExport
            };

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pcm-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            setImportStatus('error');
            setStatusMessage('Failed to export data.');
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                
                if (!json.export || !json.version) {
                    throw new Error('Invalid backup file format');
                }

                for (const key in json.export) {
                    if (Object.values(STORAGE_KEYS).includes(key)) {
                        const value = json.export[key];
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    }
                }

                setImportStatus('success');
                setStatusMessage('Data imported successfully! Reloading...');
                
                setTimeout(() => {
                    window.location.reload();
                }, 1500);

            } catch (error) {
                console.error('Import failed:', error);
                setImportStatus('error');
                setStatusMessage('Failed to import data. Invalid file.');
            }
        };
        reader.readAsText(file);
    };

    const modalContent = (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Data Management</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="settings-section">
                        <div className="section-info">
                            <h3>Export Data</h3>
                            <p>Download a backup of your progress, settings, and custom columns. Keep this file safe!</p>
                        </div>
                        <button className="action-btn primary" onClick={handleExport}>
                            <Download size={18} />
                            Export Backup
                        </button>
                    </div>

                    <div className="settings-section">
                        <div className="section-info">
                            <h3>Import Data</h3>
                            <p>Restore your progress from a backup file. <br/><strong>Warning: This will overwrite your current data.</strong></p>
                        </div>
                        <div className="import-actions">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleImport}
                                accept=".json"
                                style={{ display: 'none' }}
                            />
                            <button className="action-btn outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload size={18} />
                                Import Backup
                            </button>
                        </div>
                    </div>

                    {importStatus !== 'idle' && (
                        <div className={`status-message ${importStatus}`}>
                            {importStatus === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                            <span>{statusMessage}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
    
    return ReactDOM.createPortal(modalContent, modalRoot);
}