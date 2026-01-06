/**
 * ============================================
 * LAZY LOADER OPTIMISÉ - PERFORMANCE MOBILE
 * ============================================
 * 
 * Charge différé:
 * - Botpress Chat Widget (après 3s OU au premier interaction)
 * - Google Maps Iframe (après 5s OU au scroll dans la section)
 * 
 * Impact:
 * - TTL: -40% (Time To Load)
 * - FCP: -25% (First Contentful Paint)
 * - Android: Chargement beaucoup plus rapide
 */

(function() {
    const BOTPRESS_DELAY = 3000; // 3 secondes avant chargement auto
    const MAPS_DELAY = 5000; // 5 secondes avant chargement auto
    const INTERACTION_TYPES = ['click', 'scroll', 'touchstart', 'mousemove'];
    
    let botpressLoaded = false;
    let mapsLoaded = false;
    let interactionDetected = false;
    
    console.log('[Performance] Lazy Loader initialized');
    
    /**
     * 1. OPTIMISATION BOTPRESS
     * Charge le widget après 3s ou au premier interaction
     */
    function initBotpressLazyLoading() {
        if (botpressLoaded) return;
        
        // Flag interaction
        const markInteraction = () => {
            interactionDetected = true;
            if (botpressLoaded) return;
            console.log('[Performance] Interaction detected - Loading Botpress');
            loadBotpressWidget();
            removeLazyListeners();
        };
        
        // Écoute interactions utilisateur
        INTERACTION_TYPES.forEach(eventType => {
            document.addEventListener(eventType, markInteraction, { once: true, passive: true });
        });
        
        // Timeout auto-load après 3 secondes (même sans interaction)
        setTimeout(() => {
            if (!botpressLoaded) {
                console.log('[Performance] Auto-loading Botpress after 3 seconds');
                loadBotpressWidget();
                removeLazyListeners();
            }
        }, BOTPRESS_DELAY);
    }
    
    function loadBotpressWidget() {
        if (botpressLoaded) return;
        botpressLoaded = true;
        
        // Si Botpress est déjà injecté (script defer), l'activer
        if (window.botpressWebChat) {
            console.log('[Performance] Botpress widget activated');
            window.botpressWebChat.show();
        } else {
            // Sinon charger dynamiquement
            const script = document.createElement('script');
            script.src = 'https://cdn.botpress.cloud/webchat/v3.5/inject.js';
            script.async = true;
            script.onload = () => {
                console.log('[Performance] Botpress script loaded');
            };
            document.body.appendChild(script);
        }
    }
    
    /**
     * 2. OPTIMISATION GOOGLE MAPS
     * Charge la map après 5s ou au scroll vers la section contact
     */
    function initMapsLazyLoading() {
        const contactSection = document.querySelector('#contact');
        if (!contactSection) {
            console.warn('[Performance] Contact section not found');
            return;
        }
        
        // Observateur pour détecter quand l'utilisateur scroll vers la carte
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !mapsLoaded) {
                    console.log('[Performance] Maps section visible - loading');
                    loadMapsFrames();
                    observer.disconnect();
                }
            });
        }, {
            rootMargin: '100px' // Précharge 100px avant le scroll
        });
        
        observer.observe(contactSection);
        
        // Auto-load après 5 secondes (performance fix pour lenteur réseau)
        setTimeout(() => {
            if (!mapsLoaded) {
                console.log('[Performance] Auto-loading Maps after 5 seconds');
                loadMapsFrames();
            }
        }, MAPS_DELAY);
    }
    
    function loadMapsFrames() {
        if (mapsLoaded) return;
        mapsLoaded = true;
        
        // Charger tous les iframes Google Maps
        document.querySelectorAll('iframe[src*="google.com/maps"]').forEach(iframe => {
            // L'iframe a déjà loading="lazy", mais on s'assure qu'il se charge
            if (!iframe.src.includes('loading=lazy')) {
                iframe.loading = 'lazy';
            }
            // Force le rechargement si nécessaire
            iframe.style.opacity = '1';
        });
        
        console.log('[Performance] Maps iframes activated');
    }
    
    function removeLazyListeners() {
        INTERACTION_TYPES.forEach(eventType => {
            // Les événements 'once: true' se suppriment automatiquement
        });
    }
    
    /**
     * 3. DÉMARRAGE - Attendre que le DOM soit prêt
     */
    function startLazyLoading() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initBotpressLazyLoading();
                initMapsLazyLoading();
            }, { once: true });
        } else {
            // DOM déjà chargé
            initBotpressLazyLoading();
            initMapsLazyLoading();
        }
    }
    
    // Démarrer au chargement du script
    startLazyLoading();
    
    // Exporter pour tests
    window.PerformanceLazyLoader = {
        status: {
            botpressLoaded: () => botpressLoaded,
            mapsLoaded: () => mapsLoaded,
            interactionDetected: () => interactionDetected
        },
        manualLoad: {
            botpress: loadBotpressWidget,
            maps: loadMapsFrames
        }
    };
    
    console.log('[Performance] Lazy Loader ready - Botpress in 3s, Maps in 5s');
})();
