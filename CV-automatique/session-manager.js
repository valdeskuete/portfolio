/**
 * Session Security Manager for CV Generator
 * Ensures data isolation between users and secure cleanup
 */

const SessionManager = {
    sessionId: null,
    userId: null,
    isAuthenticated: false,

    /**
     * Initialize secure session
     */
    async init() {
        // Generate unique session ID on every page load (no persistence!)
        this.sessionId = this.generateSessionId();
        
        // Try to get authenticated user from Firebase
        if (window.auth) {
            try {
                const user = await new Promise((resolve) => {
                    const unsub = window.auth.onAuthStateChanged(resolve);
                    setTimeout(() => {
                        unsub();
                        resolve(null);
                    }, 2000);
                });

                if (user) {
                    this.userId = user.uid;
                    this.isAuthenticated = true;
                    console.log('✅ Authenticated user:', this.userId);
                } else {
                    // Anonymous session - generate temporary ID
                    try {
                        const anonUser = await window.signInAnonymously(window.auth);
                        this.userId = anonUser.user.uid;
                        this.isAuthenticated = true;
                        console.log('✅ Anonymous session:', this.userId);
                    } catch (err) {
                        console.warn('⚠️ Could not authenticate, using fallback:', err.message);
                        this.userId = null;
                    }
                }
            } catch (err) {
                console.warn('⚠️ Auth error:', err.message);
            }
        }

        // Check for passed CV ID in sessionStorage (from dashboard - one-time only!)
        const cvId = sessionStorage.getItem('currentCVId');
        if (cvId) {
            // Immediately clear it to prevent reuse
            sessionStorage.removeItem('currentCVId');
            sessionStorage.removeItem('currentUserId');
            return { cvId, userId: this.userId };
        }

        return { cvId: null, userId: this.userId };
    },

    /**
     * Generate unique session ID (never persisted to localStorage)
     */
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Verify data belongs to this session
     */
    verifyOwnership(data) {
        if (!data) return false;
        if (!this.isAuthenticated && !this.userId) return false;
        
        // If authenticated, verify user owns the data
        if (data.userId && data.userId !== this.userId) {
            console.warn('❌ Data ownership mismatch - potential security issue');
            return false;
        }
        
        return true;
    },

    /**
     * Clear all sensitive data on logout/page unload
     */
    cleanup() {
        // Never clear sessionStorage - it's temporary
        // But clear sensitive localStorage items
        const keysToPreserve = ['cv-theme']; // Only theme preference
        
        for (let key in localStorage) {
            if (!keysToPreserve.includes(key) && key.startsWith('cv-')) {
                localStorage.removeItem(key);
            }
        }
        
        console.log('✅ Session cleaned');
    },

    /**
     * Safe data storage (never without user ID)
     */
    saveLocalData(key, value) {
        if (!this.isAuthenticated || !this.userId) {
            console.warn('⚠️ Refusing to save without authentication');
            return;
        }

        // Wrap data with user ID and timestamp
        const safeData = {
            userId: this.userId,
            sessionId: this.sessionId,
            timestamp: Date.now(),
            data: value
        };

        localStorage.setItem(`cv-${this.userId}-${key}`, JSON.stringify(safeData));
    },

    /**
     * Safe data retrieval (verify ownership)
     */
    getLocalData(key) {
        if (!this.userId) return null;

        const stored = localStorage.getItem(`cv-${this.userId}-${key}`);
        if (!stored) return null;

        try {
            const wrapped = JSON.parse(stored);
            if (wrapped.userId === this.userId) {
                return wrapped.data;
            } else {
                console.warn('❌ Data ownership mismatch');
                return null;
            }
        } catch (err) {
            console.warn('⚠️ Could not parse stored data:', err);
            return null;
        }
    },

    /**
     * Prevent data leakage on browser close
     */
    onBeforeUnload() {
        // Clear any sensitive data
        if (window.cvData) {
            // Don't persist full CV data without explicit save
            sessionStorage.removeItem('cv-auto-save');
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    await SessionManager.init();
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    SessionManager.cleanup();
});

// Expose for use in app
window.SessionManager = SessionManager;
