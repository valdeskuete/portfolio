/**
 * ========== SOCIAL LINKS MANAGER ==========
 * Affiche les liens Facebook et LinkedIn quand on tape "Valdes" ou "Valdes Tech"
 * Avec photo de profil et liens directs
 */

window.SocialLinks = {
    config: {
        name: "Valdes Kuete",
        siteName: "Valdes Tech",
        facebook: "https://www.facebook.com/profile.php?id=61584982319524",
        linkedin: "https://www.linkedin.com/in/valdes-kuete-5b453b289/",
        profileImage: "images/profile.jpg"
    },

    // Créer un modal avec les liens sociaux
    showSocialModal() {
        // Vérifier si le modal existe déjà
        let existingModal = document.getElementById('social-links-modal');
        if (existingModal) {
            existingModal.style.display = 'flex';
            return;
        }

        // Créer le modal
        const modal = document.createElement('div');
        modal.id = 'social-links-modal';
        modal.style.cssText = `
            display: flex;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-in;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #0ef, #0a4d4d);
            padding: 3rem 2rem;
            border-radius: 1rem;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 0 30px rgba(14, 239, 239, 0.3);
            animation: slideUp 0.4s ease-out;
        `;

        content.innerHTML = `
            <h2 style="color: #fff; margin: 0 0 1.5rem 0; font-size: 1.8rem;">
                🌟 ${this.config.name}
            </h2>
            
            <div style="margin: 2rem 0;">
                <img src="${this.config.profileImage}" alt="Profile" style="
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    border: 3px solid #0ef;
                    object-fit: cover;
                    box-shadow: 0 0 20px rgba(14, 239, 239, 0.5);
                ">
            </div>

            <h3 style="color: #0ef; margin: 1rem 0 0.5rem 0;">
                ${this.config.siteName}
            </h3>
            <p style="color: #bbb; font-size: 0.95rem; margin: 0 0 2rem 0;">
                Maintenance IT • Sécurité • Réseaux • Support Tech
            </p>

            <div style="display: flex; gap: 1rem; justify-content: center; margin: 2rem 0; flex-wrap: wrap;">
                <a href="${this.config.facebook}" target="_blank" rel="noopener noreferrer" 
                   style="
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.8rem 1.5rem;
                    background: #1877F2;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 0.5rem;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(24, 119, 242, 0.3);
                "
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(24, 119, 242, 0.5)'"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(24, 119, 242, 0.3)'"
                >
                    📘 Facebook
                </a>
                
                <a href="${this.config.linkedin}" target="_blank" rel="noopener noreferrer"
                   style="
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.8rem 1.5rem;
                    background: #0A66C2;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 0.5rem;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(10, 102, 194, 0.3);
                "
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(10, 102, 194, 0.5)'"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(10, 102, 194, 0.3)'"
                >
                    💼 LinkedIn
                </a>
            </div>

            <p style="color: #888; font-size: 0.85rem; margin: 1.5rem 0 0 0;">
                Connectez-vous pour collaborer ou discuter de vos projets
            </p>

            <button onclick="document.getElementById('social-links-modal').style.display='none'" 
                    style="
                    margin-top: 1.5rem;
                    padding: 0.6rem 2rem;
                    background: rgba(255, 51, 51, 0.3);
                    color: #fff;
                    border: 1px solid #ff3333;
                    border-radius: 0.4rem;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                "
                    onmouseover="this.style.background='rgba(255, 51, 51, 0.5)'"
                    onmouseout="this.style.background='rgba(255, 51, 51, 0.3)'"
                    aria-label="Fermer la fenêtre des réseaux sociaux"
            >
                ✕ Fermer
            </button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Fermer quand on clique sur le fond
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Fermer avec Escape key
        const closeOnEscape = (e) => {
            if (e.key === 'Escape' && modal.style.display !== 'none') {
                modal.style.display = 'none';
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);

        // Focus sur le premier lien au ouverture
        setTimeout(() => {
            const firstLink = modal.querySelector('a');
            if (firstLink) firstLink.focus();
        }, 100);

        // Style animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        if (!document.querySelector('style[data-social-animations]')) {
            style.setAttribute('data-social-animations', '');
            document.head.appendChild(style);
        }
    },

    // Détecter quand on tape le nom du site
    setupSearchDetection() {
        const keywords = [
            'valdes',
            'valdes tech',
            'valdes kuete',
            'contact valdes',
            'profil valdes'
        ];

        // Écouter les touches clavier globales
        let searchBuffer = '';
        let searchTimeout;

        document.addEventListener('keydown', (e) => {
            // Si on tape un caractère (vérifier que c'est une vraie touche)
            if (e.key && typeof e.key === 'string' && e.key.length === 1) {
                searchBuffer += e.key.toLowerCase();

                // Vérifier si le buffer contient un mot clé
                for (const keyword of keywords) {
                    if (searchBuffer.includes(keyword)) {
                        console.log('🔍 Keyword détecté:', keyword);
                        this.showSocialModal();
                        searchBuffer = '';
                        break;
                    }
                }

                // Réinitialiser le buffer après 2 secondes d'inactivité
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    searchBuffer = '';
                }, 2000);
            }

            // Vider si on appuie sur Escape ou Backspace
            if (e.key === 'Escape' || e.key === 'Backspace') {
                searchBuffer = '';
            }
        });
    },

    // Ajouter un bouton visible pour accéder aux liens
    addSocialButton() {
        // Vérifier si le bouton existe déjà
        if (document.querySelector('#social-media-button')) {
            return;
        }

        // Chercher le footer - TRÈS IMPORTANT
        const footer = document.querySelector('footer');
        if (!footer) {
            console.warn('⚠️ Footer non trouvé au moment de addSocialButton()');
            // Réessayer après que le DOM soit COMPLÈTEMENT prêt
            setTimeout(() => {
                if (!document.querySelector('#social-media-button')) {
                    this.addSocialButton();
                }
            }, 1000);
            return;
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            margin-top: 2rem;
            padding: 1rem;
            text-align: center;
            border-top: 1px solid rgba(14, 239, 239, 0.3);
        `;

        const button = document.createElement('button');
        button.id = 'social-media-button';
        button.textContent = '👤 Suivre sur les réseaux';
        button.style.cssText = `
            padding: 0.8rem 1.5rem;
            background: linear-gradient(135deg, #0ef, #0a4d4d);
            color: #fff;
            border: 1px solid #0ef;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(14, 239, 239, 0.3);
        `;

        button.onmouseover = () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 20px rgba(14, 239, 239, 0.5)';
        };

        button.onmouseout = () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 15px rgba(14, 239, 239, 0.3)';
        };

        button.onclick = () => {
            console.log('✅ Bouton "Suivre sur les réseaux" cliqué');
            this.showSocialModal();
        };

        buttonContainer.appendChild(button);
        footer.appendChild(buttonContainer);
        console.log('✅ Bouton "Suivre sur les réseaux" ajouté au footer');
    },

    // Initialiser
    init() {
        console.log('🌐 Initialisation des liens sociaux...');
        this.setupSearchDetection();
        this.addSocialButton();
        console.log('✅ Liens sociaux initialisés');
    }
};

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.SocialLinks.init();
    });
} else {
    window.SocialLinks.init();
}
