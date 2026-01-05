/**
 * ========== SYSTÈME DE NOTIFICATIONS TOAST ==========
 * Affiche des notifications élégantes non-intrusive
 * Couleurs: Cyan neon pour succès, Rouge pour erreurs, Jaune pour avertissements
 */

window.NotificationSystem = {
    container: null,

    init() {
        // Créer le conteneur si n'existe pas
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'success', duration = 3000) {
        this.init();

        const toast = document.createElement('div');
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const colors = {
            success: { bg: 'rgba(0, 238, 255, 0.1)', border: '#0ef', text: '#0ef' },
            error: { bg: 'rgba(255, 51, 51, 0.1)', border: '#ff3333', text: '#ff6666' },
            warning: { bg: 'rgba(0, 238, 255, 0.1)', border: '#0ef', text: '#0ef' },
            info: { bg: 'rgba(100, 150, 255, 0.1)', border: '#6496ff', text: '#6496ff' }
        };

        const color = colors[type] || colors.info;
        const icon = icons[type] || icons.info;

        toast.style.cssText = `
            background: ${color.bg};
            border-left: 4px solid ${color.border};
            border-radius: 0.5rem;
            padding: 1rem 1.5rem;
            margin-bottom: 1rem;
            color: ${color.text};
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease-out;
            pointer-events: auto;
            cursor: pointer;
        `;

        toast.innerHTML = `
            <span style="font-size: 1.2rem; flex-shrink: 0;">${icon}</span>
            <span style="flex: 1;">${message}</span>
            <button style="
                background: none;
                border: none;
                color: ${color.text};
                cursor: pointer;
                font-size: 1.2rem;
                padding: 0;
                flex-shrink: 0;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            " onclick="this.parentElement.remove()">✕</button>
        `;

        // Ajouter des keyframes si n'existe pas
        if (!document.querySelector('style[data-toast-animations]')) {
            const style = document.createElement('style');
            style.setAttribute('data-toast-animations', '');
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        this.container.appendChild(toast);

        // Auto-remove après duration
        if (duration > 0) {
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    },

    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    error(message, duration) {
        return this.show(message, 'error', duration || 4000);
    },

    warning(message, duration) {
        return this.show(message, 'warning', duration || 3500);
    },

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

/* ==================== UTILITAIRES DE CONFIRMATION ==================== */
window.ConfirmDialog = {
    show(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.2s ease-out;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: linear-gradient(135deg, #1f242d, #323946);
            border: 2px solid #0ef;
            border-radius: 1rem;
            padding: 2rem;
            max-width: 400px;
            box-shadow: 0 0 30px rgba(14, 239, 255, 0.3);
            animation: slideUp 0.3s ease-out;
            backdrop-filter: blur(10px);
        `;

        dialog.innerHTML = `
            <p style="
                color: #fff;
                font-size: 1.1rem;
                margin-bottom: 2rem;
                text-align: center;
                line-height: 1.6;
            ">${message}</p>
            
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button id="confirm-btn" style="
                    padding: 0.8rem 2rem;
                    background: linear-gradient(135deg, #0ef, #0aafaf);
                    color: #1f242d;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">✅ Confirmer</button>
                
                <button id="cancel-btn" style="
                    padding: 0.8rem 2rem;
                    background: rgba(255, 51, 51, 0.2);
                    color: #ff6666;
                    border: 1px solid #ff3333;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">❌ Annuler</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Ajouter animations si n'existe pas
        if (!document.querySelector('style[data-confirm-animations]')) {
            const style = document.createElement('style');
            style.setAttribute('data-confirm-animations', '');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        const confirmBtn = dialog.querySelector('#confirm-btn');
        const cancelBtn = dialog.querySelector('#cancel-btn');

        const cleanup = () => overlay.remove();

        confirmBtn.onclick = () => {
            if (onConfirm) onConfirm();
            cleanup();
        };

        cancelBtn.onclick = () => {
            if (onCancel) onCancel();
            cleanup();
        };

        // Fermer en cliquant sur le fond
        overlay.onclick = (e) => {
            if (e.target === overlay) cleanup();
        };

        // Hover effects
        confirmBtn.onmouseover = () => {
            confirmBtn.style.transform = 'translateY(-2px)';
            confirmBtn.style.boxShadow = '0 6px 20px rgba(0, 238, 255, 0.4)';
        };
        confirmBtn.onmouseout = () => {
            confirmBtn.style.transform = 'translateY(0)';
            confirmBtn.style.boxShadow = 'none';
        };

        cancelBtn.onmouseover = () => {
            cancelBtn.style.background = 'rgba(255, 51, 51, 0.3)';
        };
        cancelBtn.onmouseout = () => {
            cancelBtn.style.background = 'rgba(255, 51, 51, 0.2)';
        };
    }
};

/* ==================== SKELETON LOADERS ==================== */
window.SkeletonLoader = {
    create(count = 3, type = 'card') {
        const container = document.createElement('div');
        container.className = 'skeleton-container';
        container.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
            width: 100%;
        `;

        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-item';
            skeleton.style.cssText = `
                background: linear-gradient(
                    90deg,
                    rgba(0, 238, 255, 0.1) 0%,
                    rgba(0, 238, 255, 0.2) 50%,
                    rgba(0, 238, 255, 0.1) 100%
                );
                background-size: 200% 100%;
                animation: shimmer 2s infinite;
                border: 1px solid rgba(0, 238, 255, 0.2);
                border-radius: 0.8rem;
                padding: 1.5rem;
                height: 300px;
            `;

            if (!document.querySelector('style[data-skeleton-animations]')) {
                const style = document.createElement('style');
                style.setAttribute('data-skeleton-animations', '');
                style.textContent = `
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                `;
                document.head.appendChild(style);
            }

            container.appendChild(skeleton);
        }

        return container;
    }
};

/* ==================== INITIALISATION ==================== */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.NotificationSystem.init();
    });
} else {
    window.NotificationSystem.init();
}

console.log('✅ Système de notifications chargé');
