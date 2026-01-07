/**
 * ========== CENTRALIZED APP NAMESPACE ==========
 * Consolidates 25+ window.* globals into single window.App object
 * Replaces: window.isAdmin, window.logError, window.appErrors, window.loadProjects, etc.
 * Single source of truth for all global state
 * Date: 7 January 2026
 */

window.App = {
    // ============ STATE ============
    auth: {
        isAdmin: false,
        currentUser: null,
        userEmail: null,
        userId: null
    },

    // ============ FIREBASE REFERENCES ============
    firebase: {
        db: null,
        auth: null,
        collection: null,
        addDoc: null,
        onSnapshot: null,
        query: null,
        orderBy: null,
        where: null,
        deleteDoc: null,
        doc: null,
        updateDoc: null,
        getDocs: null,
        increment: null,
        serverTimestamp: null,
        setDoc: null,
        getDoc: null
    },

    // ============ DATA CACHE ============
    cache: {
        projects: [],
        tips: [],
        journal: [],
        testimonials: [],
        statistics: {},
        adminReviews: [],
        adminComments: [],
        adminMessages: []
    },

    // ============ CONFIG ============
    config: {
        isDev: !window.location.hostname.includes('github.io'),
        apiKeys: {
            gemini: null,
            recaptcha: null
        }
    },

    // ============ METHODS ============

    /**
     * Initialize app with Firebase
     */
    async init(db, auth, firebaseFunctions) {
        this.firebase.db = db;
        this.firebase.auth = auth;
        Object.assign(this.firebase, firebaseFunctions);
        
        window.ErrorHandler?.info('app.init', 'App namespace initialized');
        return true;
    },

    /**
     * Set auth state
     */
    setAuthState(user, isAdmin = false) {
        this.auth.currentUser = user;
        this.auth.isAdmin = isAdmin;
        if (user) {
            this.auth.userEmail = user.email;
            this.auth.userId = user.uid;
        }
    },

    /**
     * Get auth state
     */
    getAuthState() {
        return {
            isAuthenticated: !!this.auth.currentUser,
            isAdmin: this.auth.isAdmin,
            user: this.auth.currentUser,
            email: this.auth.userEmail,
            uid: this.auth.userId
        };
    },

    /**
     * Set config value
     */
    setConfig(key, value) {
        if (typeof key === 'object') {
            Object.assign(this.config, key);
        } else {
            this.config[key] = value;
        }
    },

    /**
     * Get config value
     */
    getConfig(key = null) {
        if (key) return this.config[key];
        return { ...this.config };
    },

    /**
     * Update cache
     */
    updateCache(key, value) {
        if (this.cache.hasOwnProperty(key)) {
            this.cache[key] = value;
        }
    },

    /**
     * Get cache
     */
    getCache(key = null) {
        if (key) return this.cache[key] || null;
        return { ...this.cache };
    },

    /**
     * Clear cache
     */
    clearCache(key = null) {
        if (key) {
            if (this.cache.hasOwnProperty(key)) {
                if (Array.isArray(this.cache[key])) {
                    this.cache[key] = [];
                } else if (typeof this.cache[key] === 'object') {
                    this.cache[key] = {};
                }
            }
        } else {
            for (const key in this.cache) {
                if (Array.isArray(this.cache[key])) {
                    this.cache[key] = [];
                } else if (typeof this.cache[key] === 'object') {
                    this.cache[key] = {};
                }
            }
        }
    },

    /**
     * Get all global state
     */
    getState() {
        return {
            auth: { ...this.auth },
            cache: this.getCache(),
            config: this.getConfig()
        };
    },

    /**
     * Reset to defaults
     */
    reset() {
        this.auth.isAdmin = false;
        this.auth.currentUser = null;
        this.auth.userEmail = null;
        this.auth.userId = null;
        this.clearCache();
    }
};

// ============ BACKWARD COMPATIBILITY PROXIES ============
// Legacy globals now point to App namespace

Object.defineProperty(window, 'isAdmin', {
    get() { return window.App.auth.isAdmin; },
    set(value) { window.App.auth.isAdmin = value; }
});

Object.defineProperty(window, 'currentUser', {
    get() { return window.App.auth.currentUser; },
    set(value) { window.App.auth.currentUser = value; }
});

// These are already aliased via error-handler.js and form-handler.js
// but we keep references for absolute backward compat

export default window.App;
