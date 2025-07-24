/**
 * React Error Boundary and Error UI Components
 * Provides user-friendly error displays and recovery options
 */

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error logger
    if (window.errorLogger) {
      window.errorLogger.log(error, window.ErrorTypes.UNKNOWN, window.ErrorSeverity.HIGH, {
        componentStack: errorInfo.componentStack,
        props: this.props
      });
    }

    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });

    // Create automatic backup when error occurs
    if (window.RecoveryUtils) {
      window.RecoveryUtils.createBackup();
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p className="error-message">
              We encountered an unexpected error. Your data is safe and has been automatically backed up.
            </p>
            
            {this.state.errorCount > 2 && (
              <div className="error-warning">
                <p>This error has occurred multiple times. Consider clearing your browser cache or contacting support.</p>
              </div>
            )}

            <div className="error-details">
              <details>
                <summary>Error Details (for developers)</summary>
                <pre className="error-stack">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            </div>

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn btn-primary">
                Try Again
              </button>
              <button onClick={this.handleReload} className="btn btn-secondary">
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Message Component
const ErrorMessage = ({ error, onDismiss, onRetry }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!error) return null;

  const getErrorIcon = () => {
    switch (error.type) {
      case window.ErrorTypes?.VALIDATION:
        return '📝';
      case window.ErrorTypes?.STORAGE:
        return '💾';
      case window.ErrorTypes?.NETWORK:
        return '🌐';
      case window.ErrorTypes?.DATA_CORRUPTION:
        return '🔧';
      default:
        return '⚠️';
    }
  };

  const getErrorClass = () => {
    switch (error.type) {
      case window.ErrorTypes?.VALIDATION:
        return 'error-message-warning';
      case window.ErrorTypes?.STORAGE:
      case window.ErrorTypes?.DATA_CORRUPTION:
        return 'error-message-danger';
      default:
        return 'error-message-error';
    }
  };

  return (
    <div className={`error-message-container ${getErrorClass()}`}>
      <div className="error-message-header">
        <span className="error-message-icon">{getErrorIcon()}</span>
        <span className="error-message-text">{error.userMessage || error.message}</span>
        <div className="error-message-actions">
          {error.recovery && (
            <button 
              onClick={() => error.recovery().then(onRetry)} 
              className="btn-small btn-retry"
              title="Attempt recovery"
            >
              🔄
            </button>
          )}
          {error.errorId && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="btn-small btn-expand"
              title="Show details"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          )}
          {onDismiss && (
            <button 
              onClick={onDismiss} 
              className="btn-small btn-dismiss"
              title="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {isExpanded && error.errorId && (
        <div className="error-message-details">
          <p>Error ID: {error.errorId}</p>
          <p>Time: {new Date().toLocaleString()}</p>
          {error.context && (
            <pre>{JSON.stringify(error.context, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
};

// Field Error Component
const FieldError = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="field-error">
      {errors.map((error, index) => (
        <p key={index} className="field-error-message">
          {error}
        </p>
      ))}
    </div>
  );
};

// Recovery Modal Component
const RecoveryModal = ({ isOpen, onClose, onRecover }) => {
  const [backups, setBackups] = React.useState([]);
  const [selectedBackup, setSelectedBackup] = React.useState(null);
  const [isRecovering, setIsRecovering] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && window.RecoveryUtils) {
      setBackups(window.RecoveryUtils.listBackups());
    }
  }, [isOpen]);

  const handleRecover = async () => {
    if (!selectedBackup) return;

    setIsRecovering(true);
    try {
      const result = await window.RecoveryUtils.restoreFromBackup(selectedBackup.key);
      if (result.success) {
        onRecover();
      } else {
        alert('Recovery failed: ' + result.error);
      }
    } catch (e) {
      alert('Recovery failed: ' + e.message);
    } finally {
      setIsRecovering(false);
    }
  };

  const handleAutoRecover = async () => {
    setIsRecovering(true);
    try {
      const result = await window.RecoveryUtils.recoverCorruptedData();
      if (result.recovered) {
        onRecover(result);
      } else {
        alert('Automatic recovery failed. Please try manual backup restore.');
      }
    } catch (e) {
      alert('Recovery failed: ' + e.message);
    } finally {
      setIsRecovering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content recovery-modal" onClick={e => e.stopPropagation()}>
        <h2>Data Recovery Options</h2>
        
        <div className="recovery-options">
          <div className="recovery-option">
            <h3>🔄 Automatic Recovery</h3>
            <p>Attempt to recover corrupted data automatically</p>
            <button 
              onClick={handleAutoRecover} 
              disabled={isRecovering}
              className="btn btn-primary"
            >
              {isRecovering ? 'Recovering...' : 'Auto Recover'}
            </button>
          </div>

          <div className="recovery-option">
            <h3>💾 Restore from Backup</h3>
            {backups.length > 0 ? (
              <>
                <p>Select a backup to restore:</p>
                <div className="backup-list">
                  {backups.map(backup => (
                    <label key={backup.key} className="backup-item">
                      <input
                        type="radio"
                        name="backup"
                        checked={selectedBackup?.key === backup.key}
                        onChange={() => setSelectedBackup(backup)}
                      />
                      <span>
                        {new Date(backup.timestamp).toLocaleString()} 
                        ({(backup.size / 1024).toFixed(1)} KB)
                      </span>
                    </label>
                  ))}
                </div>
                <button 
                  onClick={handleRecover} 
                  disabled={!selectedBackup || isRecovering}
                  className="btn btn-primary"
                >
                  Restore Selected
                </button>
              </>
            ) : (
              <p className="no-backups">No backups available</p>
            )}
          </div>

          <div className="recovery-option">
            <h3>📥 Import Data</h3>
            <p>Import data from a previously exported file</p>
            <input 
              type="file" 
              accept=".json"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const result = window.ExpenseStorage.importData(event.target.result);
                      if (result.success) {
                        onRecover();
                      } else {
                        alert('Import failed: ' + result.error);
                      }
                    } catch (err) {
                      alert('Import failed: ' + err.message);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
              className="file-input"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Error Log Viewer Component
const ErrorLogViewer = ({ isOpen, onClose }) => {
  const [errors, setErrors] = React.useState([]);
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => {
    if (isOpen && window.errorLogger) {
      const filterOptions = filter === 'all' ? {} : { severity: filter };
      setErrors(window.errorLogger.getErrors(filterOptions));
    }
  }, [isOpen, filter]);

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all error logs?')) {
      window.errorLogger.clearErrors();
      setErrors([]);
    }
  };

  const handleExportLogs = () => {
    const dataStr = window.errorLogger.exportErrors();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content error-log-modal" onClick={e => e.stopPropagation()}>
        <h2>Error Log</h2>
        
        <div className="error-log-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Errors</option>
            <option value="low">Low Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="high">High Severity</option>
            <option value="critical">Critical</option>
          </select>
          
          <div className="error-log-actions">
            <button onClick={handleExportLogs} className="btn btn-small">
              Export
            </button>
            <button onClick={handleClearLogs} className="btn btn-small btn-danger">
              Clear All
            </button>
          </div>
        </div>

        <div className="error-log-list">
          {errors.length === 0 ? (
            <p className="no-errors">No errors logged</p>
          ) : (
            errors.map(error => (
              <div key={error.id} className={`error-log-item severity-${error.severity}`}>
                <div className="error-log-header">
                  <span className="error-type">{error.type}</span>
                  <span className="error-time">
                    {new Date(error.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="error-log-message">{error.message}</p>
                {error.context && Object.keys(error.context).length > 0 && (
                  <details>
                    <summary>Context</summary>
                    <pre>{JSON.stringify(error.context, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Export components
window.ErrorBoundary = ErrorBoundary;
window.ErrorMessage = ErrorMessage;
window.FieldError = FieldError;
window.RecoveryModal = RecoveryModal;
window.ErrorLogViewer = ErrorLogViewer;