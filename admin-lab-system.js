/**
 * ========== SYSTÈME ADMIN SCALABLE - LABORATOIRE IT ==========
 * Gestionnaire de contenu dynamique pour toutes les nouvelles sections
 * Architecture modulaire et scalable
 */

// Configuration du système
const SYSTEM_CONFIG = {
    collections: {
        stats: { name: "statistiques", fields: ["number", "label", "icon", "color"] },
        lab: { name: "laboratoire", fields: ["title", "category", "description", "technologies", "image", "demo", "github", "priority"] },
        blog: { name: "blog", fields: ["title", "content", "excerpt", "tags", "image", "author", "published"] },
        certs: { name: "certifications", fields: ["name", "issuer", "date", "credential", "logo", "level"] },
        partners: { name: "partenaires", fields: ["name", "logo", "url", "category", "active"] }
    },
    limits: {
        stats: 6,
        lab: 12,
        blog: 20,
        certs: 10,
        partners: 15
    }
};

// Cache global pour optimiser les performances
const contentCache = {
    stats: null,
    lab: null,
    blog: null,
    certs: null,
    partners: null,
    lastUpdate: null
};

// ==================== GESTIONNAIRE DE CONTENU PRINCIPAL ====================

class ContentManager {
    constructor() {
        this.db = window.db;
        this.collections = SYSTEM_CONFIG.collections;
        this.initEventListeners();
    }

    // Initialisation des écouteurs d'événements
    initEventListeners() {
        // Écouteurs pour les formulaires admin
        this.setupFormListeners();
        
        // Écouteurs pour les filtres publics
        this.setupPublicFilters();
        
        // Écouteurs pour les actions admin
        this.setupAdminActions();
    }

    // ==================== GESTION DES STATISTIQUES ====================

    async loadStats() {
        try {
            const q = window.Firebase.query(
                window.Firebase.collection(this.db, this.collections.stats.name),
                window.Firebase.orderBy("priority", "asc")
            );
            
            return new Promise((resolve) => {
                window.Firebase.onSnapshot(q, (snapshot) => {
                    const stats = [];
                    snapshot.forEach(doc => {
                        stats.push({ id: doc.id, ...doc.data() });
                    });
                    contentCache.stats = stats;
                    this.renderStats(stats);
                    resolve(stats);
                });
            });
        } catch (error) {
            console.error("❌ Erreur chargement stats:", error);
            this.renderError("stats-grid-dynamic", "Impossible de charger les statistiques");
        }
    }

    renderStats(stats) {
        const container = document.getElementById('stats-grid-dynamic');
        if (!container) return;

        if (stats.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <p>Aucune statistique pour le moment</p>
                    ${window.isAdmin ? '<button class="empty-state-btn" onclick="openTab(\'tab-stats\')">Ajouter des stats</button>' : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = stats.map(stat => `
            <div class="stat-card" data-id="${stat.id}">
                <div class="stat-icon" style="color: ${stat.color || '#0ef'}">
                    <i class="${stat.icon || 'fa-solid fa-chart-line'}"></i>
                </div>
                <div class="stat-number">${stat.number}</div>
                <div class="stat-label">${stat.label}</div>
                ${window.isAdmin ? `
                    <div class="admin-actions">
                        <button onclick="adminSystem.deleteItem('stats', '${stat.id}')" class="btn-delete">🗑️</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // ==================== GESTION DU LABORATOIRE IT ====================

    async loadLab(filter = "all") {
        try {
            let q = window.Firebase.query(
                window.Firebase.collection(this.db, this.collections.lab.name),
                window.Firebase.orderBy("priority", "desc")
            );

            if (filter !== "all") {
                q = window.Firebase.query(q, window.Firebase.where("category", "==", filter));
            }

            return new Promise((resolve) => {
                window.Firebase.onSnapshot(q, (snapshot) => {
                    const projects = [];
                    snapshot.forEach(doc => {
                        projects.push({ id: doc.id, ...doc.data() });
                    });
                    contentCache.lab = projects;
                    this.renderLab(projects);
                    resolve(projects);
                });
            });
        } catch (error) {
            console.error("❌ Erreur chargement lab:", error);
            this.renderError("lab-grid-dynamic", "Impossible de charger les projets");
        }
    }

    renderLab(projects) {
        const container = document.getElementById('lab-grid-dynamic');
        if (!container) return;

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔬</div>
                    <p>Aucun projet dans le laboratoire</p>
                    ${window.isAdmin ? '<button class="empty-state-btn" onclick="openTab(\'tab-lab\')">Ajouter un projet</button>' : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = projects.map(project => `
            <div class="lab-card" data-id="${project.id}" data-category="${project.category}">
                <div class="lab-card-header">
                    <span class="lab-category">${this.getCategoryLabel(project.category)}</span>
                    ${project.priority ? `<span class="lab-priority">⭐ ${project.priority}</span>` : ''}
                </div>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                
                ${project.technologies ? `
                    <div class="lab-tech">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="lab-links">
                    ${project.demo ? `<a href="${project.demo}" target="_blank">🔗 Démo</a>` : ''}
                    ${project.github ? `<a href="${project.github}" target="_blank">💻 Code</a>` : ''}
                </div>

                ${window.isAdmin ? `
                    <div class="admin-actions">
                        <button onclick="adminSystem.editItem('lab', '${project.id}')" class="btn-edit">✏️</button>
                        <button onclick="adminSystem.deleteItem('lab', '${project.id}')" class="btn-delete">🗑️</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // ==================== GESTION DU BLOG ====================

    async loadBlog() {
        try {
            const q = window.Firebase.query(
                window.Firebase.collection(this.db, this.collections.blog.name),
                window.Firebase.where("published", "==", true),
                window.Firebase.orderBy("date", "desc")
            );

            return new Promise((resolve) => {
                window.Firebase.onSnapshot(q, (snapshot) => {
                    const articles = [];
                    snapshot.forEach(doc => {
                        articles.push({ id: doc.id, ...doc.data() });
                    });
                    contentCache.blog = articles;
                    this.renderBlog(articles);
                    resolve(articles);
                });
            });
        } catch (error) {
            console.error("❌ Erreur chargement blog:", error);
            this.renderError("blog-container-dynamic", "Impossible de charger les articles");
        }
    }

    renderBlog(articles) {
        const container = document.getElementById('blog-container-dynamic');
        if (!container) return;

        if (articles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <p>Aucun article publié</p>
                    ${window.isAdmin ? '<button class="empty-state-btn" onclick="openTab(\'tab-blog\')">Écrire un article</button>' : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = articles.map(article => `
            <div class="blog-card" data-id="${article.id}">
                ${article.image ? `<img src="${article.image}" alt="${article.title}" class="blog-image">` : ''}
                <div class="blog-content">
                    <h3>${article.title}</h3>
                    <p class="blog-excerpt">${article.excerpt || article.content.substring(0, 150) + '...'}</p>
                    <div class="blog-meta">
                        ${article.tags ? `<span class="blog-tags">${article.tags.map(tag => `#${tag}`).join(' ')}</span>` : ''}
                        <span class="blog-date">${new Date(article.date?.toDate?.() || Date.now()).toLocaleDateString('fr-FR')}</span>
                    </div>
                    ${window.isAdmin ? `
                        <div class="admin-actions">
                            <button onclick="adminSystem.togglePublish('${article.id}', ${!article.published})" class="btn-publish">
                                ${article.published ? '📌' : '📤'} ${article.published ? 'Dépublier' : 'Publier'}
                            </button>
                            <button onclick="adminSystem.deleteItem('blog', '${article.id}')" class="btn-delete">🗑️</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // ==================== GESTION DES CERTIFICATIONS ====================

    async loadCerts() {
        try {
            const q = window.Firebase.query(
                window.Firebase.collection(this.db, this.collections.certs.name),
                window.Firebase.orderBy("date", "desc")
            );

            return new Promise((resolve) => {
                window.Firebase.onSnapshot(q, (snapshot) => {
                    const certs = [];
                    snapshot.forEach(doc => {
                        certs.push({ id: doc.id, ...doc.data() });
                    });
                    contentCache.certs = certs;
                    this.renderCerts(certs);
                    resolve(certs);
                });
            });
        } catch (error) {
            console.error("❌ Erreur chargement certs:", error);
            this.renderError("cert-grid-dynamic", "Impossible de charger les certifications");
        }
    }

    renderCerts(certs) {
        const container = document.getElementById('cert-grid-dynamic');
        if (!container) return;

        if (certs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎓</div>
                    <p>Aucune certification</p>
                    ${window.isAdmin ? '<button class="empty-state-btn" onclick="openTab(\'tab-certs\')">Ajouter une certification</button>' : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = certs.map(cert => `
            <div class="cert-card" data-id="${cert.id}">
                ${cert.logo ? `<img src="${cert.logo}" alt="${cert.issuer}" class="cert-logo">` : ''}
                <div class="cert-content">
                    <h4>${cert.name}</h4>
                    <p class="cert-issuer">${cert.issuer}</p>
                    <p class="cert-date">${new Date(cert.date?.toDate?.() || Date.now()).toLocaleDateString('fr-FR')}</p>
                    ${cert.credential ? `<a href="${cert.credential}" target="_blank" class="cert-link">Vérifier</a>` : ''}
                    ${cert.level ? `<span class="cert-level">${cert.level}</span>` : ''}
                </div>
                ${window.isAdmin ? `
                    <div class="admin-actions">
                        <button onclick="adminSystem.deleteItem('certs', '${cert.id}')" class="btn-delete">🗑️</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // ==================== GESTION DES PARTENAIRES ====================

    async loadPartners() {
        try {
            const q = window.Firebase.query(
                window.Firebase.collection(this.db, this.collections.partners.name),
                window.Firebase.where("active", "==", true),
                window.Firebase.orderBy("name", "asc")
            );

            return new Promise((resolve) => {
                window.Firebase.onSnapshot(q, (snapshot) => {
                    const partners = [];
                    snapshot.forEach(doc => {
                        partners.push({ id: doc.id, ...doc.data() });
                    });
                    contentCache.partners = partners;
                    this.renderPartners(partners);
                    resolve(partners);
                });
            });
        } catch (error) {
            console.error("❌ Erreur chargement partenaires:", error);
            this.renderError("partners-grid-dynamic", "Impossible de charger les partenaires");
        }
    }

    renderPartners(partners) {
        const container = document.getElementById('partners-grid-dynamic');
        if (!container) return;

        if (partners.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🤝</div>
                    <p>Aucun partenaire</p>
                    ${window.isAdmin ? '<button class="empty-state-btn" onclick="openTab(\'tab-partners\')">Ajouter un partenaire</button>' : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = partners.map(partner => `
            <div class="partner-card" data-id="${partner.id}">
                <a href="${partner.url}" target="_blank" class="partner-link">
                    <img src="${partner.logo}" alt="${partner.name}" class="partner-logo">
                    <span class="partner-name">${partner.name}</span>
                </a>
                ${window.isAdmin ? `
                    <div class="admin-actions">
                        <button onclick="adminSystem.deleteItem('partners', '${partner.id}')" class="btn-delete">🗑️</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    getCategoryLabel(category) {
        const labels = {
            infrastructure: "Infrastructure",
            securite: "Sécurité",
            automatisation: "Automatisation",
            cloud: "Cloud & Réseau"
        };
        return labels[category] || category;
    }

    renderError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="empty-state" style="color: #ff6666;">
                    <div class="empty-state-icon">⚠️</div>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    // ==================== GESTIONNAIRE DE FORMULAIRES ====================

    setupFormListeners() {
        // Formulaire Statistiques
        const statsForm = document.getElementById('stats-form');
        if (statsForm) {
            statsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = {
                    number: document.getElementById('stat-number').value,
                    label: document.getElementById('stat-label').value,
                    icon: document.getElementById('stat-icon')?.value || 'fa-solid fa-chart-line',
                    color: document.getElementById('stat-color')?.value || '#0ef',
                    priority: parseInt(document.getElementById('stat-priority')?.value || '1')
                };
                await this.addItem('stats', data);
                statsForm.reset();
            });
        }

        // Formulaire Laboratoire
        const labForm = document.getElementById('lab-form');
        if (labForm) {
            labForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = {
                    title: document.getElementById('lab-title').value,
                    category: document.getElementById('lab-category').value,
                    description: document.getElementById('lab-description').value,
                    technologies: document.getElementById('lab-technologies')?.value.split(',').map(t => t.trim()).filter(t => t),
                    image: document.getElementById('lab-image')?.value,
                    demo: document.getElementById('lab-demo')?.value,
                    github: document.getElementById('lab-github')?.value,
                    priority: parseInt(document.getElementById('lab-priority')?.value || '1')
                };
                await this.addItem('lab', data);
                labForm.reset();
            });
        }

        // Formulaire Blog
        const blogForm = document.getElementById('blog-form');
        if (blogForm) {
            blogForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = {
                    title: document.getElementById('blog-title').value,
                    content: document.getElementById('blog-content').value,
                    excerpt: document.getElementById('blog-excerpt')?.value,
                    tags: document.getElementById('blog-tags')?.value.split(',').map(t => t.trim()).filter(t => t),
                    image: document.getElementById('blog-image')?.value,
                    author: document.getElementById('blog-author')?.value || 'Valdes Kuete',
                    published: document.getElementById('blog-published')?.checked || false,
                    date: window.Firebase.serverTimestamp()
                };
                await this.addItem('blog', data);
                blogForm.reset();
            });
        }

        // Formulaire Certifications
        const certForm = document.getElementById('cert-form');
        if (certForm) {
            certForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = {
                    name: document.getElementById('cert-name').value,
                    issuer: document.getElementById('cert-issuer').value,
                    date: new Date(document.getElementById('cert-date').value),
                    credential: document.getElementById('cert-credential')?.value,
                    logo: document.getElementById('cert-logo')?.value,
                    level: document.getElementById('cert-level')?.value
                };
                await this.addItem('certs', data);
                certForm.reset();
            });
        }

        // Formulaire Partenaires
        const partnerForm = document.getElementById('partner-form');
        if (partnerForm) {
            partnerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = {
                    name: document.getElementById('partner-name').value,
                    logo: document.getElementById('partner-logo').value,
                    url: document.getElementById('partner-url').value,
                    category: document.getElementById('partner-category')?.value || 'client',
                    active: true
                };
                await this.addItem('partners', data);
                partnerForm.reset();
            });
        }
    }

    // ==================== FILTRES PUBLICS ====================

    setupPublicFilters() {
        // Filtres Laboratoire
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('lab-filter')) {
                document.querySelectorAll('.lab-filter').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                const category = e.target.dataset.category;
                this.loadLab(category);
            }
        });
    }

    // ==================== ACTIONS ADMIN ====================

    setupAdminActions() {
        // Gestion des onglets admin
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn') && e.target.dataset.tab) {
                this.loadTabData(e.target.dataset.tab);
            }
        });
    }

    // ==================== OPÉRATIONS CRUD ====================

    async addItem(collection, data) {
        if (!window.isAdmin) {
            alert("Accès refusé. Connexion admin requise.");
            return;
        }

        try {
            // Vérification des limites
            const limit = SYSTEM_CONFIG.limits[collection];
            if (contentCache[collection] && contentCache[collection].length >= limit) {
                alert(`⚠️ Limite atteinte: ${limit} éléments maximum pour ${collection}`);
                return;
            }

            await window.Firebase.addDoc(
                window.Firebase.collection(this.db, this.collections[collection].name),
                data
            );

            this.showNotification(`✅ ${collection} ajouté avec succès`, 'success');
        } catch (error) {
            console.error(`❌ Erreur ajout ${collection}:`, error);
            this.showNotification(`❌ Erreur: ${error.message}`, 'error');
        }
    }

    async editItem(collection, id) {
        if (!window.isAdmin) return;

        const item = contentCache[collection]?.find(i => i.id === id);
        if (!item) return;

        // Ouvrir un modal d'édition simple
        const newData = prompt(`Modifier ${collection} (JSON):`, JSON.stringify(item, null, 2));
        if (!newData) return;

        try {
            const parsed = JSON.parse(newData);
            await window.Firebase.updateDoc(
                window.Firebase.doc(this.db, this.collections[collection].name, id),
                parsed
            );
            this.showNotification(`✅ ${collection} modifié`, 'success');
        } catch (error) {
            alert(`❌ Erreur: ${error.message}`);
        }
    }

    async deleteItem(collection, id) {
        if (!window.isAdmin) return;

        if (!confirm(`⚠️ Supprimer définitivement cet élément de ${collection} ?`)) return;

        try {
            await window.Firebase.deleteDoc(
                window.Firebase.doc(this.db, this.collections[collection].name, id)
            );
            this.showNotification(`✅ ${collection} supprimé`, 'success');
        } catch (error) {
            console.error(`❌ Erreur suppression ${collection}:`, error);
            this.showNotification(`❌ Erreur: ${error.message}`, 'error');
        }
    }

    async togglePublish(id, currentState) {
        if (!window.isAdmin) return;

        try {
            await window.Firebase.updateDoc(
                window.Firebase.doc(this.db, this.collections.blog.name, id),
                { published: currentState }
            );
            this.showNotification(`✅ Article ${currentState ? 'publié' : 'dépublié'}`, 'success');
        } catch (error) {
            this.showNotification(`❌ Erreur: ${error.message}`, 'error');
        }
    }

    // ==================== CHARGEMENT PAR ONGLET ====================

    loadTabData(tabName) {
        switch(tabName) {
            case 'tab-stats':
                this.loadStats();
                break;
            case 'tab-lab':
                this.loadLab();
                break;
            case 'tab-blog':
                this.loadBlog();
                break;
            case 'tab-certs':
                this.loadCerts();
                break;
            case 'tab-partners':
                this.loadPartners();
                break;
        }
    }

    // ==================== NOTIFICATIONS ====================

    showNotification(message, type = 'info') {
        if (typeof NotificationSystem !== 'undefined') {
            if (type === 'success') NotificationSystem.success(message);
            else if (type === 'error') NotificationSystem.error(message);
            else NotificationSystem.info(message);
        } else {
            alert(message);
        }
    }
}

// ==================== INITIALISATION DU SYSTÈME ====================

let adminSystem;

function initAdminSystem() {
    console.log('🚀 Initialisation du système admin scalable...');
    
    // Attendre que Firebase soit prêt
    if (window.db && window.isAdmin !== undefined) {
        adminSystem = new ContentManager();
        
        // Charger toutes les données initiales
        setTimeout(() => {
            if (window.isAdmin) {
                adminSystem.loadStats();
                adminSystem.loadLab();
                adminSystem.loadBlog();
                adminSystem.loadCerts();
                adminSystem.loadPartners();
            } else {
                // Chargement public
                adminSystem.loadStats();
                adminSystem.loadLab();
                adminSystem.loadBlog();
                adminSystem.loadCerts();
                adminSystem.loadPartners();
            }
        }, 1000);
        
        console.log('✅ Système admin prêt');
    } else {
        console.log('⏳ Attente de Firebase...');
        setTimeout(initAdminSystem, 500);
    }
}

// Démarrer le système quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminSystem);
} else {
    initAdminSystem();
}

// Exposer globalement
window.adminSystem = null;
window.initAdminSystem = initAdminSystem;