/* ==================== TEMPLATES PROJETS ==================== */

// 🔐 SÉCURITÉ: Wrapper pour les actions admin protégées
async function requireAdminAccess(actionName, actionFunction) {
    if (!window.AdminAuth) {
        console.error('❌ [AdminFeatures] AdminAuth not available');
        return false;
    }
    
    return await window.AdminAuth.protectedAdminAction(actionName, actionFunction);
}

const projectTemplates = {
    maintenance: {
        title: "Remplacement Disque Dur [Client]",
        tag: "Maintenance matériel",
        image: "images/maintenance.jpg",
        challenge: "Le client présentait un disque dur défaillant causant des ralentissements extrêmes et des blocages système. L'ordinateur était devenu inutilisable.",
        solution: "Diagnostic complet du matériel, diagnostic du BIOS, remplacement du disque dur défaillant par un SSD haute performance, installation d'une OS fraîche et restauration des données.",
        result: "Récupération complète de la machine, performances multipliées par 10, gain de productivité immédiat pour le client."
    },
    securite: {
        title: "Audit de Sécurité Réseau Entreprise",
        tag: "Sécurité",
        image: "images/security.jpg",
        challenge: "Client avait des vulnérabilités réseau importantes et zéro protection contre les menaces externes. Infrastructure complètement exposée.",
        solution: "Audit complet de sécurité, installation d'un firewall professionnel, mise en place d'une VPN, segmentation réseau, configuration du contrôle d'accès.",
        result: "Réduction de 95% des risques de sécurité, conformité aux standards atteinte, confiance accrue des clients."
    },
    reprogrammation: {
        title: "Reprogrammation Logiciel [Application]",
        tag: "Reprogrammation",
        image: "images/programming.jpg",
        challenge: "L'application existante avait de nombreux bugs, était lente et peu maintenable. Code hérité et mal structuré.",
        solution: "Analyse complète du code, restructuration architecturale, correction des bugs critiques, optimisation des performances, implémentation de bonnes pratiques.",
        result: "Application 5x plus rapide, zéro bugs critiques, code maintenable et scalable pour les évolutions futures."
    },
    recuperation: {
        title: "Récupération de Données Disque Endommagé",
        tag: "Récupération",
        image: "images/recovery.jpg",
        challenge: "Client avait perdu accès à un disque contenant des fichiers importants après une défaillance hardware. Données critiques en jeu.",
        solution: "Utilisation d'outils de récupération avancés, extraction des données en laboratoire, vérification d'intégrité, restauration sécurisée.",
        result: "100% des données critiques récupérées, client satisfait, aucune perte de continuité d'activité."
    }
};

async function loadTemplate(type) {
    // 🔐 Vérifier les droits admin
    const isAllowed = await requireAdminAccess('load_project_template', async () => {
        const template = projectTemplates[type];
        if (!template) {
            console.warn('⚠️ Template non trouvé:', type);
            return false;
        }
        
        document.getElementById('p-title').value = template.title;
        document.getElementById('p-tag').value = template.tag;
        document.getElementById('p-image').value = template.image;
        document.getElementById('p-challenge').value = template.challenge;
        document.getElementById('p-solution').value = template.solution;
        document.getElementById('p-result').value = template.result;
        
        updateProjectPreview();
        console.log('✅ Template chargé:', type);
        return true;
    });
    
    if (!isAllowed) {
        console.log('🔒 [AdminFeatures] Accès template refusé');
    }
}

function updateProjectPreview() {
    const title = document.getElementById('p-title').value;
    const tag = document.getElementById('p-tag').value;
    const image = document.getElementById('p-image').value;
    const challenge = document.getElementById('p-challenge').value;
    const solution = document.getElementById('p-solution').value;
    const result = document.getElementById('p-result').value;
    
    const preview = document.getElementById('project-preview');
    
    if (!title || !challenge || !solution || !result) {
        preview.innerHTML = '<p style="color: #888; text-align: center; margin-top: 4rem;">👈 Remplissez tous les champs</p>';
        return;
    }
    
    preview.innerHTML = `
        <div style="animation: fadeIn 0.3s ease;">
            ${image ? `<img src="${image}" style="width: 100%; border-radius: 0.5rem; margin-bottom: 1rem; max-height: 200px; object-fit: cover;">` : ''}
            <h4 style="color: #0ef; margin-bottom: 0.5rem;">${title}</h4>
            <span style="background: rgba(0, 239, 255, 0.2); padding: 0.3rem 0.8rem; border-radius: 0.4rem; font-size: 0.9rem; color: #0ef;">${tag || 'Catégorie'}</span>
            
            <div style="margin-top: 1rem;">
                <p><strong style="color: #0ef;">🎯 Défi:</strong> ${challenge}</p>
                <p><strong style="color: #0ef;">⚙️ Solution:</strong> ${solution}</p>
                <p><strong style="color: #0ef;">✅ Résultat:</strong> ${result}</p>
            </div>
        </div>
    `;
}

/* ==================== TEMPLATES ASTUCES ==================== */
const tipTemplates = {
    defender: {
        title: "Configurer Windows Defender pour une Protection Optimale",
        category: "security",
        content: `**Windows Defender** est l'antivirus natif de Windows 11. Voici comment l'optimiser :

1. **Ouvrir Defender** : Paramètres > Confidentialité et sécurité > Sécurité Windows
2. **Activer la Protection en Temps Réel** : Vérifier que la protection est active
3. **Configurer les Exclusions** : Ajouter vos dossiers de confiance si besoin
4. **Planifier les Scans** : Programmer un scan complet hebdomadaire
5. **Vérifier les Virus & Menaces** : Faire un scan rapide régulièrement

💡 Conseil : Associer Defender avec un VPN pour une protection web complète.`
    },
    performance: {
        title: "Optimiser les Performances de Votre PC",
        category: "os",
        content: `Votre PC est lent ? Suivez ces étapes simples :

**1. Nettoyer le Disque**
- Utiliser l'Outil de Nettoyage de Disque (Win + R > cleanmgr)
- Supprimer les fichiers temporaires

**2. Gérer les Programmes au Démarrage**
- Ctrl + Maj + Échap > Onglet Démarrage
- Désactiver les apps inutiles au démarrage

**3. Mettre à Jour les Drivers**
- Cartes graphiques, chipset, réseau
- Windows Update > Mises à jour facultatives

**4. Désactiver les Animations**
- Paramètres > Accessibilité > Affichage
- Désactiver les effets de transparence

**5. Vérifier la RAM Disponible**
- Si < 3GB libre, fermer les applications lourdes`
    },
    updates: {
        title: "Gérer les Mises à Jour Windows Efficacement",
        category: "os",
        content: `Les mises à jour Windows peuvent être frustrantes. Voici comment les gérer :

**Vérifier les Mises à Jour**
- Paramètres > Mise à jour et sécurité > Vérifier les mises à jour

**Programmer les Mises à Jour**
- Paramètres > Mise à jour et sécurité > Options avancées
- Choisir quand télécharger et installer

**Problèmes de Mise à Jour ?**
- Redémarrer l'ordinateur
- Lancer l'outil de dépannage Windows
- En dernier recours : réinitialiser Windows

**Important** : Ne jamais arrêter le PC pendant une mise à jour !`
    },
    backup: {
        title: "Sauvegarder Vos Données Importantes",
        category: "os",
        content: `Ne perdez jamais vos données ! Voici la stratégie optimale :

**Sauvegarde Locale**
1. Brancher un disque dur externe
2. Paramètres > Système > Stockage > Options avancées
3. Configurer Historique des fichiers

**Sauvegarde Cloud (Recommandé)**
- OneDrive, Google Drive, Dropbox
- Automatique et sécurisé
- Accessible depuis n'importe où

**Sauvegarde d'Image Système**
- Créer une image complète avec Macrium Reflect
- En cas de crash, restaurer intégralement

**Stratégie 3-2-1**
✅ 3 copies de vos données
✅ 2 médias différents
✅ 1 copie hors site (cloud)`
    }
};

function loadTipTemplate(type) {
    const template = tipTemplates[type];
    if (!template) return;
    
    document.getElementById('tip-title').value = template.title;
    document.getElementById('tip-category').value = template.category;
    document.getElementById('tip-content').value = template.content;
    
    updateTipPreview();
    console.log('✅ Template astuce chargé:', type);
}

function updateTipPreview() {
    const title = document.getElementById('tip-title').value;
    const category = document.getElementById('tip-category').value;
    const content = document.getElementById('tip-content').value;
    
    const preview = document.getElementById('tip-preview');
    
    if (!title || !category || !content) {
        preview.innerHTML = '<p style="color: #888; text-align: center; margin-top: 4rem;">👈 Remplissez tous les champs</p>';
        return;
    }
    
    // Convertir markdown simple en HTML
    let htmlContent = content
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #0ef;">$1</strong>')
        .replace(/\n/g, '<br>');
    
    const categoryIcons = {
        os: '🖥️',
        hardware: '⚙️',
        security: '🔒',
        error: '❌',
        network: '🌐',
        software: '📦'
    };
    
    const categoryNames = {
        os: 'Système',
        hardware: 'Matériel',
        security: 'Sécurité',
        error: 'Dépannage',
        network: 'Réseau',
        software: 'Logiciels'
    };
    
    preview.innerHTML = `
        <div style="animation: fadeIn 0.3s ease;">
            <h4 style="color: #0ef; margin-bottom: 0.5rem;">${categoryIcons[category]} ${title}</h4>
            <span style="background: rgba(0, 238, 255, 0.2); padding: 0.3rem 0.8rem; border-radius: 0.4rem; font-size: 0.9rem; color: #0ef;">
                ${categoryIcons[category]} ${categoryNames[category] || category}
            </span>
            <div style="margin-top: 1rem; line-height: 1.6; color: #ddd;">
                ${htmlContent}
            </div>
        </div>
    `;
}

/* ==================== EVENT LISTENERS POUR MISE À JOUR EN TEMPS RÉEL ==================== */
window.addEventListener('DOMContentLoaded', () => {
    // Prévisualisation en temps réel pour projets
    ['p-title', 'p-tag', 'p-image', 'p-challenge', 'p-solution', 'p-result'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateProjectPreview);
            el.addEventListener('change', updateProjectPreview);
        }
    });
    
    // Prévisualisation en temps réel pour astuces
    ['tip-title', 'tip-category', 'tip-content'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateTipPreview);
            el.addEventListener('change', updateTipPreview);
        }
    });
    
    console.log('✅ Admin features initialized');
});

/* ==================== ANIMATION CSS ==================== */
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    #project-preview, #tip-preview {
        animation: fadeIn 0.3s ease;
    }
`;
document.head.appendChild(style);
