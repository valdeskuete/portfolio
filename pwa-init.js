// Script d'enregistrement du Service Worker et gestion PWA
// À ajouter dans index.html après le body

(function() {
  'use strict';

  // Vérifier le support PWA
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker non supporté par ce navigateur');
    return;
  }

  // Enregistrer le Service Worker au chargement
  window.addEventListener('load', () => {
    registerServiceWorker();
    setupPWAInstallPrompt();
  });

  /**
   * Enregistre le Service Worker
   */
  function registerServiceWorker() {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker enregistré:', registration);
        
        // Vérifier les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUserOfUpdate();
            }
          });
        });

        // Vérifier les mises à jour périodiquement
        setInterval(() => {
          registration.update();
        }, 60000); // Chaque minute
      })
      .catch((error) => {
        console.error('[PWA] Erreur enregistrement Service Worker:', error);
      });
  }

  /**
   * Configure le prompt d'installation PWA
   */
  function setupPWAInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (event) => {
      // Empêcher le mini-infobar de s'afficher automatiquement
      event.preventDefault();
      deferredPrompt = event;

      // Afficher le bouton d'installation personnalisé si désiré
      showInstallButton(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] Application installée');
      deferredPrompt = null;
      hideInstallButton();
    });
  }

  /**
   * Affiche le bouton d'installation (optionnel)
   */
  function showInstallButton(deferredPrompt) {
    // Vous pouvez ajouter un bouton personnalisé ici
    // const installButton = document.createElement('button');
    // installButton.textContent = 'Installer l\'app';
    // installButton.addEventListener('click', () => {
    //   deferredPrompt.prompt();
    //   deferredPrompt.userChoice.then((choiceResult) => {
    //     if (choiceResult.outcome === 'accepted') {
    //       console.log('Installation acceptée');
    //     }
    //     deferredPrompt = null;
    //   });
    // });
  }

  /**
   * Cache le bouton d'installation
   */
  function hideInstallButton() {
    // Masquer le bouton si créé
  }

  /**
   * Notifie l'utilisateur d'une mise à jour disponible
   */
  function notifyUserOfUpdate() {
    // Afficher une notification ou un toast
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Valdes Tech', {
        tag: 'update',
        body: 'Une nouvelle version est disponible. Rechargez pour mettre à jour.',
        icon: '/images/icon-192x192.png',
        badge: '/images/icon-192x192.png'
      });
    } else {
      // Fallback: afficher un message console
      console.log('[PWA] Une mise à jour est disponible');
    }
  }

  /**
   * Vérifie la connectivité
   */
  window.addEventListener('online', () => {
    console.log('[PWA] Connexion rétablie');
    document.body.classList.remove('offline');
  });

  window.addEventListener('offline', () => {
    console.log('[PWA] Mode hors ligne');
    document.body.classList.add('offline');
  });

  /**
   * Vérifie l'état initial de connexion
   */
  if (!navigator.onLine) {
    document.body.classList.add('offline');
  }

  /**
   * Demande permission pour notifications
   */
  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('[PWA] Permission notifications:', permission);
      });
    }
  }

  // Demander permission après 5 secondes
  setTimeout(requestNotificationPermission, 5000);

  // Exporter pour utilisation globale
  window.PWA = {
    registerServiceWorker,
    setupPWAInstallPrompt,
    requestNotificationPermission
  };

  console.log('[PWA] Système PWA initialisé');
})();
