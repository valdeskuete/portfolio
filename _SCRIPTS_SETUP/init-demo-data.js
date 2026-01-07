/* ==================== INITIALISATION DONNÉES DÉMO ==================== */
// Script pour initialiser les collections Firestore avec du contenu d'exemple
// À exécuter une seule fois lors du premier setup

async function initializeDemoData() {
    console.log('🚀 Initialisation des données de démonstration...');

    if (!window.db) {
        console.error('❌ Firebase DB non disponible');
        return;
    }

    const { collection, getDocs, addDoc, serverTimestamp } = window.Firebase;
    const db = window.db;

    try {
        // 1. INITIALISER COLLECTION "ABOUT"
        console.log('📖 Vérification collection "about"...');
        const aboutSnap = await getDocs(collection(db, 'about'));
        
        if (aboutSnap.empty) {
            console.log('➕ Création du contenu "À Propos"...');
            await addDoc(collection(db, 'about'), {
                who: "Je suis Valdes Kuete, expert en maintenance informatique, réseaux et sécurité IT basé à Douala, Cameroun. Depuis plus de 5 ans, j'aide les entreprises et particuliers à sécuriser, optimiser et maintenir leurs infrastructures informatiques. Ma spécialité : transformer des environnements chaotiques en systèmes fiables et performants.",
                
                journey: "J'ai débuté comme technicien de support utilisateur avant de progresser vers l'infrastructure IT et la sécurité informatique. Cette progression m'a permis de comprendre les problèmes de bout en bout, du poste utilisateur au serveur. Chaque défi a renforcé ma conviction qu'une bonne prévention vaut mieux qu'une crise gérée d'urgence.",
                
                mission: "Mon objectif est de transformer la technologie en atout stratégique pour votre entreprise. Je ne vends pas juste du service : je construis des partenariats durables basés sur la confiance, la transparence et des résultats mesurables. La technologie doit simplifier votre vie, pas la compliquer.",
                
                values: [
                    "🔍 Diagnostic approfondi - Analyser avant d'agir, comprendre vos vrais enjeux",
                    "🛠️ Solutions pérennes - Pas de rustines temporaires, du vrai travail professionnel",
                    "🛡️ Sécurité proactive - Prévenir les incidents avant qu'ils ne vous coûtent cher",
                    "💬 Communication claire - Explications en français simple, zéro jargon",
                    "💰 Tarification transparente - Prix justes, pas de surprise à la facture",
                    "📱 Disponibilité réelle - Support réactif, vraie assistance"
                ],
                
                specializations: [
                    "🖥️ Infrastructure IT - Serveurs, stockage, virtualisation, backup",
                    "🔒 Sécurité Informatique - Audit, firewall, antivirus, conformité",
                    "🌐 Réseaux - LAN/WAN, configuration, diagnostic, optimisation",
                    "💾 Récupération Données - Disques endommagés, suppression accidentelle"
                ],
                
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('✅ Contenu "À Propos" créé');
        } else {
            console.log('✅ Collection "about" existe déjà');
        }

        // 2. INITIALISER COLLECTION "STATS"
        console.log('📊 Vérification collection "stats"...');
        const statsSnap = await getDocs(collection(db, 'stats'));
        
        if (statsSnap.empty) {
            console.log('➕ Création des statistiques...');
            const stats = [
                { number: "+500", label: "Clients Satisfaits", order: 0 },
                { number: "+1000", label: "Interventions Réussies", order: 1 },
                { number: "99.5%", label: "Taux de Satisfaction", order: 2 },
                { number: "24/7", label: "Support Disponible", order: 3 }
            ];

            for (const stat of stats) {
                await addDoc(collection(db, 'stats'), {
                    ...stat,
                    createdAt: new Date()
                });
            }
            console.log('✅ Statistiques créées');
        } else {
            console.log('✅ Collection "stats" existe déjà');
        }

        // 3. INITIALISER COLLECTION "PROJETS" (EXEMPLES)
        console.log('🚀 Vérification collection "projets"...');
        const projetsSnap = await getDocs(collection(db, 'projets'));
        
        if (projetsSnap.empty) {
            console.log('➕ Création des projets d\'exemple...');
            const projets = [
                {
                    titre: "Audit de Sécurité Réseau Entreprise",
                    tag: "Sécurité",
                    image: "images/security.jpg",
                    challenge: "Client avait des vulnérabilités réseau importantes. Infrastructure complètement exposée aux menaces externes. Aucune protection perimétrique.",
                    solution: "Audit complet de sécurité en 3 phases, installation d'un firewall professionnel, mise en place d'une VPN, segmentation réseau, configuration du contrôle d'accès et renforcement des politiques de sécurité.",
                    resultat: "Réduction de 95% des risques de sécurité, conformité aux standards atteinte, confiance accrue des clients du groupe, coûts d'assurance réduits.",
                    likes: 12,
                    date: new Date(),
                    github: "",
                    demo: ""
                },
                {
                    titre: "Remplacement Disque Dur & Optimisation",
                    tag: "Maintenance matériel",
                    image: "images/maintenance.jpg",
                    challenge: "Machine d'un petit cabinet comptable présentait un disque dur défaillant causant des ralentissements extrêmes et des blocages système. L'ordinateur était devenu inutilisable, impactant la productivité.",
                    solution: "Diagnostic complet du matériel et du BIOS. Remplacement du disque dur défaillant par un SSD haute performance (512GB NVMe). Installation d'une Windows fraîche optimisée. Restauration des données client.",
                    resultat: "Récupération complète de la machine. Performances multipliées par 10. Gain de productivité immédiat. Satisfaction client complète.",
                    likes: 8,
                    date: new Date(),
                    github: "",
                    demo: ""
                },
                {
                    titre: "Configuration Wi-Fi & Réseau Local",
                    tag: "Mise à jour",
                    image: "images/network.jpg",
                    challenge: "Bureau commercial avec 15 employés souffrait de connexions Wi-Fi instables. Internet coupaient régulièrement, impactant les communications et le travail.",
                    solution: "Audit des fréquences radio. Remplacement du routeur par un modèle professionnel dual-band. Configuration optimale des canaux et puissance. Segmentation réseau (clients vs système).",
                    resultat: "Connexion stable 24/7. Débits améliorés de 40%. Zéro coupure en 6 mois. Satisfaction totale des utilisateurs.",
                    likes: 6,
                    date: new Date(),
                    github: "",
                    demo: ""
                }
            ];

            for (const projet of projets) {
                await addDoc(collection(db, 'projets'), projet);
            }
            console.log('✅ Projets créés');
        } else {
            console.log('✅ Collection "projets" existe déjà');
        }

        // 4. INITIALISER COLLECTION "TIPS"
        console.log('💡 Vérification collection "tips"...');
        const tipsSnap = await getDocs(collection(db, 'tips'));
        
        if (tipsSnap.empty) {
            console.log('➕ Création des astuces...');
            const tips = [
                {
                    titre: "🛡️ Configurer Windows Defender Correctement",
                    categorie: "security",
                    difficulte: "debutant",
                    description: "Optimiser la protection antivirus native de Windows 11 pour une sécurité maximale",
                    etapes: [
                        "Ouvrir Paramètres > Confidentialité et sécurité > Sécurité Windows",
                        "Vérifier que la Protection en temps réel est active (vert)",
                        "Configurer les exclusions : Gestion antivirus > Options > Exclusions",
                        "Ajouter vos dossiers de confiance (développement, etc)",
                        "Planifier une analyse complète hebdomadaire"
                    ],
                    conseil: "Associer Defender avec Windows Firewall pour protection 100% gratuite et performante",
                    temps: "10 min",
                    date: serverTimestamp()
                },
                {
                    titre: "⚙️ Optimiser Drastiquement les Performances PC",
                    categorie: "os",
                    difficulte: "intermediaire",
                    description: "Augmenter la vitesse de votre ordinateur rapidement et sans logiciel payant",
                    etapes: [
                        "Nettoyer les fichiers temp : Win + R > cleanmgr > Sélectionner tout > Supprimer",
                        "Désactiver les apps au démarrage : Ctrl + Maj + Echap > Onglet Démarrage",
                        "Mettre à jour les drivers : Windows Update > Mises à jour facultatives",
                        "Désactiver les animations : Paramètres > Accessibilité > Affichage > Désactiver effets transparence",
                        "Vérifier RAM libre : Ctrl + Maj + Echap > Performance > RAM"
                    ],
                    conseil: "Si RAM < 50% libre, fermer onglets navigateur. Pour amélioration maximale : remplacer HDD par SSD",
                    temps: "20 min",
                    date: serverTimestamp()
                },
                {
                    titre: "💾 Sauvegarder Vos Données Importantes (Stratégie)",
                    categorie: "software",
                    difficulte: "debutant",
                    description: "Créer une stratégie de sauvegarde solide avec la règle 3-2-1 pour ne jamais perdre vos données",
                    etapes: [
                        "Brancher un disque dur externe USB",
                        "Paramètres > Système > Stockage > Options avancées > Paramètres de sauvegarde",
                        "Activer l'historique des fichiers avec planification quotidienne",
                        "Configurer OneDrive cloud (5GB gratuit) pour documents critiques",
                        "Tester la restauration une fois par mois"
                    ],
                    conseil: "Règle 3-2-1 : 3 copies, 2 médias différents (disque externe + cloud), 1 copie hors site",
                    temps: "15 min",
                    date: serverTimestamp()
                },
                {
                    titre: "🔒 Sécuriser Votre Connexion Internet Complètement",
                    categorie: "network",
                    difficulte: "intermediaire",
                    description: "Mettre en place un Wi-Fi sécurisé et une VPN pour protéger votre vie privée",
                    etapes: [
                        "Accéder au routeur : 192.168.1.1 (identifiants sur l'appareil)",
                        "Changer SSID en quelque chose de neutre (pas de nom personnel)",
                        "Mettre à jour le mot de passe Wi-Fi (minimum 16 caractères complexes)",
                        "Désactiver WPS : Paramètres > Sécurité WiFi > WPS Désactivé",
                        "Installer ProtonVPN gratuit pour navigation chiffrée"
                    ],
                    conseil: "Changez votre mot de passe WiFi tous les 6 mois. Une VPN gratuite suffit pour la plupart des usages",
                    temps: "25 min",
                    date: serverTimestamp()
                },
                {
                    titre: "🖥️ Nettoyer Complètement les Virus (Procédure Complète)",
                    categorie: "security",
                    difficulte: "avance",
                    description: "Éliminer les virus les plus tenaces qui résistent à l'antivirus classique",
                    etapes: [
                        "Télécharger Malwarebytes gratuit et Kaspersky Rescue Disk sur clé USB autre PC",
                        "Bootez sur Kaspersky (forcer redémarrage du PC problème)",
                        "Laisser scanner en ligne complète (peut durer 1-2 heures)",
                        "Redémarrer dans Windows normal et lancer Malwarebytes",
                        "Faire un scan complet et supprimer toutes menaces détectées"
                    ],
                    conseil: "Si virus persiste : réinitialiser Windows 11 en gardant fichiers personnels (Paramètres > Récupération)",
                    temps: "2-3 heures",
                    date: serverTimestamp()
                }
            ];

            for (const tip of tips) {
                await addDoc(collection(db, 'tips'), tip);
            }
            console.log('✅ Astuces créées avec structure améliorée');
        } else {
            console.log('✅ Collection "tips" existe déjà');
        }

        console.log('🎉 Initialisation complète !');
        alert('✅ Données de démonstration initialisées avec succès!\nRafraîchissez la page pour voir les changements.');

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        alert('❌ Erreur lors de l\'initialisation des données');
    }
}

// Exporter pour utilisation
window.initializeDemoData = initializeDemoData;

// Ajouter un bouton pour l'initialisation (optionnel, dans la console)
console.log('%c🚀 Pour initialiser les données de démonstration:', 'color: #0ef; font-weight: bold;');
console.log('%c   initializeDemoData()', 'color: #fff; font-family: monospace; background: #000; padding: 5px;');
