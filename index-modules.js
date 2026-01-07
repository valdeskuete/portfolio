/**
 * ========== ES6 MODULE INDEX ==========
 * Centralizes all ES6 module imports and exports
 * Consolidates mixed ES6 + global approach into unified module system
 * Date: 7 January 2026
 * 
 * Usage: import * as AppModules from './index-modules.js'
 */

// Core utilities
import ErrorHandler from './error-handler.js';
import FormHandler from './form-handler.js';
import FirestoreListener from './firestore-listener.js';
import AppNamespace from './app-namespace.js';

// Utils that should become modules
// import { NotificationSystem } from './notifications.js';  // TODO: refactor as ES6 module
// import { ConfirmDialog } from './notifications.js';        // TODO: refactor as ES6 module
// import { AdminAuth } from './admin-auth.js';               // TODO: refactor as ES6 module

// Reexport core modules
export {
    ErrorHandler,
    FormHandler,
    FirestoreListener,
    AppNamespace
};

// Default export with all modules
export default {
    ErrorHandler,
    FormHandler,
    FirestoreListener,
    AppNamespace,
    
    // ============ HELPERS ============
    
    /**
     * Initialize all core modules
     */
    async initCore(db, auth, firebaseFunctions) {
        try {
            // Initialize app namespace with Firebase
            AppNamespace.init(db, auth, firebaseFunctions);
            
            // Set up global error listener
            ErrorHandler.onError((errorObj) => {
                // Optional: log to backend for monitoring
                console.log('[ErrorHandler]', errorObj);
            });
            
            window.ErrorHandler?.info('modules.initCore', 'All core modules initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize core modules:', error);
            return false;
        }
    },

    /**
     * Initialize all forms
     */
    initForms(formConfigs = {}) {
        try {
            for (const [formId, config] of Object.entries(formConfigs)) {
                FormHandler.register(
                    formId,
                    config.validator,
                    config.onSubmit
                );
            }
            window.ErrorHandler?.info('modules.initForms', `Registered ${Object.keys(formConfigs).length} forms`);
            return true;
        } catch (error) {
            window.ErrorHandler?.error('modules.initForms', error);
            return false;
        }
    },

    /**
     * Initialize all listeners
     */
    initListeners(listenerConfigs = []) {
        try {
            const results = FirestoreListener.listenMultiple(listenerConfigs);
            const succeeded = results.filter(r => r.success).length;
            window.ErrorHandler?.info('modules.initListeners', `Started ${succeeded}/${results.length} listeners`);
            return results;
        } catch (error) {
            window.ErrorHandler?.error('modules.initListeners', error);
            return [];
        }
    },

    /**
     * Cleanup all resources
     */
    cleanup() {
        try {
            FirestoreListener.stopAll();
            AppNamespace.reset();
            window.ErrorHandler?.info('modules.cleanup', 'All resources cleaned up');
            return true;
        } catch (error) {
            window.ErrorHandler?.error('modules.cleanup', error);
            return false;
        }
    },

    /**
     * Get app state
     */
    getState() {
        return {
            app: AppNamespace.getState(),
            handlers: {
                forms: FormHandler.getRegisteredForms(),
                listeners: FirestoreListener.getStats()
            }
        };
    }
};
