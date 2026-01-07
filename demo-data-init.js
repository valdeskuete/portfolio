/**
 * ========== SYSTÈME DE DÉMO - INITIALISATION COMPLÈTE ==========
 * Templates personnalisés pour les 10 sections + données de démo
 */

// Configuration des données de démo
const DEMO_CONFIG = {
    enableDemoMode: true, // Mettre à false en production
    clearExisting: false, // true pour remplacer les données existantes
};

// ==================== TEMPLATES POUR LES 10 SECTIONS ====================

// 1. STATISTIQUES
const DEMO_STATS = [
    {
        number: "+500",
        label: "Interventions Réussies",
        icon: "fa-solid fa-wrench",
        color: "#0ef",
        priority: 1
    },
    {
        number: "98%",
        label: "Clients Satisfaits",
        icon: "fa-solid fa-face-smile",
        color: "#4ade80",
        priority: 2
    },
    {
        number: "24/7",
        label: "Support Disponible",
        icon: "fa-solid fa-headset",
        color: "#fbbf24",
        priority: 3
    },
    {
        number: "15min",
        label: "Temps Moyen Réponse",
        icon: "fa-solid fa-clock",
        color: "#f87171",
        priority: 4
    }
];

// 2. LABORATOIRE IT
const DEMO_LAB = [
    {
        title: "Automatisation Déploiement Serveurs",
        category: "automatisation",
        description: "Script PowerShell complet pour le déploiement automatique de serveurs Windows avec configuration réseau, sécurité et applications préinstallées.",
        technologies: ["PowerShell", "Windows Server", "Active Directory"],
        demo: "https://github.com/valdeskuete/server-deploy",
        github: "https://github.com/valdeskuete/server-deploy",
        priority: 5
    },
    {
        title: "Infrastructure Docker Sécurisée",
        category: "infrastructure",
        description: "Stack Docker complète avec reverse proxy, monitoring, et sécurité renforcée pour applications d'entreprise.",
        technologies: ["Docker", "Nginx", "Prometheus", "Let's Encrypt"],
        demo: "https://demo.infra.valdestech.com",
        github: "https://github.com/valdeskuete/docker-secure-infra",
        priority: 4
    },
    {
        title: "Système Détection Intrusions",
        category: "securite",
        description: "Solution de monitoring et détection d'intrusions en temps réel avec alertes et rapports automatisés.",
        technologies: ["Python", "Snort", "Elasticsearch", "Kibana"],
        demo: "",
        github: "https://github.com/valdeskuete/ids-system",
        priority: 3
    },
    {
        title: "Backup Automatisé Cloud Hybride",
        category: "cloud",
        description: "Stratégie de sauvegarde 3-2-1 avec synchronisation cloud et restauration rapide.",
        technologies: ["Bash", "AWS S3", "Rclone", "Cron"],
        demo: "",
        github: "https://github.com/valdeskuete/hybrid-backup",
        priority: 2
    }
];

// 3. BLOG
const DEMO_BLOG = [
    {
        title: "Guide Complet Sécurité Windows 11",
        content: `## Introduction
La sécurité de Windows 11 est un enjeu majeur pour les entreprises.

## Configuration de base
1. Activer Windows Defender
2. Configurer le pare-feu
3. Mettre à jour régulièrement

## Bonnes pratiques
- Utiliser des mots de passe forts
- Activer l'authentification à deux facteurs
- Sauvegarder régulièrement`,
        excerpt: "Découvrez les 10 étapes essentielles pour sécuriser votre Windows 11 professionnellement.",
        tags: ["Sécurité", "Windows", "Guide"],
        author: "Valdes Kuete",
        published: true
    },
    {
        title: "Optimisation Performance Réseau",
        content: `## Analyse des performances
Comment mesurer et améliorer votre réseau.

## Outils de diagnostic
- Ping, Traceroute
- Wireshark
- iPerf

## Optimisations
- Configuration DNS
- QoS (Quality of Service)
- Ségmentation réseau`,
        excerpt: "Techniques avancées pour optimiser les performances de votre infrastructure réseau.",
        tags: ["Réseau", "Performance", "Outils"],
        author: "Valdes Kuete",
        published: true
    }
];

// 4. CERTIFICATIONS
const DEMO_CERTS = [
    {
        name: "Microsoft Certified: Azure Administrator",
        issuer: "Microsoft",
        date: new Date('2024-06-15'),
        level: "Associate",
        credential: "https://learn.microsoft.com/credentials/azure-admin",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/200px-Microsoft_logo_%282012%29.svg.png"
    },
    {
        name: "CompTIA Security+",
        issuer: "CompTIA",
        date: new Date('2024-03-20'),
        level: "Professional",
        credential: "https://www.comptia.org/certifications/security",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/CompTIA_Logo.svg/200px-CompTIA_Logo.svg.png"
    }
];

// 5. PARTENAIRES
const DEMO_PARTNERS = [
    {
        name: "TechCorp Solutions",
        logo: "https://via.placeholder.com/150x60/0ef/ffffff?text=TechCorp",
        url: "https://techcorp.example.com",
        category: "fournisseur",
        active: true
    },
    {
        name: "Entreprise ABC",
        logo: "https://via.placeholder.com/150x60/323946/ffffff?text=ABC+Corp",
        url: "https://abccorp.example.com",
        category: "client",
        active: true
    }
];

// 6. ASTUCES
const DEMO_TIPS = [
    {
        titre: "Optimiser le Démarrage Windows",
        categorie: "os",
        difficulte: "debutant",
        description: "Accélérer le temps de démarrage de Windows en désactivant les services inutiles.",
        etapes: [
            "Ouvrir MSConfig (Win + R, taper msconfig)",
            "Onglet Services, cocher 'Masquer tous les services Microsoft'",
            "Désactiver les services non essentiels",
            "Redémarrer l'ordinateur"
        ],
        conseil: "Ne désactivez jamais les services Microsoft sans vérification",
        temps: "10 minutes"
    },
    {
        titre: "Configurer le Pare-feu Avancé",
        categorie: "security",
        difficulte: "intermediaire",
        description: "Mettre en place des règles de pare-feu personnalisées pour une sécurité renforcée.",
        etapes: [
            "Ouvrir Pare-feu Windows Defender",
            "Cliquez sur 'Règles de trafic entrant avancées'",
            "Créez une nouvelle règle",
            "Spécifiez le port et le protocole",
            "Appliquez aux profils public/privé"
        ],
        conseil: "Testez toujours les règles avant déploiement",
        temps: "20 minutes"
    }
];

// 7. TÉMOIGNAGES (NOUVEAU)
const DEMO_TESTIMONIALS = [
    {
        nom: "Entreprise TechCorp Douala",
        texte: "Valdes a sauvé notre infrastructure IT après une panne critique. Intervention rapide, professionnalisme et solutions durables. Depuis 6 mois, tout fonctionne parfaitement !",
        date: new Date('2025-11-15'),
        note: 5,
        service: "Infrastructure & Sécurité",
        approved: true
    },
    {
        nom: "M. Jean Kotto",
        texte: "Excellent technicien ! Il a optimisé mon réseau domestique et configuré mon serveur NAS. Explications claires, tarifs raisonnables. Je recommande vivement.",
        date: new Date('2025-10-20'),
        note: 5,
        service: "Réseau Domestique",
        approved: true
    },
    {
        nom: "Société ABC Logistics",
        texte: "Maintenance préventive de notre parc informatique. Rapport détaillé fourni, vulnérabilités identifiées et corrigées. Service 5 étoiles.",
        date: new Date('2025-09-10'),
        note: 5,
        service: "Maintenance Préventive",
        approved: true
    }
];

// 8. À PROPOS (NOUVEAU)
const DEMO_ABOUT = {
    whoAmI: "Je suis Valdes Kuete, technicien informatique passionné basé à Douala. Avec plus de 5 ans d'expérience en maintenance, réseaux et sécurité IT, j'accompagne les entreprises et particuliers dans la sécurisation et l'optimisation de leurs infrastructures informatiques. Mon approche combine expertise technique, réactivité et pédagogie pour des solutions durables et adaptées à vos besoins.",
    myJourney: "Formé à l'IUGET en BTS Réseaux et Sécurité, j'ai commencé comme technicien support avant de monter en compétences sur des projets d'infrastructure complexes. J'ai travaillé avec des PME, des écoles et des entreprises de logistique, développant une expertise polyvalente sur Windows, Linux et les réseaux d'entreprise.",
    mission: "Mon objectif est de rendre la technologie accessible et sécurisée pour tous. Je m'engage à fournir des solutions fiables, transparentes et adaptées à votre budget, avec un support continu et des formations pour autonomiser vos équipes.",
    values: ["Transparence totale sur les coûts et délais|Solutions sur mesure, pas de vente forcée|Support réactif et continu|Formation et autonomisation des clients|Sécurité comme priorité absolue"]
};

// 9. PROJETS PORTFOLIO (NOUVEAU)
const DEMO_PORTFOLIO = [
    {
        titre: "Migration Windows Server 2012 vers 2022",
        tag: "Mise à jour",
        challenge: "Le client avait un serveur obsolète avec des failles de sécurité critiques et des performances dégradées.",
        solution: "Migration progressive vers Windows Server 2022, migration des données, configuration des sauvegardes automatisées et formation de l'administrateur.",
        resultat: "Serveur sécurisé, performances +40%, sauvegardes automatiques quotidiennes. Aucune interruption de service pendant la migration.",
        image: "https://via.placeholder.com/600x400/0ef/ffffff?text=Migration+Server",
        github: "",
        demo: "",
        likes: 12
    },
    {
        titre: "Infrastructure Docker pour Startup",
        tag: "Reprogrammation",
        challenge: "Développer une infrastructure scalable pour une application web avec contraintes de budget serrées.",
        solution: "Stack Docker avec Nginx reverse proxy, base de données PostgreSQL, monitoring avec Prometheus et déploiement continu via GitHub Actions.",
        resultat: "Infrastructure 100% automatisée, coûts réduits de 60%, déploiement en 2 minutes au lieu de 2 heures. Haute disponibilité garantie.",
        image: "https://via.placeholder.com/600x400/323946/ffffff?text=Docker+Infra",
        github: "https://github.com/valdeskuete/startup-infra",
        demo: "https://demo.startup.example.com",
        likes: 25
    },
    {
        titre: "Récupération Données Disque Endommagé",
        tag: "Récupération",
        challenge: "Disque dur d'un comptable avec 10 ans de données financières, totalement inaccessible.",
        solution: "Utilisation d'outils spécialisés (TestDisk, PhotoRec), récupération sectorielle, reconstruction de la table de partition.",
        resultat: "98% des données récupérées (500 Go), restauration complète des dossiers clients et factures. Le client a pu reprendre son travail immédiatement.",
        image: "https://via.placeholder.com/600x400/ff6b6b/ffffff?text=Récupération+Data",
        github: "",
        demo: "",
        likes: 8
    },
    {
        titre: "Audit Sécurité & Hardening",
        tag: "Sécurité",
        challenge: "Entreprise de logistique soucieuse de la conformité RGPD et de la protection des données clients.",
        solution: "Audit complet (Nessus, nmap), identification des vulnérabilités, mise en place de firewall, chiffrement des données, politique de mots de passe.",
        resultat: "Conformité RGPD atteinte, 0 vulnérabilité critique, sécurité renforcée. L'entreprise a décroché un contrat important grâce à cette certification.",
        image: "https://via.placeholder.com/600x400/4ade80/ffffff?text=Audit+Securite",
        github: "",
        demo: "",
        likes: 18
    },
    {
        titre: "Maintenance Matérielle - Parc PC",
        tag: "Maintenance matériel",
        challenge: "Parc de 50 PC ralentis, surchauffes fréquentes, pannes récurrentes.",
        solution: "Nettoyage physique complet, remplacement des pâtes thermiques, mise à jour des composants critiques (RAM, SSD), optimisation du système.",
        resultat: "Temps de démarrage divisé par 3, 0 panne depuis 6 mois, satisfaction des utilisateurs ++. ROI en 4 mois.",
        image: "https://via.placeholder.com/600x400/fbbf24/ffffff?text=Maintenance+PC",
        github: "",
        demo: "",
        likes: 15
    }
];

// 10. JOURNAL (NOUVEAU)
const DEMO_JOURNAL = [
    {
        titre: "Zero-Day Vulnerability Windows - Patch Urgent",
        resume: "Microsoft a publié un correctif critique pour une vulnérabilité zero-day exploitée activement. Application immédiate recommandée.",
        contexte: "Sécurité, Windows, Patch Management",
        contenu: "Microsoft a identifié et corrigé une vulnérabilité critique (CVE-2025-XXXX) dans Windows qui permet une élévation de privilèges. Cette faille est déjà exploitée dans le wild. Tous les systèmes Windows 10/11 et Windows Server doivent être mis à jour immédiatement. Procédez par ordre de priorité : serveurs critiques > postes de travail > environnements de test. Redémarrage requis après patch.",
        date: new Date('2025-12-01')
    },
    {
        titre: "Nouvelle Réglementation Cybersecurity 2026",
        resume: "Nouvelle directive européenne sur la sécurité des infrastructures critiques. Obligations de reporting sous 24h.",
        contexte: "Conformité, RGPD, Législation",
        contenu: "À partir de janvier 2026, toute entreprise avec plus de 50 employés ou un chiffre d'affaires > 10M€ devra déclarer les incidents de sécurité majeurs sous 24h. Les audits de sécurité annuels deviennent obligatoires pour les secteurs critiques (santé, finance, logistique). Préparez votre documentation et plan de réponse aux incidents dès maintenant.",
        date: new Date('2025-11-28')
    },
    {
        titre: "Benchmark : SSD NVMe vs SATA",
        resume: "Comparatif performance/coût pour le remplacement des disques durs traditionnels.",
        contexte: "Hardware, Performance, Optimisation",
        contenu: "Tests réalisés sur 10 configurations différentes. Résultats : NVMe offre 5-7x plus de vitesse que SATA pour un surcoût de 30-40%. Recommandation : NVMe pour les postes de travail exigeants et serveurs, SATA suffit pour le stockage de masse et sauvegardes. Temps de boot réduit de 60% en moyenne avec NVMe. ROI estimé à 6 mois pour les utilisateurs intensifs.",
        date: new Date('2025-11-25')
    }
];

// BONUS: MESSAGES & COMMENTAIRES (pour démo admin)
const DEMO_MESSAGES = [
    {
        nom: "Sophie Martin",
        email: "sophie.martin@example.com",
        telephone: "+237 6 12 34 56 78",
        sujet: "Demande de devis - Infrastructure réseau",
        message: "Bonjour, nous recherchons un prestataire pour rénover notre réseau d'entreprise (25 postes). Pourriez-vous nous faire un devis pour une infrastructure sécurisée avec VLAN et WiFi d'entreprise ?",
        date: new Date('2025-12-02'),
        lu: false
    },
    {
        nom: "Entreprise XYZ",
        email: "contact@xyz-cm.com",
        telephone: "+237 6 98 76 54 32",
        sujet: "Urgent - Panne serveur",
        message: "Notre serveur de fichiers est inaccessible depuis ce matin. Impossible d'accéder aux données critiques. Pouvez-vous intervenir en urgence ?",
        date: new Date('2025-12-01'),
        lu: true
    }
];

const DEMO_COMMENTS = [
    {
        projectId: "projet-migration-001",
        userId: "user-demo-001",
        userName: "Jean Dupont",
        text: "Super projet ! J'aimerais en savoir plus sur la méthodologie de migration.",
        date: new Date('2025-11-20'),
        likes: 3
    },
    {
        projectId: "projet-docker-002",
        userId: "user-demo-002",
        userName: "Marie Claire",
        text: "Très intéressant. Quels sont les coûts mensuels pour cette infrastructure ?",
        date: new Date('2025-11-22'),
        likes: 2
    }
];

/**
 * Initialiser TOUTES les données de démo (10 sections complètes)
 */
async function initializeDemoData() {
    console.log('🚀 INITIALISATION COMPLÈTE DES 10 SECTIONS...');
    
    if (!DEMO_CONFIG.enableDemoMode) {
        console.log('⚠️ Mode démo désactivé');
        return;
    }

    if (!window.db || !window.Firebase) {
        console.error('❌ Firebase non initialisé');
        return;
    }

    try {
        if (!window.isAdmin) {
            console.error('❌ Admin requis');
            return;
        }

        console.log('✅ Admin vérifié');

        // 1. Statistiques
        console.log('📊 1/10 - Statistiques...');
        for (const stat of DEMO_STATS) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "statistiques"),
                stat
            );
        }

        // 2. Laboratoire IT
        console.log('🔬 2/10 - Laboratoire IT...');
        for (const lab of DEMO_LAB) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "laboratoire"),
                lab
            );
        }

        // 3. Blog
        console.log('📝 3/10 - Blog...');
        for (const blog of DEMO_BLOG) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "blog"),
                { ...blog, date: window.Firebase.serverTimestamp() }
            );
        }

        // 4. Certifications
        console.log('🎓 4/10 - Certifications...');
        for (const cert of DEMO_CERTS) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "certifications"),
                cert
            );
        }

        // 5. Partenaires
        console.log('🤝 5/10 - Partenaires...');
        for (const partner of DEMO_PARTNERS) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "partenaires"),
                partner
            );
        }

        // 6. Astuces
        console.log('💡 6/10 - Astuces...');
        for (const tip of DEMO_TIPS) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "tips"),
                { ...tip, date: window.Firebase.serverTimestamp() }
            );
        }

        // 7. Témoignages (NOUVEAU)
        console.log('⭐ 7/10 - Témoignages...');
        for (const testimonial of DEMO_TESTIMONIALS) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "testimonials"),
                testimonial
            );
        }

        // 8. À Propos (NOUVEAU)
        console.log('👤 8/10 - À Propos...');
        await window.Firebase.setDoc(
            window.Firebase.doc(window.db, "about", "main"),
            DEMO_ABOUT
        );

        // 9. Projets Portfolio (NOUVEAU)
        console.log('🚀 9/10 - Projets Portfolio...');
        for (const project of DEMO_PORTFOLIO) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "projets"),
                project
            );
        }

        // 10. Journal (NOUVEAU)
        console.log('📰 10/10 - Journal...');
        for (const article of DEMO_JOURNAL) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "journal"),
                article
            );
        }

        // BONUS: Messages & Commentaires
        console.log('📧 BONUS - Messages & Commentaires...');
        for (const message of DEMO_MESSAGES) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "messages"),
                message
            );
        }
        for (const comment of DEMO_COMMENTS) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "comments"),
                comment
            );
        }

        console.log('🎉 ✅ TOUTES LES 10 SECTIONS SONT PRÉTES !');
        console.log('🔄 Actualisez la page pour voir le portfolio complet');

        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.success('✅ 10 sections complètes initialisées !');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.error('❌ Erreur: ' + error.message);
        }
    }
}

/**
 * Bouton d'initialisation dans le panneau admin
 */
function addDemoInitButton() {
    const adminContainer = document.querySelector('.admin-container');
    if (!adminContainer) return;

    const demoBtn = document.createElement('button');
    demoBtn.className = 'btn';
    demoBtn.style.cssText = 'background: linear-gradient(135deg, #8b5cf6, #6366f1); margin: 20px 0; width: 100%;';
    demoBtn.innerHTML = '🎲 Initialiser Données Démo (10 Sections)';
    demoBtn.onclick = async () => {
        if (confirm('⚠️ Voulez-vous vraiment initialiser les données de démo complètes ? Cela ajoutera des exemples pour toutes les 10 sections.')) {
            await initializeDemoData();
        }
    };

    const title = adminContainer.querySelector('.heading');
    if (title && title.nextSibling) {
        title.parentNode.insertBefore(demoBtn, title.nextSibling);
    }
}

// Auto-initialisation quand le panneau admin est chargé
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.isAdmin) {
            addDemoInitButton();
        }
    }, 3000);
});

// Export pour utilisation manuelle si besoin
if (typeof window !== 'undefined') {
    window.initializeDemoData = initializeDemoData;
    window.DEMO_CONFIG = DEMO_CONFIG;
}
