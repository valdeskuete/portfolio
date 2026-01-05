/**
 * ========== ADAPTATEUR DE DESIGN ADMIN PANEL POUR PUBLIC ==========
 * Affiche les astuces/conseils avec le design admin inspiré
 * Couleurs neon cyan adaptées à la page publique
 */

window.PublicPanelRenderer = {
    /**
     * Crée un panel astuce style admin pour l'affichage public
     * @param {object} tip - Objet astuce
     * @returns {HTMLElement}
     */
    createTipPanel(tip) {
        const panel = document.createElement('div');
        panel.className = 'tips-panel';
        
        const categoryIcons = {
            os: '🖥️',
            hardware: '⚙️',
            security: '🔒',
            network: '🌐',
            software: '📦'
        };

        const difficultyColors = {
            debutant: { emoji: '🟢', label: 'Débutant' },
            intermediaire: { emoji: '🟡', label: 'Intermédiaire' },
            avance: { emoji: '🔴', label: 'Avancé' }
        };

        const cat = tip.category || 'os';
        const diff = tip.difficulty || 'debutant';
        const icon = categoryIcons[cat] || '💡';
        const diffInfo = difficultyColors[diff] || difficultyColors.debutant;

        panel.innerHTML = `
            <div class="tips-panel-header">
                <div class="tips-panel-icon">${icon}</div>
                <div style="flex: 1;">
                    <h3 class="tips-panel-title">${this.escapeHtml(tip.title)}</h3>
                    <div style="display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem; flex-wrap: wrap;">
                        <span class="tips-panel-category">${diffInfo.emoji} ${diffInfo.label}</span>
                        <span class="tips-panel-category" style="background: rgba(0, 238, 255, 0.15);">${tip.createdAt ? this.formatDate(tip.createdAt) : new Date().toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
                <button class="panel-btn" onclick="event.stopPropagation(); PublicPanelRenderer.togglePanel(this)" style="width: auto; min-width: 100px; flex-shrink: 0; margin-left: 1rem;">
                    ▼ Lire
                </button>
            </div>
            
            <div class="tips-panel-content" style="display: none;">
                ${this.parseMarkdown(tip.content)}
            </div>
            
            <div class="tips-panel-actions" style="display: none;">
                <button class="panel-btn" onclick="PublicPanelRenderer.copyTip(this, '${this.escapeHtml(tip.title)}')">
                    📋 Copier
                </button>
                <button class="panel-btn" onclick="PublicPanelRenderer.shareTip(this, '${this.escapeHtml(tip.title)}')">
                    🔗 Partager
                </button>
                <button class="panel-btn" onclick="PublicPanelRenderer.printTip(this)">
                    🖨️ Imprimer
                </button>
            </div>
        `;

        // Gérer les événements de toggle
        const header = panel.querySelector('.tips-panel-header');
        const content = panel.querySelector('.tips-panel-content');
        const actions = panel.querySelector('.tips-panel-actions');
        const toggleBtn = panel.querySelector('.panel-btn');

        let isOpen = false;
        header.style.cursor = 'pointer';
        
        const toggleContent = () => {
            isOpen = !isOpen;
            if (isOpen) {
                content.style.display = 'block';
                actions.style.display = 'flex';
                toggleBtn.textContent = '▲ Fermer';
                toggleBtn.style.transform = 'rotate(180deg)';
                content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                content.style.display = 'none';
                actions.style.display = 'none';
                toggleBtn.textContent = '▼ Lire';
                toggleBtn.style.transform = 'rotate(0deg)';
            }
        };

        header.addEventListener('click', toggleContent);
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleContent();
        });

        return panel;
    },

    /**
     * Parse le markdown simple en HTML
     * @param {string} content - Contenu markdown
     * @returns {string}
     */
    parseMarkdown(content) {
        if (!content) return '';
        
        let html = this.escapeHtml(content)
            // Titres
            .replace(/^### (.*?)$/gm, '<h4 style="color: #0ef; margin-top: 1rem; margin-bottom: 0.5rem;">$1</h4>')
            .replace(/^## (.*?)$/gm, '<h3 style="color: #0ef; margin-top: 1.5rem; margin-bottom: 0.8rem;">$2</h3>')
            .replace(/^# (.*?)$/gm, '<h2 style="color: #0ef; margin-top: 2rem; margin-bottom: 1rem;">$1</h2>')
            // Gras
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0ef;">$1</strong>')
            .replace(/__(.*?)__/g, '<strong style="color: #0ef;">$1</strong>')
            // Italique
            .replace(/\*(.*?)\*/g, '<em style="color: #ccc;">$1</em>')
            .replace(/_(.*?)_/g, '<em style="color: #ccc;">$1</em>')
            // Code inline
            .replace(/`(.*?)`/g, '<code style="background: rgba(0, 238, 255, 0.1); color: #0ef; padding: 0.2rem 0.5rem; border-radius: 0.3rem; font-family: monospace; font-size: 0.9rem;">$1</code>')
            // Listes ordonnées
            .replace(/^\d+\. (.*?)$/gm, '<li style="margin-left: 2rem; margin-bottom: 0.5rem;">$1</li>')
            // Listes à puces
            .replace(/^- (.*?)$/gm, '<li style="margin-left: 2rem; margin-bottom: 0.5rem;">• $1</li>')
            // Liens
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #0ef; text-decoration: underline; font-weight: 600;">$1</a>')
            // Paragraphes
            .replace(/\n\n/g, '</p><p style="margin-bottom: 1rem;">')
            .replace(/\n/g, '<br>')
            .replace(/<li/g, '<ul style="list-style: none; margin: 0.5rem 0;"><li')
            .replace(/(<li.*?<\/li>)/g, '$1</ul>');

        return `<p style="margin-bottom: 1rem; line-height: 1.8; color: #ccc;">${html}</p>`;
    },

    /**
     * Échappe les caractères HTML
     * @param {string} text - Texte à échapper
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Formate la date
     * @param {string|Date} date - Date à formater
     * @returns {string}
     */
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Toggle le panel astuce
     * @param {HTMLElement} btn - Bouton toggle
     */
    togglePanel(btn) {
        const panel = btn.closest('.tips-panel');
        const content = panel.querySelector('.tips-panel-content');
        const actions = panel.querySelector('.tips-panel-actions');

        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        actions.style.display = isHidden ? 'flex' : 'none';
        btn.textContent = isHidden ? '▲ Fermer' : '▼ Lire';
    },

    /**
     * Copie le contenu de l'astuce
     * @param {HTMLElement} btn - Bouton copier
     * @param {string} title - Titre de l'astuce
     */
    copyTip(btn, title) {
        const panel = btn.closest('.tips-panel');
        const content = panel.querySelector('.tips-panel-content').innerText;
        const fullText = `${title}\n\n${content}`;

        navigator.clipboard.writeText(fullText).then(() => {
            NotificationSystem.success('✅ Astuce copiée !');
            btn.textContent = '✓ Copié !';
            setTimeout(() => {
                btn.textContent = '📋 Copier';
            }, 2000);
        }).catch(() => {
            NotificationSystem.error('❌ Erreur copie');
        });
    },

    /**
     * Partage l'astuce
     * @param {HTMLElement} btn - Bouton partager
     * @param {string} title - Titre de l'astuce
     */
    shareTip(btn, title) {
        if (navigator.share) {
            navigator.share({
                title: 'Astuce Valdes Tech',
                text: title,
                url: window.location.href
            }).then(() => {
                NotificationSystem.success('✅ Astuce partagée !');
            }).catch(err => {
                console.log('Partage annulé');
            });
        } else {
            // Fallback : copier le lien
            const url = `${window.location.origin}${window.location.pathname}#tips`;
            navigator.clipboard.writeText(url).then(() => {
                NotificationSystem.success('✅ Lien copié !');
            });
        }
    },

    /**
     * Imprime l'astuce
     * @param {HTMLElement} btn - Bouton imprimer
     */
    printTip(btn) {
        const panel = btn.closest('.tips-panel');
        const title = panel.querySelector('.tips-panel-title').textContent;
        const content = panel.querySelector('.tips-panel-content').innerHTML;

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        padding: 2rem;
                    }
                    h2 { color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 0.5rem; }
                    h3 { color: #0066cc; }
                    code { background: #f5f5f5; padding: 0.2rem 0.5rem; border-radius: 0.3rem; }
                    strong { color: #0066cc; }
                    @media print {
                        body { padding: 1rem; }
                    }
                </style>
            </head>
            <body>
                <h2>${title}</h2>
                <div class="content">${content}</div>
                <hr style="margin-top: 2rem;">
                <p style="text-align: center; color: #999; font-size: 0.9rem;">
                    Astuce de <strong>Valdes Tech</strong> - ${new Date().toLocaleDateString('fr-FR')}
                </p>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }
};

console.log('✅ Adaptateur design admin panel chargé');
