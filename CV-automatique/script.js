// ===== GLOBAL VARIABLES =====
let currentPhotoData = null;
let currentTemplate = 'minimal';
let pageCount = 1;
let currentPageId = 1;
let zoomLevel = 100;
let pageData = {
    1: {
        type: 'profile',
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        location: '',
        about: ''
    }
};

const colorPresets = {
    modern: { primary: '#0ef', text: '#ffffff', bg: '#1f242d' },
    classic: { primary: '#1a5f7a', text: '#ffffff', bg: '#f5f5f5' },
    bold: { primary: '#ff6600', text: '#222222', bg: '#ffffff' },
    minimal: { primary: '#000000', text: '#000000', bg: '#ffffff' }
};

// ===== EXAMPLE TEMPLATES (PREMIUM) =====
const exampleTemplates = {
    dev: {
        fullName: 'Jean Dupont',
        jobTitle: 'Ingénieur Développeur Full Stack Senior',
        email: 'jean.dupont@techcorp.dev',
        phone: '+33 6 45 67 89 01',
        location: 'Paris, France',
        about: 'Ingénieur Senior passionné par la création d\'applications web scalables et performantes. 6+ ans d\'expérience en stack complet (MERN, Vue.js, Cloud). Spécialisé en architecture microservices et DevOps.',
        template: 'tech',
        fontTitle: 'Montserrat',
        fontBody: 'Roboto',
        primaryColor: '#0ef',
        sections: [
            {
                type: 'skills',
                title: 'Compétences',
                items: ['JavaScript/TypeScript', 'React.js', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'AWS EC2/RDS', 'Docker & Kubernetes', 'GraphQL', 'REST API', 'TDD & Jest']
            },
            {
                type: 'experience',
                title: 'Expériences',
                items: [
                    { title: 'Senior Full Stack Developer', company: 'TechCorp Solutions', period: 'Jan 2020 - Présent', description: '• Architected microservices handling 10M+ daily requests\n• Led team of 5 developers, code reviews & mentoring\n• Reduced API latency by 45% through optimization\n• Implemented CI/CD pipeline reducing deployment time by 80%' },
                    { title: 'Full Stack Developer', company: 'StartupXYZ', period: 'Jun 2018 - Dec 2019', description: '• Built SaaS platform from scratch (React + Node.js)\n• Managed AWS infrastructure & database scaling\n• Implemented Stripe payments integration' }
                ]
            },
            {
                type: 'education',
                title: 'Formation',
                items: [
                    { school: 'École 42', title: 'Inception (Curriculum Programming)', year: '2017-2018' },
                    { school: 'Université Sorbonne', title: 'Master Informatique', year: '2015-2017' }
                ]
            },
            {
                type: 'languages',
                title: 'Langues',
                items: [
                    { name: 'Français', level: 100 },
                    { name: 'Anglais', level: 90 },
                    { name: 'Espagnol', level: 60 }
                ]
            }
        ]
    },
    designer: {
        fullName: 'Marie Anderson',
        jobTitle: 'Product Designer & UX/UI Specialist',
        email: 'marie.anderson@designstudio.fr',
        phone: '+33 6 56 78 90 12',
        location: 'Lyon, France',
        about: 'Designer créative avec 5+ ans d\'expertise en UX/UI design. Passionnée par créer des expériences utilisateur exceptionnelles et intuitives. Spécialisée en design systems et digital products.',
        template: 'creative',
        fontTitle: 'Playfair Display',
        fontBody: 'Lato',
        primaryColor: '#ff6600',
        sections: [
            {
                type: 'skills',
                title: 'Compétences',
                items: ['Figma (Expert)', 'Adobe XD', 'Sketch', 'UI/UX Research', 'Wireframing', 'Prototyping', 'Design Systems', 'User Testing', 'Interaction Design', 'Web Design', 'Mobile Design']
            },
            {
                type: 'experience',
                title: 'Projets Récents',
                items: [
                    { title: 'Senior Product Designer', company: 'Digital Agency Pro', period: 'Mar 2021 - Présent', description: '• Designed 25+ digital products from concept to launch\n• Created comprehensive design system (150+ components)\n• Led user research & conducted 100+ user interviews\n• Improved product conversion by 35% through UX optimization' },
                    { title: 'UX/UI Designer', company: 'TechStartup', period: 'Jan 2019 - Feb 2021', description: '• Designed user flows & wireframes for mobile app\n• Created interactive prototypes with Figma\n• Conducted A/B testing & iterative design' }
                ]
            },
            {
                type: 'education',
                title: 'Formation',
                items: [
                    { school: 'École de Design Graphique', title: 'Certification Design UX/UI', year: '2018-2019' },
                    { school: 'Université Paris Diderot', title: 'Licence Design Graphique', year: '2015-2018' }
                ]
            },
            {
                type: 'languages',
                title: 'Langues',
                items: [
                    { name: 'Français', level: 100 },
                    { name: 'Anglais', level: 85 },
                    { name: 'Allemand', level: 45 }
                ]
            }
        ]
    },
    startup: {
        fullName: 'Lucas Fontaine',
        jobTitle: 'Founder & CTO - TechVision AI',
        email: 'lucas@techvision-ai.com',
        phone: '+33 7 45 67 89 01',
        location: 'Paris, France',
        about: 'Entrepreneur technologique avec 8 ans d\'expérience. Fondateur de TechVision AI (levée €2.5M de Seed). Passionné par l\'IA et l\'innovation. Expert en fundraising, product strategy et team building.',
        template: 'modern',
        fontTitle: 'Montserrat',
        fontBody: 'Inter',
        primaryColor: '#0ef',
        sections: [
            {
                type: 'skills',
                title: 'Compétences Clés',
                items: ['Machine Learning', 'Python (Expert)', 'Cloud Architecture (AWS/GCP)', 'Product Management', 'Team Leadership', 'Fundraising', 'Strategic Planning', 'NLP & Computer Vision', 'Data Engineering']
            },
            {
                type: 'experience',
                title: 'Experience',
                items: [
                    { title: 'Founder & CTO', company: 'TechVision AI', period: 'Jan 2021 - Présent', description: '• Raised €2.5M from Top VCs (Partech, Idinvest)\n• Built team from 0 to 25+ engineers\n• Launched AI-powered analytics platform\n• Processing 50M+ data points daily\n• 200+ enterprise clients including Fortune 500' },
                    { title: 'Tech Lead', company: 'DataFlow Systems', period: 'Jun 2017 - Dec 2020', description: '• Led ML infrastructure team of 12 engineers\n• Optimized model inference by 60%\n• Managed 5TB+ datasets & real-time processing' }
                ]
            },
            {
                type: 'education',
                title: 'Études',
                items: [
                    { school: 'HEC Paris', title: 'Executive MBA - Innovation & Entrepreneurship', year: '2020-2022' },
                    { school: 'Université Sorbonne', title: 'Master Informatique & Data Science', year: '2015-2017' }
                ]
            },
            {
                type: 'languages',
                title: 'Langues',
                items: [
                    { name: 'Français', level: 100 },
                    { name: 'Anglais', level: 95 },
                    { name: 'Mandarin', level: 40 }
                ]
            }
        ]
    },
    marketing: {
        fullName: 'Emma Rousseau',
        jobTitle: 'Head of Growth & Marketing',
        email: 'emma.rousseau@growthco.io',
        phone: '+33 6 98 76 54 32',
        location: 'Marseille, France',
        about: 'Spécialiste Growth Marketing avec 7+ ans d\'expertise. Data-driven et orientée résultats. Expérience chez des SaaS et e-commerce à haut croissance. Expertise en SEO, SEM, content marketing et growth hacking.',
        template: 'luxury',
        fontTitle: 'Playfair Display',
        fontBody: 'Nunito',
        primaryColor: '#ff6600',
        sections: [
            {
                type: 'skills',
                title: 'Compétences',
                items: ['Growth Hacking', 'SEO/SEM (Google Ads)', 'Content Marketing', 'Marketing Automation', 'GA4 & Analytics', 'Brand Strategy', 'Budget Management (€500k+)', 'CRM Management', 'A/B Testing', 'Social Media Strategy']
            },
            {
                type: 'experience',
                title: 'Expériences',
                items: [
                    { title: 'Head of Marketing', company: 'GrowthCo SaaS', period: 'Sep 2019 - Présent', description: '• Scaled company from €100k to €5M ARR\n• Built in-house content team from scratch (12 people)\n• Managed €500k annual marketing budget\n• 3x increase in organic traffic through SEO\n• Generated 1000+ qualified leads monthly' },
                    { title: 'Senior Marketing Manager', company: 'EcomFlow', period: 'Jan 2017 - Aug 2019', description: '• Reduced Customer Acquisition Cost by 40%\n• Launched 12 successful product campaigns\n• Grew social media to 150k followers' }
                ]
            },
            {
                type: 'education',
                title: 'Formation',
                items: [
                    { school: 'ESSEC Business School', title: 'Master Digital Marketing & E-Business', year: '2015-2017' },
                    { school: 'Université Aix-Marseille', title: 'Licence Communication', year: '2012-2015' }
                ]
            },
            {
                type: 'languages',
                title: 'Langues',
                items: [
                    { name: 'Français', level: 100 },
                    { name: 'Anglais', level: 90 },
                    { name: 'Allemand', level: 50 }
                ]
            }
        ]
    },
    datascientist: {
        fullName: 'Antoine Leclerc',
        jobTitle: 'Senior Data Scientist & ML Engineer',
        email: 'antoine.leclerc@datainsights.io',
        phone: '+33 6 55 44 33 22',
        location: 'Toulouse, France',
        about: 'Data Scientist Senior avec 6+ ans en machine learning et analytics. Doctorat en ML. Spécialiste deep learning, NLP et recommandation systems. 10+ publications académiques en conférences top-tier.',
        template: 'tech',
        fontTitle: 'Montserrat',
        fontBody: 'Roboto',
        primaryColor: '#0ef',
        sections: [
            {
                type: 'skills',
                title: 'Compétences',
                items: ['Python (Expert)', 'PyTorch & TensorFlow', 'SQL & Spark', 'Statistical Analysis', 'NLP & Computer Vision', 'A/B Testing', 'Feature Engineering', 'Model Deployment', 'Kubernetes', 'Big Data (Hadoop/Spark)']
            },
            {
                type: 'experience',
                title: 'Expériences',
                items: [
                    { title: 'Senior Data Scientist', company: 'DataInsights Corp', period: 'Mar 2020 - Présent', description: '• Built recommendation engine (2M+ predictions/day)\n• Improved ML model accuracy by 15% via feature engineering\n• Published 3 papers in top ML conferences\n• Led ML research initiative for 8 engineers' },
                    { title: 'ML Engineer', company: 'TechAnalytics', period: 'Sep 2017 - Feb 2020', description: '• Developed CV models for image classification\n• Deployed 5+ production ML systems\n• Reduced inference latency by 50%' }
                ]
            },
            {
                type: 'education',
                title: 'Formation',
                items: [
                    { school: 'Université Toulouse III', title: 'Doctorat Machine Learning - NLP', year: '2017-2020' },
                    { school: 'Université Toulouse III', title: 'Master Data Science & AI', year: '2015-2017' }
                ]
            },
            {
                type: 'languages',
                title: 'Langues',
                items: [
                    { name: 'Français', level: 100 },
                    { name: 'Anglais', level: 95 },
                    { name: 'Japonais', level: 35 }
                ]
            }
        ]
    },
    manager: {
        fullName: 'Ahmed Ibrahim',
        jobTitle: 'Directeur Commercial & Business Development',
        email: 'ahmed.ibrahim@corpcorp.biz',
        phone: '+33 6 12 34 56 78',
        location: 'Douala, Cameroun',
        about: 'Leader expérimenté avec 12+ ans de management et développement d\'affaires. Spécialisé en stratégie commerciale, gestion d\'équipes et croissance revenue. Bilingue français-anglais-arabe.',
        template: 'classic',
        fontTitle: 'Raleway',
        fontBody: 'Open Sans',
        primaryColor: '#1a5f7a',
        sections: [
            {
                type: 'skills',
                title: 'Compétences',
                items: ['Leadership d\'Équipes', 'Stratégie Commerciale', 'Négociation & Closing', 'CRM Salesforce', 'Business Development', 'Budget Management', 'Planification Stratégique', 'Account Management', 'Market Analysis']
            },
            {
                type: 'experience',
                title: 'Expériences',
                items: [
                    { title: 'Directeur Commercial', company: 'Big Corporation Inc', period: 'Jan 2019 - Présent', description: '• Managed team of 25 sales representatives\n• Increased revenue by 35% YoY\n• Opened 5 new markets in West Africa\n• Built €10M+ sales pipeline\n• 90% customer retention rate' },
                    { title: 'Sales Manager', company: 'Trading Company', period: 'Jan 2015 - Dec 2018', description: '• Developed business strategies for 50+ clients\n• Negotiated major contracts (€1M+ each)\n• Achieved 150% sales targets' }
                ]
            },
            {
                type: 'education',
                title: 'Formation',
                items: [
                    { school: 'Université Yaoundé II', title: 'Master Gestion d\'Entreprise', year: '2010-2012' },
                    { school: 'Université Buea', title: 'Licence Commerce International', year: '2006-2010' }
                ]
            },
            {
                type: 'languages',
                title: 'Langues',
                items: [
                    { name: 'Français', level: 100 },
                    { name: 'Anglais', level: 90 },
                    { name: 'Arabe', level: 100 }
                ]
            }
        ]
    },
    etudiant: {
        fullName: 'Marie Dubois',
        jobTitle: 'Candidate Master 2 - Informatique & IA',
        email: 'marie.dubois@student.uga.fr',
        phone: '+33 6 11 22 33 44',
        location: 'Grenoble, France',
        about: 'Étudiante en Master 2 Informatique à l\'UGA, spécialisation Intelligence Artificielle. Passionnée par développement full-stack et recherche appliquée en ML. Stage confirmé chez leader tech.',
        template: 'modern',
        fontTitle: 'Poppins',
        fontBody: 'Inter',
        primaryColor: '#0ef',
        sections: [
            {
                type: 'skills',
                title: 'Compétences',
                items: ['Java', 'Python', 'React.js', 'SQL', 'Docker', 'Git', 'TensorFlow', 'Spring Boot', 'HTML/CSS', 'Linux', 'Agile Scrum']
            },
            {
                type: 'experience',
                title: 'Expériences',
                items: [
                    { title: 'Stagiaire Développeur Full-Stack', company: 'WebServices SA', period: 'Jun 2024 - Sep 2024', description: '• Développement features e-commerce en React & Spring Boot\n• Amélioration performance app de 25%\n• Travail en équipe agile de 6 développeurs' },
                    { title: 'Assistant Recherche', company: 'Labo IA - UGA', period: 'Jan 2024 - Jun 2024', description: '• Support prof sur projet recherche ML\n• Implémentation neural networks en PyTorch' }
                ]
            },
            {
                type: 'education',
                title: 'Formation',
                items: [
                    { school: 'Université Grenoble-Alpes', title: 'Master 2 Informatique - Spécialité IA', year: '2024-2026' },
                    { school: 'Université Grenoble-Alpes', title: 'Master 1 Informatique', year: '2023-2024' },
                    { school: 'Université Grenoble-Alpes', title: 'Licence Informatique', year: '2020-2023' }
                ]
            },
            {
                type: 'languages',
                title: 'Langues',
                items: [
                    { name: 'Français', level: 100 },
                    { name: 'Anglais', level: 80 },
                    { name: 'Espagnol', level: 40 }
                ]
            }
        ]
    },
    chercheur: {
        fullName: 'Pr. Philippe Arnaud',
        jobTitle: 'Chercheur Senior - Doctorat d\'État',
        email: 'p.arnaud@cnrs-loria.fr',
        phone: '+33 3 83 59 30 00',
        location: 'Nancy, France',
        about: 'Chercheur senior au CNRS (Laboratoire LORIA) depuis 12 ans. Doctorat d\'État en Informatique (2012). Spécialiste algorithmique distribuée et systèmes complexes. 45+ publications en conférences top-tier.',
        template: 'classic',
        fontTitle: 'Raleway',
        fontBody: 'Open Sans',
        primaryColor: '#1a5f7a',
        sections: [
            {
                type: 'skills',
                title: 'Domaines d\'Expertise',
                items: ['Algorithmique Distribuée', 'Théorie des Graphes', 'Machine Learning', 'Systèmes Complexes', 'C++', 'Python', 'Simulation Numérique', 'Parallel Computing']
            },
            {
                type: 'experience',
                title: 'Positions',
                items: [
                    { title: 'Chercheur Senior (HDR)', company: 'CNRS - LORIA', period: 'Jan 2020 - Présent', description: '• Direction de 3 doctorants\n• Publication 15+ papers en top-tier conferences\n• Sécurisation €800k de financement recherche\n• Responsable projet ANR 3 ans' },
                    { title: 'Chercheur Postdoc', company: 'INRIA Rocquencourt', period: 'Oct 2012 - Dec 2019', description: '• Développement algorithmes distribués innovants\n• Co-auteur 20+ peer-reviewed papers' }
                ]
            },
            {
                type: 'education',
                title: 'Formation',
                items: [
                    { school: 'Université Lorraine', title: 'Doctorat d\'État Informatique', year: '2008-2012' },
                    { school: 'Université Lorraine', title: 'DEA Informatique', year: '2007-2008' }
                ]
            },
            {
                type: 'languages',
                title: 'Langues',
                items: [
                    { name: 'Français', level: 100 },
                    { name: 'Anglais', level: 95 },
                    { name: 'Allemand', level: 70 }
                ]
            }
        ]
    },
    master: {
        fullName: 'Clara Beaumont',
        jobTitle: 'Candidate Master 1 - Relations Internationales',
        email: 'clara.beaumont@sciencespo.fr',
        phone: '+33 6 77 88 99 00',
        location: 'Paris, France',
        about: 'Étudiante Master 1 Relations Internationales à Sciences Po. Passionnée par géopolitique, diplomatie et multilatéralisme. Stage Quai d\'Orsay (2023). Mobilités Allemagne et Japon.',
        template: 'luxury',
        fontTitle: 'Playfair Display',
        fontBody: 'Lato',
        primaryColor: '#1a5f7a',
        sections: [
            {
                type: 'skills',
                title: 'Compétences',
                items: ['Analyse Géopolitique', 'Négociation Diplomatique', 'Recherche Académique', 'Rédaction Politique', 'Communication Interculturelle', 'Microsoft Office', 'LaTeX', 'QGIS']
            },
            {
                type: 'experience',
                title: 'Expériences',
                items: [
                    { title: 'Stagiaire - Diplomatie', company: 'Ministère Affaires Étrangères', period: 'Sep 2023 - Dec 2023', description: '• Analyse politique UE sur enjeux humanitaires\n• Préparation briefing notes pour ambassadeurs\n• Participation négociations multilatérales' },
                    { title: 'Assistant Recherche', company: 'Centre Études Sciences Po', period: 'Feb 2023 - Aug 2023', description: '• Recherche gouvernance Amérique Latine\n• Co-auteur 2 policy briefs\n• Présentation findings séminaire académique' }
                ]
            },
            {
                type: 'education',
                title: 'Formation',
                items: [
                    { school: 'Sciences Po Paris', title: 'Master 1 Relations Internationales', year: '2024-2025' },
                    { school: 'Sciences Po Paris', title: 'Licence (3e année) Relations Internationales', year: '2023-2024' }
                ]
            },
            {
                type: 'languages',
                title: 'Langues',
                items: [
                    { name: 'Français', level: 100 },
                    { name: 'Anglais', level: 95 },
                    { name: 'Allemand', level: 75 },
                    { name: 'Mandarin', level: 50 }
                ]
            }
        ]
    }
};

// ===== DOM INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ CV Generator Premium Edition loaded');
    initializeEventListeners();
    renderPagesList();
    updatePreview();
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Tab switching
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });

    // Color inputs
    ['primaryColor', 'textColor', 'bgColor'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                updateColorHex(id, e.target.value);
                updatePreview();
            });
        }
    });

    // Font & design inputs
    ['fontTitle', 'fontBody'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', updatePreview);
        }
    });

    // Photo upload
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }
}

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const tabPanel = document.getElementById(`tab-${tabName}`);
    if (tabPanel) {
        tabPanel.classList.add('active');
    }

    // Mark button as active
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// ===== PHOTO HANDLING =====
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        currentPhotoData = e.target.result;
        const preview = document.getElementById('photoPreview');
        if (preview) {
            preview.innerHTML = `<img src="${currentPhotoData}" alt="Profile">`;
        }
        updatePreview();
    };
    reader.readAsDataURL(file);
}

// ===== TEMPLATE SWITCHING =====
function switchTemplate(templateName) {
    currentTemplate = templateName;
    
    // Update active button
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-template="${templateName}"]`).classList.add('active');
    
    // Apply CSS variables based on template
    const templateColors = {
        'minimal': { bg: '#ffffff', text: '#000000', primary: '#000000' },
        'classic': { bg: '#f5f5f5', text: '#000000', primary: '#1a5f7a' },
        'modern': { bg: '#ffffff', text: '#000000', primary: '#0ef' },
        'luxury': { bg: '#f9f7f4', text: '#2c2c2c', primary: '#1a5f7a' },
        'creative': { bg: '#ffffff', text: '#333333', primary: '#ff6600' },
        'tech': { bg: '#f8f9fa', text: '#000000', primary: '#0ef' }
    };

    const colors = templateColors[templateName] || templateColors['minimal'];
    document.getElementById('bgColor').value = colors.bg;
    document.getElementById('textColor').value = colors.text;
    document.getElementById('primaryColor').value = colors.primary;

    updatePreview();
}

// ===== COLOR MANAGEMENT =====
function applyColorPreset(presetName) {
    const preset = colorPresets[presetName];
    if (preset) {
        document.getElementById('primaryColor').value = preset.primary;
        document.getElementById('textColor').value = preset.text;
        document.getElementById('bgColor').value = preset.bg;
        updatePreview();
    }
}

function updateColorHex(id, value) {
    const hexElement = document.getElementById(id + 'Hex');
    if (hexElement) {
        hexElement.textContent = value.toUpperCase();
    }
}

// ===== PAGES MANAGEMENT =====
function addNewPage() {
    pageCount++;
    pageData[pageCount] = {
        type: 'content',
        title: `Page ${pageCount}`,
        educations: [],
        experiences: [],
        skills: [],
        languages: []
    };
    renderPagesList();
    switchToPage(pageCount);
}

function switchToPage(pageId) {
    currentPageId = pageId;
    
    // Hide all pages
    document.querySelectorAll('.form-page').forEach(page => {
        page.classList.remove('active');
    });

    // Update page buttons
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected page
    const page = document.getElementById(`page-${pageId}`);
    if (page) {
        page.classList.add('active');
    }

    const btn = document.querySelector(`[data-page="${pageId}"]`);
    if (btn) {
        btn.classList.add('active');
    }
}

function renderPagesList() {
    const container = document.getElementById('pagesContainer');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 1; i <= pageCount; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === currentPageId ? ' active' : '');
        btn.setAttribute('data-page', i);
        btn.innerHTML = `<i class="fas fa-${i === 1 ? 'id-card' : 'file'}"></i> Page ${i}`;
        btn.onclick = () => switchToPage(i);
        container.appendChild(btn);
    }
}

// ===== LOAD EXAMPLE =====
function loadExample(exampleName) {
    const example = exampleTemplates[exampleName];
    if (!example) return;

    // Fill basic info
    document.getElementById('fullName').value = example.fullName;
    document.getElementById('jobTitle').value = example.jobTitle;
    document.getElementById('email').value = example.email;
    document.getElementById('phone').value = example.phone;
    document.getElementById('location').value = example.location;
    document.getElementById('about').value = example.about;

    // Set design
    currentTemplate = example.template;
    document.getElementById('fontTitle').value = example.fontTitle;
    document.getElementById('fontBody').value = example.fontBody;
    document.getElementById('primaryColor').value = example.primaryColor;

    switchTemplate(example.template);
    switchTab('content');
    updatePreview();
}

// ===== PREVIEW UPDATE =====
function updatePreview() {
    const preview = document.getElementById('cvPreview');
    if (!preview) return;

    const fullName = document.getElementById('fullName').value || '[Nom Complet]';
    const jobTitle = document.getElementById('jobTitle').value || '[Titre]';
    const email = document.getElementById('email').value || 'email@example.com';
    const phone = document.getElementById('phone').value || '+33 6 00 00 00 00';
    const location = document.getElementById('location').value || 'Ville, Pays';
    const about = document.getElementById('about').value || 'Résumé professionnel';

    const primaryColor = document.getElementById('primaryColor').value;
    const textColor = document.getElementById('textColor').value;
    const bgColor = document.getElementById('bgColor').value;

    // Update CSS variables
    preview.style.setProperty('--cv-primary', primaryColor);
    preview.style.setProperty('--cv-text', textColor);
    preview.style.backgroundColor = bgColor;
    preview.style.color = textColor;

    // Update template class
    preview.className = `cv-page ${currentTemplate}-template`;

    // Build HTML based on template
    let html = '';

    if (currentTemplate === 'modern') {
        html = `
            <div class="cv-header">
                ${currentPhotoData ? `<img src="${currentPhotoData}" class="cv-photo" alt="Photo">` : ''}
                <div class="cv-header-content">
                    <div class="cv-name">${fullName}</div>
                    <div class="cv-title">${jobTitle}</div>
                    <div class="cv-meta">
                        <span class="cv-meta-item"><i class="fas fa-envelope"></i> ${email}</span>
                        <span class="cv-meta-item"><i class="fas fa-phone"></i> ${phone}</span>
                        <span class="cv-meta-item"><i class="fas fa-map-marker"></i> ${location}</span>
                    </div>
                </div>
            </div>
            <div class="cv-about">
                <p>${about}</p>
            </div>
        `;
    } else if (currentTemplate === 'luxury') {
        html = `
            <div class="cv-header">
                ${currentPhotoData ? `<img src="${currentPhotoData}" class="cv-photo" alt="Photo">` : ''}
                <div class="cv-name">${fullName}</div>
                <div class="cv-title">${jobTitle}</div>
                <div class="cv-meta">
                    ${email} • ${phone} • ${location}
                </div>
            </div>
            <div class="cv-about">
                <p>${about}</p>
            </div>
        `;
    } else if (currentTemplate === 'creative') {
        html = `
            <div class="cv-header">
                ${currentPhotoData ? `<img src="${currentPhotoData}" class="cv-photo" alt="Photo">` : ''}
                <div class="cv-header-content">
                    <div class="cv-name">${fullName}</div>
                    <div class="cv-title">${jobTitle}</div>
                </div>
            </div>
            <div class="cv-meta" style="margin-top: 20px;">
                <span>${email}</span> | <span>${phone}</span> | <span>${location}</span>
            </div>
            <div class="cv-about" style="margin-top: 15px;">
                <p>${about}</p>
            </div>
        `;
    } else if (currentTemplate === 'tech') {
        html = `
            <div class="cv-header">
                ${currentPhotoData ? `<img src="${currentPhotoData}" class="cv-photo" alt="Photo">` : ''}
                <div class="cv-header-content">
                    <div class="cv-name">${fullName}</div>
                    <div class="cv-title">${jobTitle}</div>
                    <div class="cv-meta">
                        ${email} | ${phone} | ${location}
                    </div>
                </div>
            </div>
            <div class="cv-section">
                <div class="cv-section-title">À Propos</div>
                <p>${about}</p>
            </div>
        `;
    } else {
        // Minimal & Classic
        html = `
            <div class="cv-header">
                <div class="cv-name">${fullName}</div>
                <div class="cv-title">${jobTitle}</div>
                <div class="cv-meta">
                    ${email} | ${phone} | ${location}
                </div>
            </div>
            <div class="cv-section">
                <div class="cv-section-title">À Propos</div>
                <p>${about}</p>
            </div>
        `;
    }

    preview.innerHTML = html;

    // Apply font styles
    const fontTitle = document.getElementById('fontTitle').value;
    const fontBody = document.getElementById('fontBody').value;
    preview.style.fontFamily = fontBody;
    const nameElements = preview.querySelectorAll('.cv-name, .cv-section-title');
    nameElements.forEach(el => el.style.fontFamily = fontTitle);
}

// ===== EXPORT FUNCTIONS =====
function exportPDF() {
    const element = document.getElementById('cvPreview');
    const opt = {
        margin: 10,
        filename: 'CV.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element).save();
}

function exportPNG() {
    const element = document.getElementById('cvPreview');
    html2canvas(element, { scale: 2, useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'CV.png';
        link.click();
    });
}

function exportJSON() {
    const data = {
        fullName: document.getElementById('fullName').value,
        jobTitle: document.getElementById('jobTitle').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        about: document.getElementById('about').value,
        template: currentTemplate,
        fontTitle: document.getElementById('fontTitle').value,
        fontBody: document.getElementById('fontBody').value,
        primaryColor: document.getElementById('primaryColor').value,
        textColor: document.getElementById('textColor').value,
        bgColor: document.getElementById('bgColor').value,
        photo: currentPhotoData
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'cv-data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function triggerJSONImport() {
    document.getElementById('jsonInput').click();
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            document.getElementById('fullName').value = data.fullName || '';
            document.getElementById('jobTitle').value = data.jobTitle || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('location').value = data.location || '';
            document.getElementById('about').value = data.about || '';
            document.getElementById('fontTitle').value = data.fontTitle || 'Poppins';
            document.getElementById('fontBody').value = data.fontBody || 'Roboto';
            document.getElementById('primaryColor').value = data.primaryColor || '#0ef';
            document.getElementById('textColor').value = data.textColor || '#ffffff';
            document.getElementById('bgColor').value = data.bgColor || '#1f242d';

            if (data.photo) {
                currentPhotoData = data.photo;
                const preview = document.getElementById('photoPreview');
                if (preview) {
                    preview.innerHTML = `<img src="${currentPhotoData}" alt="Profile">`;
                }
            }

            if (data.template) {
                switchTemplate(data.template);
            }

            updatePreview();
            alert('✅ CV chargé avec succès !');
        } catch (error) {
            alert('❌ Erreur lors du chargement du JSON');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// ===== ZOOM =====
function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 10, 200);
    applyZoom();
}

function zoomOut() {
    zoomLevel = Math.max(zoomLevel - 10, 50);
    applyZoom();
}

function applyZoom() {
    const container = document.getElementById('previewContainer');
    if (container) {
        container.style.transform = `scale(${zoomLevel / 100})`;
        container.style.transformOrigin = 'top center';
        document.getElementById('zoomLevel').textContent = zoomLevel + '%';
    }
}
