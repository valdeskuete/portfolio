/**
 * ========== TIPS MANAGER - GESTION PROFESSIONNELLE DES ASTUCES ==========
 * Gère l'affichage, filtrage et personnalisation des astuces avec hiérarchie visuelle
 * Système flexible : différentes tailles, couleurs et structures selon le type d'astuce
 */

window.TipsManager = {
    // État global
    state: {
        allTips: [],
        displayedTips: [],
        filters: {
            difficulty: 'all',
            category: 'all'
        }
    },

    /**
     * Modèles d'astuces avec structure complète
     * Exemple : type "guide" vs "quick-tip" vs "troubleshoot"
     */
    tipTemplates: {
        defender: {
            title: "🛡️ Configurer Windows Defender",
            category: "security",
            difficulty: "debutant",
            type: "guide",
            description: "Optimiser la protection antivirus de votre système",
            steps: [
                "Ouvrir Windows Defender Paramètres de sécurité",
                "Vérifier que la Protection en temps réel est active",
                "Configurer les exclusions si nécessaire",
                "Planifier des analyses programmées chaque semaine"
            ],
            highlight: "Conseil : Faites une analyse complète une fois par mois pour plus de sécurité",
            timeEstimate: "15 min",
            difficulty_emoji: "🟢"
        },
        performance: {
            title: "⚙️ Optimiser les Performances",
            category: "os",
            difficulty: "intermediaire",
            type: "guide",
            description: "Augmenter la vitesse et la réactivité de votre PC",
            steps: [
                "Nettoyer les fichiers temporaires (Disque local > Nettoyage)",
                "Désactiver les programmes au démarrage (msconfig)",
                "Augmenter la mémoire virtuelle si RAM insuffisante",
                "Mettre à jour les pilotes graphiques et chipset"
            ],
            highlight: "Astuce : Utilisez CCleaner pour nettoyer en profondeur (gratuit)",
            timeEstimate: "30 min",
            difficulty_emoji: "🟡"
        },
        updates: {
            title: "🔄 Gérer les Mises à jour Windows",
            category: "os",
            difficulty: "debutant",
            type: "quick-tip",
            description: "Configurer et planifier les mises à jour système",
            steps: [
                "Paramètres > Mise à jour et sécurité",
                "Définir les heures actives pour éviter les redémarrages",
                "Laisser les mises à jour s'installer automatiquement",
                "Redémarrer le soir ou la nuit de préférence"
            ],
            highlight: "Important : N'interrompez jamais une mise à jour en cours",
            timeEstimate: "5 min",
            difficulty_emoji: "🟢"
        },
        backup: {
            title: "💾 Sauvegarder ses Données",
            category: "software",
            difficulty: "intermediaire",
            type: "guide",
            description: "Créer une stratégie de sauvegarde efficace",
            steps: [
                "Identifier les dossiers importants (Documents, Photos...)",
                "Utiliser l'historique des fichiers ou une clé USB externe",
                "Configurer OneDrive ou Google Drive pour la sauvegarde cloud",
                "Tester la restauration pour vérifier que tout fonctionne"
            ],
            highlight: "Règle 3-2-1 : 3 copies, 2 médias différents, 1 hors site",
            timeEstimate: "20 min",
            difficulty_emoji: "🟡"
        }
    },

    /**
     * Initialiser les filtres et événements
     */
    initFilters() {
        const filterBtns = document.querySelectorAll('.tip-filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.difficulty;
                const category = e.target.dataset.category;

                // Mettre à jour l'état
                if (difficulty !== undefined) {
                    this.state.filters.difficulty = difficulty;
                    // Désactiver les autres boutons de difficulté
                    document.querySelectorAll('[data-difficulty]').forEach(b => {
                        b.classList.toggle('active', b.dataset.difficulty === difficulty);
                    });
                }

                if (category !== undefined) {
                    this.state.filters.category = category;
                    // Désactiver les autres boutons de catégorie
                    document.querySelectorAll('[data-category]').forEach(b => {
                        b.classList.toggle('active', b.dataset.category === category);
                    });
                }

                this.filterAndDisplay();
            });
        });
    },

    /**
     * Charger les astuces depuis Firestore
     */
    async loadTipsFromFirebase() {
        if (!window.db) {
            console.warn('⚠️ Firebase Firestore non initialisé');
            return;
        }

        try {
            const snapshot = await window.db.collection('tips')
                .where('published', '==', true)
                .orderBy('createdAt', 'desc')
                .get();

            this.state.allTips = [];
            snapshot.forEach(doc => {
                this.state.allTips.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ ${this.state.allTips.length} astuces chargées`);
            this.filterAndDisplay();
        } catch (error) {
            console.error('❌ Erreur chargement astuces:', error);
        }
    },

    /**
     * Appliquer les filtres et afficher
     */
    filterAndDisplay() {
        const { difficulty, category } = this.state.filters;

        this.state.displayedTips = this.state.allTips.filter(tip => {
            const matchDifficulty = difficulty === 'all' || tip.difficulty === difficulty;
            const matchCategory = category === 'all' || tip.category === category;
            return matchDifficulty && matchCategory;
        });

        this.renderTips();
    },

    /**
     * Rendre les astuces avec design admin panel style
     */
    renderTips() {
        const container = document.getElementById('tips-display');
        
        if (!container) return;

        if (this.state.displayedTips.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; padding: 4rem 2rem;">
                    <div class="empty-state-icon">📋</div>
                    <p class="empty-state-text">Aucune astuce ne correspond à ces critères</p>
                </div>
            `;
            return;
        }

        // Utiliser le nouveau renderer si disponible, sinon fallback
        if (window.PublicPanelRenderer) {
            container.innerHTML = '';
            this.state.displayedTips.forEach(tip => {
                const panelElement = PublicPanelRenderer.createTipPanel(tip);
                container.appendChild(panelElement);
            });
        } else {
            // Fallback ancien rendu
            container.innerHTML = this.state.displayedTips.map(tip => this.createTipCard(tip)).join('');
        }
    },

    /**
     * Créer une carte astuce avec structure flexible
     */
    createTipCard(tip) {
        const {
            id,
            title,
            description,
            category,
            difficulty,
            steps = [],
            highlight,
            timeEstimate,
            type = 'guide'
        } = tip;

        // Déterminer l'emoji de difficulté
        const difficultyEmojis = {
            debutant: '🟢',
            intermediaire: '🟡',
            avance: '🔴'
        };

        // Déterminer le nom de catégorie avec emoji
        const categoryNames = {
            os: '🖥️ Système',
            hardware: '⚙️ Matériel',
            security: '🔒 Sécurité',
            network: '🌐 Réseau',
            software: '📦 Logiciels'
        };

        // Formater les étapes
        const stepsHTML = steps.length > 0 ? `
            <div class="tip-steps">
                ${steps.map((step, i) => `
                    <div class="tip-step">
                        <span class="step-number">${i + 1}</span>
                        <span class="step-text">${step}</span>
                    </div>
                `).join('')}
            </div>
        ` : '';

        // Conseil/highlight
        const highlightHTML = highlight ? `
            <div class="tip-highlight">
                <strong>💡 ${highlight.split(':')[0]}:</strong>
                ${highlight.includes(':') ? highlight.split(':')[1] : highlight}
            </div>
        ` : '';

        // Infos footer
        const footerHTML = `
            <div class="tip-card-footer">
                <div class="tip-meta">
                    ${timeEstimate ? `<span class="tip-meta-item">⏱️ ${timeEstimate}</span>` : ''}
                    <span class="tip-meta-item">📅 ${new Date(tip.createdAt?.toDate?.()).toLocaleDateString('fr-FR') || 'Récent'}</span>
                </div>
                <button class="tip-action-btn" onclick="alert('Fonctionnalité partage à venir')">
                    Partager
                </button>
            </div>
        `;

        return `
            <div class="tip-card" data-difficulty="${difficulty}" data-category="${category}">
                <div class="tip-card-header">
                    <h3 class="tip-card-title">${title}</h3>
                    <span class="difficulty-badge ${difficulty}">${difficultyEmojis[difficulty]} ${difficulty}</span>
                </div>
                <span class="tip-category-tag">${categoryNames[category]}</span>
                <div class="tip-card-content">
                    <p class="tip-description">${description}</p>
                    ${stepsHTML}
                    ${highlightHTML}
                </div>
                ${footerHTML}
            </div>
        `;
    },

    /**
     * Charger un template d'astuce prêt
     */
    loadTipTemplate(templateName) {
        const template = this.tipTemplates[templateName];
        if (!template) return;

        document.getElementById('tip-title').value = template.title;
        document.getElementById('tip-category').value = template.category;
        document.getElementById('tip-difficulty').value = template.difficulty;
        
        let content = `${template.description}\n\n`;
        template.steps.forEach((step, i) => {
            content += `${i + 1}. ${step}\n`;
        });
        content += `\n📌 ${template.highlight}`;
        
        document.getElementById('tip-content').value = content;
        
        // Trigger preview
        this.previewTip();
        
        console.log(`✅ Template "${templateName}" chargé`);
    },

    /**
     * Aperçu en temps réel
     */
    previewTip() {
        const title = document.getElementById('tip-title').value || '(Titre)';
        const category = document.getElementById('tip-category').value || '?';
        const difficulty = document.getElementById('tip-difficulty').value || 'debutant';
        const content = document.getElementById('tip-content').value || '(Contenu)';

        const preview = {
            title,
            category,
            difficulty,
            description: content.split('\n')[0],
            steps: content.split('\n').filter(l => /^\d+\./.test(l)).map(l => l.replace(/^\d+\.\s*/, '')),
            highlight: content.split('📌').pop()?.trim()
        };

        const previewDiv = document.getElementById('tip-preview');
        previewDiv.innerHTML = this.createTipCard(preview);
    },

    /**
     * Soumettre une nouvelle astuce
     */
    async submitTip(e) {
        e.preventDefault();

        if (!window.isAdmin) {
            alert('⚠️ Seuls les administrateurs peuvent publier des astuces');
            return;
        }

        if (!window.db) {
            alert('❌ Firestore non initialisé');
            return;
        }

        const title = document.getElementById('tip-title').value.trim();
        const category = document.getElementById('tip-category').value;
        const difficulty = document.getElementById('tip-difficulty').value;
        const content = document.getElementById('tip-content').value.trim();

        if (!title || !category || !difficulty || !content) {
            alert('❌ Veuillez remplir tous les champs');
            return;
        }

        try {
            await window.db.collection('tips').add({
                title,
                category,
                difficulty,
                description: content.split('\n')[0],
                content,
                published: true,
                createdAt: new Date(),
                likes: 0,
                shares: 0
            });

            alert('✅ Astuce publiée avec succès!');
            document.getElementById('tip-form').reset();
            document.getElementById('tip-preview').innerHTML = '<p style="color: #888; text-align: center; margin-top: 4rem;">👈 Remplissez le formulaire pour voir l\'aperçu</p>';
            
            this.loadTipsFromFirebase();
        } catch (error) {
            console.error('❌ Erreur publication:', error);
            alert('❌ Erreur : ' + error.message);
        }
    },

    /**
     * Initialiser le manager
     */
    init() {
        console.log('🎯 Initialisation Tips Manager...');
        
        // Attendre que Firestore soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initFilters();
                this.loadTipsFromFirebase();
                
                // Bind form
                const form = document.getElementById('tip-form');
                if (form) {
                    form.addEventListener('submit', (e) => this.submitTip(e));
                    form.addEventListener('input', () => this.previewTip());
                }
                
                // Bind templates
                window.loadTipTemplate = (name) => this.loadTipTemplate(name);
                
                console.log('✅ Tips Manager initialisé');
            });
        } else {
            this.initFilters();
            this.loadTipsFromFirebase();
            
            const form = document.getElementById('tip-form');
            if (form) {
                form.addEventListener('submit', (e) => this.submitTip(e));
                form.addEventListener('input', () => this.previewTip());
            }
            
            window.loadTipTemplate = (name) => this.loadTipTemplate(name);
            
            console.log('✅ Tips Manager initialisé');
        }
    }
};

// Initialiser
window.TipsManager.init();
