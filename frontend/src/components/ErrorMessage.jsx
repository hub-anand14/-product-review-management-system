import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Reusable ErrorMessage component for displaying friendly error notices and retry actions.
 * 
 * @param {Object} props
 * @param {string} [props.title] - Optional friendly error heading
 * @param {string} props.message - The user-friendly error message description
 * @param {Function} [props.onRetry] - Callback invoked when clicking the retry button
 * @param {boolean} [props.isRetrying=false] - Whether a retry operation is currently in flight
 * @param {React.ReactNode} [props.action] - Optional additional action (e.g. Back button or link)
 * @param {boolean} [props.compact=false] - Whether to display in a compact inline banner format
 * @param {string} [props.className=""] - Optional extra CSS class names
 */
function ErrorMessage({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  isRetrying = false,
  action,
  compact = false,
  className = '',
}) {
  if (compact) {
    return (
      <div className={`error-banner ${className}`} role="alert" aria-live="assertive">
        <div className="error-banner-content">
          <AlertCircle size={18} className="error-banner-icon" />
          <span className="error-banner-text">{message}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="btn-retry-inline"
            aria-label="Retry operation"
          >
            <RefreshCw size={14} className={isRetrying ? 'spin' : ''} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`error-state ${className}`} role="alert" aria-live="assertive">
      <div className="error-icon-wrapper">
        <AlertCircle size={40} className="error-icon" />
      </div>
      <h3 className="error-title">{title}</h3>
      <p className="error-text">{message}</p>

      {(onRetry || action) && (
        <div className="error-actions">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="btn-primary btn-retry"
              aria-label="Retry loading"
            >
              <RefreshCw size={16} className={isRetrying ? 'spin' : ''} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}

export default ErrorMessage;
