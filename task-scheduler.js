/**
 * TASK SCHEDULER - Performance Optimization
 * 
 * Diffère le chargement des scripts non-critiques (SocialLinks, TipsManager, AdminFeatures)
 * pour améliorer les Core Web Vitals (FCP, LCP, CLS)
 * 
 * Techniques utilisées:
 * - Lazy loading des modules à forte charge
 * - Décalage basé sur navigationStart
 * - Prévention des appels multiples (idempotence)
 */

window.PerformanceMonitor = window.PerformanceMonitor || {
    // État global de l'initialisation
    initialized: false,
    tasksScheduled: false,
    scheduledTasks: [],

    /**
     * Obtient le timestamp de navigation (pour les timings relatifs)
     */
    getNavigationStart() {
        return performance.timing?.navigationStart || Date.now();
    },

    /**
     * Obtient le temps écoulé depuis le navigation start
     */
    getElapsedTime() {
        const navigationStart = this.getNavigationStart();
        return Date.now() - navigationStart;
    },

    /**
     * Log avec timing (pour debugging)
     */
    log(message, taskName = '', elapsed = null) {
        const timeStr = elapsed !== null ? `[${elapsed.toFixed(0)}ms]` : '';
        const status = taskName ? `[${taskName}]` : '';
        console.log(`⏱️ [TaskScheduler] ${timeStr} ${status} ${message}`);
    },

    /**
     * Enveloppe une tâche avec mesure de performance
     */
    wrapTask(taskName, taskFn) {
        return () => {
            const start = Date.now();
            try {
                taskFn();
                const duration = Date.now() - start;
                const elapsed = this.getElapsedTime();
                this.log(`✅ ${taskName} loaded`, taskName, elapsed);
                console.log(`   └─ Duration: ${duration}ms`);
            } catch (error) {
                const elapsed = this.getElapsedTime();
                this.log(`❌ ${taskName} failed: ${error.message}`, taskName, elapsed);
                console.error(`   └─ Error:`, error);
            }
        };
    },

    /**
     * Enveloppe un appel avec protection contre les appels multiples
     */
    wrapIdempotent(functionPath, taskName) {
        return () => {
            // Récupérer la fonction via le chemin (ex: window.SocialLinks.init)
            const parts = functionPath.split('.');
            let obj = window;
            
            for (let i = 0; i < parts.length - 1; i++) {
                obj = obj[parts[i]];
                if (!obj) {
                    console.warn(`⚠️ [TaskScheduler] Path not found: ${functionPath}`);
                    return;
                }
            }
            
            const fnName = parts[parts.length - 1];
            const fn = obj[fnName];
            
            if (typeof fn === 'function') {
                // Marquer comme appelé pour éviter les doublons
                const marker = `__called_${functionPath}`;
                if (!window[marker]) {
                    window[marker] = true;
                    this.wrapTask(taskName, () => fn.call(obj))();
                } else {
                    const elapsed = this.getElapsedTime();
                    this.log(`⏭️ ${taskName} already initialized`, taskName, elapsed);
                }
            } else {
                console.warn(`⚠️ [TaskScheduler] Function not found: ${functionPath}`);
            }
        };
    },

    /**
     * Enveloppe un objet avec init() avec protection contre les appels multiples
     */
    wrapObjectInit(objectPath, taskName) {
        return () => {
            const parts = objectPath.split('.');
            let obj = window;
            
            for (const part of parts) {
                obj = obj[part];
                if (!obj) {
                    console.warn(`⚠️ [TaskScheduler] Object not found: ${objectPath}`);
                    return;
                }
            }
            
            if (typeof obj.init === 'function') {
                // Marquer comme appelé
                const marker = `__initialized_${objectPath}`;
                if (!window[marker]) {
                    window[marker] = true;
                    this.wrapTask(taskName, () => obj.init())();
                } else {
                    const elapsed = this.getElapsedTime();
                    this.log(`⏭️ ${taskName} already initialized`, taskName, elapsed);
                }
            } else {
                console.warn(`⚠️ [TaskScheduler] No init() method: ${objectPath}`);
            }
        };
    },

    /**
     * Enveloppe un appel loadPublicTips() avec protection
     */
    wrapLoadPublicTips() {
        return () => {
            if (window.TipsManager && typeof window.TipsManager.loadPublicTips === 'function') {
                const marker = '__loaded_public_tips';
                if (!window[marker]) {
                    window[marker] = true;
                    this.wrapTask('TipsManager.loadPublicTips', () => {
                        window.TipsManager.loadPublicTips();
                    })();
                } else {
                    const elapsed = this.getElapsedTime();
                    this.log(`⏭️ TipsManager already loaded`, 'TipsManager', elapsed);
                }
            }
        };
    },

    /**
     * Planifie les tâches non-critiques avec décalage
     * 
     * Timing:
     * - 500ms: TipsManager.loadPublicTips (HIGH PRIORITY)
     * - 1000ms: SocialLinks (léger)
     * - 1500ms: AdminFeatures (lourd)
     */
    scheduleNonCriticalScripts() {
        if (this.tasksScheduled) {
            console.log('⏭️ [TaskScheduler] Tasks already scheduled');
            return;
        }

        this.tasksScheduled = true;
        const navigationStart = this.getNavigationStart();

        // Attendre le DOMContentLoaded pour être sûr que les scripts sont chargés
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this._scheduleAfterDOM();
            }, { once: true });
        } else {
            // DOM déjà chargé
            this._scheduleAfterDOM();
        }
    },

    /**
     * Interne: Planifie après que le DOM soit prêt
     */
    _scheduleAfterDOM() {
        // === TIMING 1: TipsManager (HIGH PRIORITY) @ 500ms ===
        this.scheduledTasks.push(
            setTimeout(
                this.wrapLoadPublicTips(),
                500
            )
        );

        // === TIMING 2: SocialLinks (léger) @ 1000ms ===
        this.scheduledTasks.push(
            setTimeout(
                this.wrapObjectInit('SocialLinks', 'SocialLinks.init'),
                1000
            )
        );

        // === TIMING 3: AdminFeatures (lourd) @ 1500ms ===
        // Seulement si le module existe réellement
        if (window.AdminFeatures || document.getElementById('admin-panel')) {
            this.scheduledTasks.push(
                setTimeout(
                    this.wrapObjectInit('AdminFeatures', 'AdminFeatures.init'),
                    1500
                )
            );
        } else {
            console.warn('⚠️ AdminFeatures not available, skipping initialization');
        }

        const elapsed = this.getElapsedTime();
        this.log(`✅ Non-critical tasks scheduled`, '', elapsed);
        this.log(`   - TipsManager @ 500ms (HIGH PRIORITY)`, '', 500);
        this.log(`   - SocialLinks @ 1000ms`, '', 1000);
        this.log(`   - AdminFeatures @ 1500ms`, '', 1500);
    },

    /**
     * Mesure les tâches critiques (pour monitoring)
     */
    measureCriticalTasks() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return;
        }

        try {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            if (!navigationTiming) return;

            const metrics = {
                'DNS Lookup': navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
                'TCP Connection': navigationTiming.connectEnd - navigationTiming.connectStart,
                'Request Time': navigationTiming.responseStart - navigationTiming.requestStart,
                'Response Time': navigationTiming.responseEnd - navigationTiming.responseStart,
                'DOM Processing': navigationTiming.domInteractive - navigationTiming.domLoading,
                'DOM Content Loaded': navigationTiming.domContentLoadedEventEnd - navigationTiming.navigationStart,
                'Page Load': navigationTiming.loadEventEnd - navigationTiming.navigationStart,
            };

            console.group('📊 [TaskScheduler] Critical Metrics');
            Object.entries(metrics).forEach(([key, value]) => {
                if (value > 0) {
                    console.log(`${key}: ${value.toFixed(0)}ms`);
                }
            });
            console.groupEnd();
        } catch (error) {
            console.warn('[TaskScheduler] Could not measure critical tasks:', error);
        }
    },

    /**
     * Annule les tâches planifiées (utile pour testing)
     */
    cancelScheduledTasks() {
        this.scheduledTasks.forEach(timeoutId => clearTimeout(timeoutId));
        this.scheduledTasks = [];
        this.tasksScheduled = false;
        console.log('🛑 [TaskScheduler] All scheduled tasks cancelled');
    },

    /**
     * Obtient le statut d'initialisation
     */
    getStatus() {
        return {
            initialized: this.initialized,
            tasksScheduled: this.tasksScheduled,
            scheduledTasksCount: this.scheduledTasks.length,
            elapsedTime: this.getElapsedTime(),
            socialLinksInitialized: !!window.__initialized_SocialLinks,
            tipsManagerLoaded: !!window.__loaded_public_tips,
            adminFeaturesInitialized: !!window.__initialized_AdminFeatures,
        };
    },

    /**
     * Optimise l'initialisation globale
     */
    optimizeInitialization() {
        if (this.initialized) {
            return;
        }

        this.initialized = true;
        const elapsed = this.getElapsedTime();

        this.log(`🚀 Optimization started`, '', elapsed);

        // Planifier les tâches non-critiques
        this.scheduleNonCriticalScripts();

        // Mesurer les tâches critiques après le page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.measureCriticalTasks();
            }, 100);
        }, { once: true });

        this.log(`✅ Optimization complete`, '', this.getElapsedTime());
    }
};

// === AUTO-INITIALIZATION ===
// Démarrer l'optimisation dès que ce script est chargé
if (document.readyState === 'loading' || document.readyState === 'interactive') {
    // DOM pas encore chargé, attendre
    document.addEventListener('DOMContentLoaded', () => {
        window.PerformanceMonitor.optimizeInitialization();
    }, { once: true });
} else {
    // DOM déjà chargé (rare mais possible avec defer)
    window.PerformanceMonitor.optimizeInitialization();
}

// Exposition globale pour debugging
console.log('📋 [TaskScheduler] Type: window.PerformanceMonitor.getStatus() to check initialization status');
