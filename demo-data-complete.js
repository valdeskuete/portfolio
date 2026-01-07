/**
 * ========== TEMPLATES COMPLETS - 10 SECTIONS PERSONNALISÉES ==========
 * Templates personnalisés et professionnels pour toutes les sections
 */

// ==================== TEMPLATES POUR LES 10 SECTIONS ====================

// 1. TÉMOIGNAGES (TESTIMONIALS) - Templates personnalisés
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

// 2. À PROPOS (ABOUT) - Templates personnalisés
const DEMO_ABOUT = {
    whoAmI: "Je suis Valdes Kuete, technicien informatique passionné basé à Douala. Avec plus de 5 ans d'expérience en maintenance, réseaux et sécurité IT, j'accompagne les entreprises et particuliers dans la sécurisation et l'optimisation de leurs infrastructures informatiques. Mon approche combine expertise technique, réactivité et pédagogie pour des solutions durables et adaptées à vos besoins.",
    myJourney: "Formé à l'IUGET en BTS Réseaux et Sécurité, j'ai commencé comme technicien support avant de monter en compétences sur des projets d'infrastructure complexes. J'ai travaillé avec des PME, des écoles et des entreprises de logistique, développant une expertise polyvalente sur Windows, Linux et les réseaux d'entreprise.",
    mission: "Mon objectif est de rendre la technologie accessible et sécurisée pour tous. Je m'engage à fournir des solutions fiables, transparentes et adaptées à votre budget, avec un support continu et des formations pour autonomiser vos équipes.",
    values: ["Transparence totale sur les coûts et délais|Solutions sur mesure, pas de vente forcée|Support réactif et continu|Formation et autonomisation des clients|Sécurité comme priorité absolue"]
};

// 3. PROJETS (PORTFOLIO) - Templates personnalisés
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

// 4. JOURNAL (JOURNAL) - Templates personnalisés
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

// 5. MESSAGES (CONTACT) - Templates de démo
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

// 6. COMMENTAIRES (COMMENTS) - Templates de démo
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
 * Fonction pour initialiser TOUTES les données de démo (10 sections complètes)
 */
async function initializeAllDemoData() {
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

        // 1. Statistiques (déjà fait)
        console.log('📊 1/10 - Statistiques...');
        for (const stat of DEMO_STATS) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "statistiques"),
                stat
            );
        }

        // 2. Laboratoire IT (déjà fait)
        console.log('🔬 2/10 - Laboratoire IT...');
        for (const lab of DEMO_LAB) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "laboratoire"),
                lab
            );
        }

        // 3. Blog (déjà fait)
        console.log('📝 3/10 - Blog...');
        for (const blog of DEMO_BLOG) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "blog"),
                { ...blog, date: window.Firebase.serverTimestamp() }
            );
        }

        // 4. Certifications (déjà fait)
        console.log('🎓 4/10 - Certifications...');
        for (const cert of DEMO_CERTS) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "certifications"),
                cert
            );
        }

        // 5. Partenaires (déjà fait)
        console.log('🤝 5/10 - Partenaires...');
        for (const partner of DEMO_PARTNERS) {
            await window.Firebase.addDoc(
                window.Firebase.collection(window.db, "partenaires"),
                partner
            );
        }

        // 6. Astuces (déjà fait)
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

        // BONUS: Messages et Commentaires (pour démo admin)
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

// Remplacer la fonction d'initialisation dans demo-data-init.js
if (typeof window !== 'undefined') {
    window.initializeDemoData = initializeAllDemoData;
    window.DEMO_CONFIG = DEMO_CONFIG;
}