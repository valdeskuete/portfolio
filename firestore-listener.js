/**
 * ========== CENTRALIZED FIRESTORE LISTENER ==========
 * Replaces 20+ repetitions of onSnapshot patterns
 * Unified listener management, real-time sync, cleanup
 * Date: 7 January 2026
 */

class FirestoreListener {
    constructor() {
        this.listeners = new Map();
        this.subscriptions = new Map();
        this.cache = new Map();
        this.callbacks = new Map();
    }

    /**
     * Create a listener for a single document
     * @param {string} id - Unique listener ID
     * @param {Query|DocumentReference} ref - Firestore reference
     * @param {Function} onData - Callback on data update
     * @param {Function} onError - Optional error handler
     */
    listen(id, ref, onData, onError = null) {
        // Stop existing listener with same ID
        this.stopListen(id);

        try {
            const unsubscribe = window.onSnapshot(
                ref,
                (snapshot) => {
                    let data;
                    if (snapshot.docs) {
                        // Query result
                        data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    } else {
                        // Single document
                        data = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
                    }

                    // Cache data
                    this.cache.set(id, data);

                    // Call registered callback
                    if (onData) onData(data);

                    // Call global callbacks if registered
                    const callbacks = this.callbacks.get(id) || [];
                    callbacks.forEach(cb => {
                        try { cb(data); } catch (e) {
                            window.ErrorHandler?.warning(`FirestoreListener.callback(${id})`, e);
                        }
                    });
                },
                (error) => {
                    window.ErrorHandler.error(`FirestoreListener.listen(${id})`, error);
                    if (onError) onError(error);
                }
            );

            this.listeners.set(id, unsubscribe);
            return true;
        } catch (error) {
            window.ErrorHandler.error(`FirestoreListener.listen(${id})`, error);
            return false;
        }
    }

    /**
     * Create multiple listeners at once
     * @param {array} configs - [{id, ref, onData, onError}]
     */
    listenMultiple(configs) {
        const results = [];
        for (const config of configs) {
            const result = this.listen(
                config.id,
                config.ref,
                config.onData,
                config.onError
            );
            results.push({ id: config.id, success: result });
        }
        return results;
    }

    /**
     * Stop listening to a specific listener
     */
    stopListen(id) {
        const unsubscribe = this.listeners.get(id);
        if (unsubscribe) {
            try {
                unsubscribe();
                this.listeners.delete(id);
                this.cache.delete(id);
            } catch (error) {
                window.ErrorHandler?.warning(`FirestoreListener.stopListen(${id})`, error);
            }
        }
    }

    /**
     * Stop all listeners
     */
    stopAll() {
        for (const id of this.listeners.keys()) {
            this.stopListen(id);
        }
    }

    /**
     * Register additional callback for a listener
     */
    addCallback(id, callback) {
        if (!this.callbacks.has(id)) {
            this.callbacks.set(id, []);
        }
        this.callbacks.get(id).push(callback);

        // If already cached, call immediately
        if (this.cache.has(id)) {
            callback(this.cache.get(id));
        }
    }

    /**
     * Remove callback
     */
    removeCallback(id, callback) {
        const callbacks = this.callbacks.get(id) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Get cached data
     */
    getCache(id) {
        return this.cache.get(id) || null;
    }

    /**
     * Clear cache for specific listener or all
     */
    clearCache(id = null) {
        if (id) {
            this.cache.delete(id);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Get all active listener IDs
     */
    getActiveListeners() {
        return Array.from(this.listeners.keys());
    }

    /**
     * Check if listener is active
     */
    isActive(id) {
        return this.listeners.has(id);
    }

    /**
     * Get listener count
     */
    getListenerCount() {
        return this.listeners.size;
    }

    /**
     * Helper: Listen to collection with query
     */
    listenToCollection(id, collectionName, queryConstraints = [], onData, onError = null) {
        try {
            const ref = window.query(
                window.collection(window.db, collectionName),
                ...queryConstraints
            );
            return this.listen(id, ref, onData, onError);
        } catch (error) {
            window.ErrorHandler.error(`FirestoreListener.listenToCollection(${id})`, error);
            return false;
        }
    }

    /**
     * Helper: Listen to single document
     */
    listenToDocument(id, collectionName, docId, onData, onError = null) {
        try {
            const ref = window.doc(window.db, collectionName, docId);
            return this.listen(id, ref, onData, onError);
        } catch (error) {
            window.ErrorHandler.error(`FirestoreListener.listenToDocument(${id})`, error);
            return false;
        }
    }

    /**
     * Batch listen to multiple documents
     */
    listenToDocuments(collectionName, docIds, onDataFactory = null, onError = null) {
        const results = [];
        for (const docId of docIds) {
            const id = `${collectionName}:${docId}`;
            const onData = onDataFactory ? onDataFactory(docId) : null;
            const result = this.listenToDocument(id, collectionName, docId, onData, onError);
            results.push({ id, success: result });
        }
        return results;
    }

    /**
     * Rehydrate listener (useful for reconnection)
     */
    rehydrateListener(id, ref, onData, onError = null) {
        return this.listen(id, ref, onData, onError);
    }

    /**
     * Get listener stats
     */
    getStats() {
        return {
            activeListeners: this.listeners.size,
            cachedIds: this.cache.size,
            callbackIds: this.callbacks.size,
            listeners: Array.from(this.listeners.keys())
        };
    }
}

// Initialize globally
window.FirestoreListener = new FirestoreListener();

export default window.FirestoreListener;
