/**
 * ========== CENTRALIZED ERROR HANDLER ==========
 * Unifies 5 disparate error handling approaches into single class
 * Replaces: window.logError, console.error, alert(), window.appErrors[], showNotification('error')
 * Date: 7 January 2026
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
        this.onErrorCallback = null;
        this.isDev = !window.location.hostname.includes('github.io');
    }

    /**
     * Log error with context, severity, and optional recovery action
     * @param {string} context - Function/module name (e.g., 'loadProjects')
     * @param {Error|string} error - Error object or message
     * @param {string} severity - 'critical' | 'error' | 'warning' | 'info'
     * @param {Function} recoveryAction - Optional callback to recover
     */
    log(context, error, severity = 'error', recoveryAction = null) {
        const errorObj = {
            timestamp: new Date().toISOString(),
            context,
            message: error.message || String(error),
            stack: error.stack || '',
            severity,
            recoveryAction: recoveryAction ? true : false
        };

        // Store in memory (max 50)
        this.errors.push(errorObj);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Console output (always in dev)
        if (this.isDev) {
            this._logToConsole(context, error, severity);
        }

        // Show user notification
        this._showUserNotification(errorObj);

        // Call registered callback
        if (this.onErrorCallback) {
            this.onErrorCallback(errorObj);
        }

        // Auto-recover if action provided
        if (recoveryAction && typeof recoveryAction === 'function') {
            this._executeRecovery(context, recoveryAction);
        }

        return errorObj;
    }

    /**
     * Console output with severity-based styling
     */
    _logToConsole(context, error, severity) {
        const colors = {
            critical: 'color: #ff1744; font-weight: bold; font-size: 1.1em;',
            error: 'color: #ff5252; font-weight: bold;',
            warning: 'color: #ffb300; font-weight: bold;',
            info: 'color: #1976d2; font-weight: normal;'
        };

        const icons = {
            critical: '🚨',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const style = colors[severity] || colors.error;
        const icon = icons[severity] || icons.error;

        console.error(
            `%c[${severity.toUpperCase()}] ${icon} ${context}`,
            style
        );
        console.error(`  Message:`, error.message || error);
        if (error.stack) {
            console.error(`  Stack:`, error.stack);
        }
    }

    /**
     * Show toast notification to user (integrates with NotificationSystem)
     */
    _showUserNotification(errorObj) {
        if (!window.NotificationSystem) return;

        // User-friendly message (no technical details)
        const userMessage = this._getUserFriendlyMessage(errorObj);
        
        // Show toast
        window.NotificationSystem.error(userMessage, 5000);
    }

    /**
     * Convert technical error to user-friendly message
     */
    _getUserFriendlyMessage(errorObj) {
        const { context, message, severity } = errorObj;

        // Map common Firebase errors
        const firebaseErrors = {
            'PERMISSION_DENIED': '🔒 Vous n\'avez pas les permissions pour cette action',
            'NOT_FOUND': '❌ Ressource non trouvée',
            'ALREADY_EXISTS': '⚠️ Cette ressource existe déjà',
            'INVALID_ARGUMENT': '❌ Paramètre invalide',
            'UNAUTHENTICATED': '🔐 Veuillez vous connecter',
            'RESOURCE_EXHAUSTED': '⚠️ Quota dépassé, réessayez plus tard'
        };

        // Check if Firebase error
        for (const [code, msg] of Object.entries(firebaseErrors)) {
            if (message.includes(code)) {
                return msg;
            }
        }

        // Generic fallback
        if (severity === 'critical') {
            return '❌ Une erreur critique s\'est produite. Veuillez rafraîchir la page.';
        }
        if (severity === 'error') {
            return `❌ Erreur dans ${context}. Veuillez réessayer.`;
        }
        return '⚠️ Une action n\'a pas pu être complétée.';
    }

    /**
     * Execute recovery action safely
     */
    _executeRecovery(context, recoveryAction) {
        try {
            if (this.isDev) {
                console.log(`🔄 [Recovery] Executing recovery for ${context}`);
            }
            recoveryAction();
        } catch (recoveryError) {
            if (this.isDev) {
                console.error(`❌ [Recovery Failed] ${context}:`, recoveryError);
            }
        }
    }

    /**
     * Shorthand: log critical error
     */
    critical(context, error, recoveryAction = null) {
        return this.log(context, error, 'critical', recoveryAction);
    }

    /**
     * Shorthand: log error
     */
    error(context, error, recoveryAction = null) {
        return this.log(context, error, 'error', recoveryAction);
    }

    /**
     * Shorthand: log warning
     */
    warning(context, error, recoveryAction = null) {
        return this.log(context, error, 'warning', recoveryAction);
    }

    /**
     * Shorthand: log info
     */
    info(context, message) {
        return this.log(context, new Error(message), 'info');
    }

    /**
     * Register callback to run on every error
     * @param {Function} callback - Called with errorObj
     */
    onError(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * Get all logged errors (for debugging)
     */
    getErrors() {
        return [...this.errors];
    }

    /**
     * Get errors filtered by context
     */
    getErrorsByContext(context) {
        return this.errors.filter(e => e.context === context);
    }

    /**
     * Get errors filtered by severity
     */
    getErrorsBySeverity(severity) {
        return this.errors.filter(e => e.severity === severity);
    }

    /**
     * Clear error history
     */
    clear() {
        this.errors = [];
    }

    /**
     * Get summary stats
     */
    getStats() {
        return {
            total: this.errors.length,
            critical: this.errors.filter(e => e.severity === 'critical').length,
            errors: this.errors.filter(e => e.severity === 'error').length,
            warnings: this.errors.filter(e => e.severity === 'warning').length,
            contexts: [...new Set(this.errors.map(e => e.context))]
        };
    }
}

// Initialize globally
window.ErrorHandler = new ErrorHandler();

// For backward compatibility with old code
window.logError = (context, error) => {
    window.ErrorHandler.error(context, error);
};

// Support old appErrors array
Object.defineProperty(window, 'appErrors', {
    get() {
        return window.ErrorHandler.getErrors();
    }
});

export default window.ErrorHandler;
