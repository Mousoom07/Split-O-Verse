import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { storage } from '../utils/storage';
import { FiSettings, FiDownload, FiUpload, FiTrash2, FiCheck } from 'react-icons/fi';
import './Settings.css';

export default function Settings() {
  const { groups, expenses, showToast } = useApp();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleExport = () => {
    try {
      const data = storage.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `split-O-Verse-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Data exported successfully!', 'success');
    } catch {
      showToast('Failed to export data', 'error');
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        storage.importData(data);
        showToast('Data imported! Refresh page to see changes.', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        showToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    storage.clearAll();
    showToast('All data cleared! Refreshing...', 'info');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="settings-page animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">
          <FiSettings style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
          Settings
        </h1>
        <p className="page-subtitle">Manage your app data and preferences</p>
      </div>

      {/* Data Summary */}
      <div className="glass-card settings-section">
        <h2 className="settings-section-title">📊 Data Summary</h2>
        <div className="data-summary-grid">
          <div className="data-summary-item">
            <span className="data-summary-value">{groups.length}</span>
            <span className="data-summary-label">Groups</span>
          </div>
          <div className="data-summary-item">
            <span className="data-summary-value">{expenses.length}</span>
            <span className="data-summary-label">Expenses</span>
          </div>
          <div className="data-summary-item">
            <span className="data-summary-value">
              {new Set(groups.flatMap(g => g.members)).size}
            </span>
            <span className="data-summary-label">Members</span>
          </div>
          <div className="data-summary-item">
            <span className="data-summary-value">
              ₹{expenses.reduce((s, e) => s + parseFloat(e.amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
            <span className="data-summary-label">Total Tracked</span>
          </div>
        </div>
      </div>

      {/* Export / Import */}
      <div className="glass-card settings-section">
        <h2 className="settings-section-title">💾 Backup & Restore</h2>
        <p className="settings-section-desc">
          Export your data as a JSON file for backup, or import a previously exported file.
        </p>
        <div className="settings-actions">
          <button className="btn btn-primary" onClick={handleExport}>
            <FiDownload /> Export Data
          </button>
          <label className="btn btn-secondary import-btn">
            <FiUpload /> Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card settings-section settings-danger">
        <h2 className="settings-section-title">⚠️ Danger Zone</h2>
        <p className="settings-section-desc">
          Clear all data from the application. This action cannot be undone.
        </p>
        {!showConfirmClear ? (
          <button
            className="btn btn-danger"
            onClick={() => setShowConfirmClear(true)}
          >
            <FiTrash2 /> Clear All Data
          </button>
        ) : (
          <div className="confirm-clear">
            <p className="confirm-text">
              Are you sure? This will delete <strong>{groups.length} groups</strong> and{' '}
              <strong>{expenses.length} expenses</strong>.
            </p>
            <div className="confirm-actions">
              <button className="btn btn-danger" onClick={handleClearAll}>
                <FiCheck /> Yes, Delete Everything
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmClear(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="glass-card settings-section">
        <h2 className="settings-section-title">ℹ️ About</h2>
        <div className="about-info">
          <div className="about-row">
            <span className="about-label">App Name</span>
            <span className="about-value">Split-O-Verse - Smart Expense Splitter</span>
          </div>
          <div className="about-row">
            <span className="about-label">Version</span>
            <span className="about-value">1.0.0</span>
          </div>
          <div className="about-row">
            <span className="about-label">Built With</span>
            <span className="about-value">React + Vite + Chart.js</span>
          </div>
          <div className="about-row">
            <span className="about-label">AI Features</span>
            <span className="about-value">Smart Categorization, Spending Insights</span>
          </div>
          <div className="about-row">
            <span className="about-label">Storage</span>
            <span className="about-value">LocalStorage (Browser)</span>
          </div>
          <div className="about-row">
            <span className="about-label">Developer</span>
            <span className="about-value">Mousoom Samanta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
