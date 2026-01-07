// ===== FIREBASE SETUP =====
let currentPhotoData = null;
let currentTemplate = 'minimal';
let currentCVId = null;
let currentUserId = null;
let db = null;
let auth = null;

// ===== GLOBAL STATE - Define BEFORE functions use it =====
let zoomLevel = 100;
let nameSize = 36;
let jobTitleSize = 16;
let metaSize = 11;
let sectionTitleSize = 16;
let bodyFontSize = 13;
let isMobileOpen = false;
let resizeTimeout;

// Page management state
let currentPage = 1;
let totalPages = 1;
let isAutoPageMode = true;
let pagesData = []; // Array to store data for each page

let cvData = {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    about: '',
    educations: [],
    experiences: [],
    skills: [],
    languages: [],
    interests: []
};

let educationCount = 0;
let experienceCount = 0;
let skillCount = 0;
let languageCount = 0;
let interestCount = 0;

// Initialize Firebase on page load
function initFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = setInterval(() => {
            if (window.auth && window.db) {
                clearInterval(checkFirebase);
                auth = window.auth;
                db = window.db;
                
                // Get IDs from sessionStorage
                currentCVId = sessionStorage.getItem('currentCVId');
                currentUserId = sessionStorage.getItem('currentUserId');
                
                console.log('✅ Firebase initialized for CV editor');
                resolve();
            }
        }, 100);
    });
}

// Auto-save to Firestore
function autoSaveToFirebase() {
    if (!currentCVId || !currentUserId || !window.CVDocumentManager) {
        return Promise.resolve();
    }

    const saveData = {
        fullName: document.getElementById('fullName').value,
        jobTitle: document.getElementById('jobTitle').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        about: document.getElementById('about').value,
        educations: cvData.educations || [],
        experiences: cvData.experiences || [],
        skills: cvData.skills || [],
        languages: cvData.languages || [],
        interests: cvData.interests || [],
        template: currentTemplate,
        fontTitle: document.getElementById('fontTitle').value,
        fontBody: document.getElementById('fontBody').value,
        nameSize: parseInt(document.getElementById('nameSize').value),
        jobTitleSize: parseInt(document.getElementById('jobTitleSize').value),
        metaSize: parseInt(document.getElementById('metaSize').value),
        sectionTitleSize: parseInt(document.getElementById('sectionTitleSize').value),
        bodyFontSize: parseInt(document.getElementById('bodyFontSize').value),
        primaryColor: document.getElementById('primaryColor').value,
        photoData: currentPhotoData
    };

    return window.CVDocumentManager.updateCV(currentCVId, saveData)
        .catch(err => {
            console.error('Error saving to Firebase:', err);
            // Fallback to localStorage for offline
            localStorage.setItem('cv-auto-save', JSON.stringify({ ...saveData, timestamp: new Date().toISOString() }));
        });
}

// ===== EXAMPLE TEMPLATES =====
const exampleTemplates = {
    dev: {
        fullName: 'Jean Dupont',
        jobTitle: 'Ingénieur Développeur Full Stack Senior',
        email: 'jean.dupont@techcorp.dev',
        phone: '+33 6 45 67 89 01',
        location: 'Paris, France',
        about: 'Ingénieur Senior passionné par la création d\'applications web scalables. 6+ ans d\'expérience en stack complet. Spécialisé en architecture microservices, cloud et DevOps. Expertise dans la gestion d\'équipes de développement et mentoring.',
        template: 'tech',
        fontTitle: 'Montserrat',
        fontBody: 'Roboto',
        primaryColor: '#00eeff',
        educations: [
            { school: 'École 42', title: 'Inception (Curriculum Programming)', year: '2017-2018' },
            { school: 'Université Sorbonne', title: 'Master Informatique', year: '2015-2017' }
        ],
        experiences: [
            { title: 'Senior Full Stack Developer', company: 'TechCorp Solutions', period: 'Jan 2020 - Présent', description: '• Architected microservices handling 10M+ requests daily\n• Led team of 5 developers, code reviews and mentoring\n• Reduced API latency by 45% through optimization\n• Implemented CI/CD pipeline reducing deployment time by 80%' },
            { title: 'Full Stack Developer', company: 'StartupXYZ', period: 'Jun 2018 - Dec 2019', description: '• Built SaaS platform from scratch (React + Node.js)\n• Managed AWS infrastructure and database scaling\n• Implemented Stripe payment integration' }
        ],
        skills: ['JavaScript/TypeScript', 'React.js', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'REST API'],
        languages: [
            { name: 'Français', level: 100 },
            { name: 'Anglais', level: 90 }
        ],
        interests: ['Open Source', 'Machine Learning', 'DevOps', 'Entrepreneuriat']
    },
    designer: {
        fullName: 'Marie Anderson',
        jobTitle: 'Product Designer & UX/UI Specialist',
        email: 'marie.anderson@designstudio.fr',
        phone: '+33 6 56 78 90 12',
        location: 'Lyon, France',
        about: 'Designer créative avec 5+ ans d\'expertise en UX/UI design. Passionnée par créer des expériences utilisateur exceptionnelles. Spécialisée dans les design systems et digital products. Expérience en startups et agences.',
        template: 'creative',
        fontTitle: 'Playfair Display',
        fontBody: 'Lato',
        primaryColor: '#ff6600',
        educations: [
            { school: 'École de Design Graphique', title: 'Certification Design UX/UI', year: '2018-2019' },
            { school: 'Université Paris Diderot', title: 'Licence Design Graphique', year: '2015-2018' }
        ],
        experiences: [
            { title: 'Senior Product Designer', company: 'Digital Agency Pro', period: 'Mar 2021 - Présent', description: '• Designed 25+ digital products from concept to launch\n• Created comprehensive design system (150+ components)\n• Led user research sessions with 100+ participants\n• Improved product conversion by 35% through UX optimization' },
            { title: 'UX/UI Designer', company: 'TechStartup', period: 'Jan 2019 - Feb 2021', description: '• Designed user flows and wireframes for mobile app\n• Created interactive prototypes with Figma\n• Conducted A/B testing and iterative design' }
        ],
        skills: ['Figma (Expert)', 'Adobe XD', 'UI/UX Research', 'Wireframing', 'Prototyping', 'Design Systems', 'User Testing', 'Interaction Design', 'Web Design', 'Mobile Design'],
        languages: [
            { name: 'Français', level: 100 },
            { name: 'Anglais', level: 85 },
            { name: 'Allemand', level: 45 }
        ],
        interests: ['Design Thinking', 'Illustration', 'Brand Design', 'Web Design']
    },
    startup: {
        fullName: 'Lucas Fontaine',
        jobTitle: 'Founder & CTO - TechVision AI',
        email: 'lucas@techvision-ai.com',
        phone: '+33 7 45 67 89 01',
        location: 'Paris, France',
        about: 'Entrepreneur technologique avec 8 ans d\'expérience. Fondateur de TechVision AI (levée €2.5M). Passionné par l\'IA et l\'innovation. Expert en fundraising, product strategy et team building. Leadership d\'équipes distribuées.',
        template: 'modern',
        fontTitle: 'Montserrat',
        fontBody: 'Inter',
        primaryColor: '#00eeff',
        educations: [
            { school: 'HEC Paris', title: 'Executive MBA - Innovation & Entrepreneurship', year: '2020-2022' },
            { school: 'Université Sorbonne', title: 'Master Informatique & Data Science', year: '2015-2017' }
        ],
        experiences: [
            { title: 'Founder & CTO', company: 'TechVision AI', period: 'Jan 2021 - Présent', description: '• Raised €2.5M from top VCs (Partech, Idinvest)\n• Built team from 0 to 25+ engineers\n• Launched AI-powered analytics platform\n• Processing 50M+ data points daily for 200+ enterprise clients' },
            { title: 'Tech Lead', company: 'DataFlow Systems', period: 'Jun 2017 - Dec 2020', description: '• Led ML infrastructure team handling 50M+ queries/day\n• Optimized model inference time by 60%\n• Managed 5TB+ datasets and real-time processing' }
        ],
        skills: ['Python (Expert)', 'Machine Learning', 'AWS', 'Cloud Architecture', 'Leadership', 'Fundraising', 'Product Strategy', 'NLP', 'Computer Vision', 'Team Building'],
        languages: [
            { name: 'Français', level: 100 },
            { name: 'Anglais', level: 95 },
            { name: 'Mandarin', level: 40 }
        ],
        interests: ['Intelligence Artificielle', 'Startups', 'Fintech', 'Open Source']
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
        educations: [
            { school: 'ESSEC Business School', title: 'Master Digital Marketing & E-Business', year: '2015-2017' },
            { school: 'Université Aix-Marseille', title: 'Licence Communication', year: '2012-2015' }
        ],
        experiences: [
            { title: 'Head of Marketing', company: 'GrowthCo SaaS', period: 'Sep 2019 - Présent', description: '• Scaled company from €100k to €5M ARR\n• Built in-house content team from scratch (12 people)\n• Managed €500k annual marketing budget\n• 3x increase in organic traffic through SEO\n• Generated 1000+ qualified leads monthly' },
            { title: 'Senior Marketing Manager', company: 'EcomFlow', period: 'Jan 2017 - Aug 2019', description: '• Reduced Customer Acquisition Cost by 40%\n• Launched 12 successful product campaigns\n• Grew social media to 150k followers' }
        ],
        skills: ['Growth Hacking', 'SEO/SEM', 'Content Marketing', 'GA4 Analytics', 'Marketing Automation', 'Brand Strategy', 'Budget Management', 'CRM Management', 'A/B Testing', 'Social Strategy'],
        languages: [
            { name: 'Français', level: 100 },
            { name: 'Anglais', level: 90 },
            { name: 'Allemand', level: 50 }
        ],
        interests: ['Stratégie digitale', 'Tendances marketing', 'Psychologie consommateur']
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
        primaryColor: '#00eeff',
        educations: [
            { school: 'Université Toulouse III', title: 'Doctorat Machine Learning - NLP', year: '2017-2020' },
            { school: 'Université Toulouse III', title: 'Master Data Science & AI', year: '2015-2017' }
        ],
        experiences: [
            { title: 'Senior Data Scientist', company: 'DataInsights Corp', period: 'Mar 2020 - Présent', description: '• Built recommendation engine (2M+ predictions/day)\n• Improved ML model accuracy by 15% via feature engineering\n• Published 3 papers in top ML conferences\n• Led ML research initiative for 8 engineers' },
            { title: 'ML Engineer', company: 'TechAnalytics', period: 'Sep 2017 - Feb 2020', description: '• Developed computer vision models for image classification\n• Deployed 5+ production ML systems\n• Reduced inference latency by 50%' }
        ],
        skills: ['Python (Expert)', 'PyTorch', 'TensorFlow', 'SQL', 'Spark', 'Statistics', 'Feature Engineering', 'NLP', 'Computer Vision', 'Big Data'],
        languages: [
            { name: 'Français', level: 100 },
            { name: 'Anglais', level: 95 },
            { name: 'Japonais', level: 35 }
        ],
        interests: ['Research ML', 'Computer Vision', 'Algorithmes', 'Data Privacy']
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
        educations: [
            { school: 'Université Yaoundé II', title: 'Master Gestion d\'Entreprise', year: '2010-2012' },
            { school: 'Université Buea', title: 'Licence Commerce International', year: '2006-2010' }
        ],
        experiences: [
            { title: 'Directeur Commercial', company: 'Big Corporation Inc', period: 'Jan 2019 - Présent', description: '• Managed team of 25 sales representatives\n• Increased revenue by 35% YoY\n• Opened 5 new markets in West Africa\n• Built €10M+ sales pipeline\n• 90% customer retention rate' },
            { title: 'Sales Manager', company: 'Trading Company', period: 'Jan 2015 - Dec 2018', description: '• Developed business strategies for 50+ clients\n• Negotiated major contracts (€1M+ each)\n• Achieved 150% sales targets' }
        ],
        skills: ['Leadership', 'Sales Strategy', 'Negotiation', 'CRM Salesforce', 'Business Development', 'Budget Management', 'Account Management', 'Market Analysis', 'Team Building'],
        languages: [
            { name: 'Français', level: 100 },
            { name: 'Anglais', level: 90 },
            { name: 'Arabe', level: 100 }
        ],
        interests: ['Leadership', 'Coaching', 'Entrepreneuriat', 'Immobilier']
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ CV Generator Pro loaded');
    
    // Initialize Firebase
    try {
        await initFirebase();
        console.log('✅ Firebase initialized');
    } catch (err) {
        console.error('Firebase init error:', err);
    }
    
    // Load CV from sessionStorage (set by dashboard) or redirect to dashboard
    currentCVId = sessionStorage.getItem('currentCVId');
    currentUserId = sessionStorage.getItem('currentUserId');
    
    if (currentCVId && currentUserId) {
        // Load existing CV from Firestore
        try {
            if (window.CVDocumentManager) {
                const cvData = await window.CVDocumentManager.getCV(currentCVId);
                if (cvData) {
                    console.log('✅ CV loaded from Firestore:', cvData.name);
                    restoreCVFromDatabase(cvData);
                    
                    // Set up real-time listener for collaborative editing
                    window.CVDocumentManager.onCVUpdate(currentCVId, (updatedData) => {
                        // Only update if user is not actively editing
                        if (!document.activeElement.matches('input, textarea, select')) {
                            console.log('📡 CV updated in real-time');
                            // Optionally notify user of external changes
                        }
                    });
                } else {
                    console.log('CV not found, trying auto-save...');
                    restoreAutoSave();
                }
            } else {
                console.log('CVDocumentManager not available, using auto-save');
                restoreAutoSave();
            }
        } catch (err) {
            console.error('Error loading CV from Firestore:', err);
            restoreAutoSave();
        }
    } else {
        // No CV selected, redirect to dashboard
        console.log('No CV selected, redirecting to dashboard...');
        window.location.href = 'dashboard.html';
        return;
    }
    
    initializeDarkMode();
    restoreSessionState();
    initializeEventListeners();
    initMobileClosers(); // Initialize mobile sidebar closers
    renderDynamicLists();
    updateColorSwatchActive('#00eeff');
    updatePreview();
    setupResponsive();
});

function restoreCVFromDatabase(dbData) {
    // Restore all fields from database
    document.getElementById('fullName').value = dbData.fullName || '';
    document.getElementById('jobTitle').value = dbData.jobTitle || '';
    document.getElementById('email').value = dbData.email || '';
    document.getElementById('phone').value = dbData.phone || '';
    document.getElementById('location').value = dbData.location || '';
    document.getElementById('about').value = dbData.about || '';
    
    // Restore data structures
    cvData.educations = dbData.educations || [];
    cvData.experiences = dbData.experiences || [];
    cvData.skills = dbData.skills || [];
    cvData.languages = dbData.languages || [];
    cvData.interests = dbData.interests || [];
    
    // Restore counters
    educationCount = Math.max(...(dbData.educations || []).map(e => e.id || 0), 0);
    experienceCount = Math.max(...(dbData.experiences || []).map(e => e.id || 0), 0);
    skillCount = Math.max(...(dbData.skills || []).map(s => s.id || 0), 0);
    languageCount = Math.max(...(dbData.languages || []).map(l => l.id || 0), 0);
    interestCount = Math.max(...(dbData.interests || []).map(i => i.id || 0), 0);
    
    // Restore photo
    if (dbData.photoData) {
        currentPhotoData = dbData.photoData;
        updatePhotoPreview();
    }
    
    // Restore design settings
    document.getElementById('fontTitle').value = dbData.fontTitle || 'Poppins';
    document.getElementById('fontBody').value = dbData.fontBody || 'Roboto';
    document.getElementById('primaryColor').value = dbData.primaryColor || '#0084ff';
    
    // Restore font sizes if they exist
    if (document.getElementById('nameSize')) {
        document.getElementById('nameSize').value = dbData.nameSize || 36;
        document.getElementById('jobTitleSize').value = dbData.jobTitleSize || 16;
        document.getElementById('metaSize').value = dbData.metaSize || 11;
        document.getElementById('sectionTitleSize').value = dbData.sectionTitleSize || 16;
        document.getElementById('bodyFontSize').value = dbData.bodyFontSize || 13;
    }
    
    // Restore template
    if (dbData.template) switchTemplate(dbData.template);
    
    // Store created date for later
    if (dbData.created) sessionStorage.setItem('cvCreated', dbData.created);
}

// ===== SESSION STATE MANAGEMENT =====
function restoreSessionState() {
    const savedZoom = sessionStorage.getItem('cv-zoom');
    if (savedZoom) {
        zoomLevel = parseInt(savedZoom);
        applyZoom();
    }
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="toast-icon ${icons[type] || icons.info}"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove();">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.add('exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// ===== DARK MODE MANAGEMENT =====
function initializeDarkMode() {
    // Check localStorage for theme preference
    const savedTheme = localStorage.getItem('cv-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    
    if (isDark) {
        document.documentElement.classList.add('dark-mode');
        updateThemeButton(true);
    } else {
        document.documentElement.classList.remove('dark-mode');
        updateThemeButton(false);
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    localStorage.setItem('cv-theme', isDark ? 'dark' : 'light');
    updateThemeButton(isDark);
}

function updateThemeButton(isDark) {
    const btn = document.getElementById('themeToggle');
    if (btn) {
        const icon = btn.querySelector('i');
        if (isDark) {
            icon.className = 'fas fa-sun';
            btn.textContent = ' Mode clair';
            btn.insertAdjacentHTML('afterbegin', '<i class="fas fa-sun"></i>');
        } else {
            icon.className = 'fas fa-moon';
            btn.textContent = ' Mode sombre';
            btn.insertAdjacentHTML('afterbegin', '<i class="fas fa-moon"></i>');
        }
    }
}

// ===== AUTO-SAVE TO LOCALSTORAGE =====
let saveTimeout;

function autoSaveCV() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        const data = {
            fullName: document.getElementById('fullName').value,
            jobTitle: document.getElementById('jobTitle').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            about: document.getElementById('about').value,
            educations: cvData.educations,
            experiences: cvData.experiences,
            skills: cvData.skills,
            languages: cvData.languages,
            interests: cvData.interests,
            template: currentTemplate,
            fontTitle: document.getElementById('fontTitle').value,
            fontBody: document.getElementById('fontBody').value,
            nameSize: parseInt(document.getElementById('nameSize').value),
            jobTitleSize: parseInt(document.getElementById('jobTitleSize').value),
            metaSize: parseInt(document.getElementById('metaSize').value),
            sectionTitleSize: parseInt(document.getElementById('sectionTitleSize').value),
            bodyFontSize: parseInt(document.getElementById('bodyFontSize').value),
            primaryColor: document.getElementById('primaryColor').value,
            photo: currentPhotoData,
            timestamp: new Date().toISOString()
        };
        
        // Save to Firestore (primary)
        if (currentCVId && currentUserId && window.CVDocumentManager) {
            autoSaveToFirebase();
        }
        
        // Save to localStorage (backup)
        localStorage.setItem('cv-auto-save', JSON.stringify(data));
        console.log('💾 Auto-saved');
    }, 2000); // Auto-save after 2 seconds of inactivity
}

function restoreAutoSave() {
    const saved = localStorage.getItem('cv-auto-save');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // Only restore if data is recent (less than 7 days)
            const saveTime = new Date(data.timestamp);
            const now = new Date();
            const daysDiff = (now - saveTime) / (1000 * 60 * 60 * 24);
            
            if (daysDiff < 7) {
                // Restore data
                document.getElementById('fullName').value = data.fullName || '';
                document.getElementById('jobTitle').value = data.jobTitle || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('phone').value = data.phone || '';
                document.getElementById('location').value = data.location || '';
                document.getElementById('about').value = data.about || '';
                
                cvData = data;
                educationCount = Math.max(...cvData.educations.map(e => e.id || 0), 0);
                experienceCount = Math.max(...cvData.experiences.map(e => e.id || 0), 0);
                skillCount = Math.max(...cvData.skills.map(s => s.id || 0), 0);
                languageCount = Math.max(...cvData.languages.map(l => l.id || 0), 0);
                interestCount = Math.max(...cvData.interests.map(i => i.id || 0), 0);
                
                if (data.photo) {
                    currentPhotoData = data.photo;
                    updatePhotoPreview();
                }
                
                document.getElementById('fontTitle').value = data.fontTitle || 'Poppins';
                document.getElementById('fontBody').value = data.fontBody || 'Roboto';
                document.getElementById('nameSize').value = data.nameSize || 36;
                document.getElementById('jobTitleSize').value = data.jobTitleSize || 16;
                document.getElementById('metaSize').value = data.metaSize || 11;
                document.getElementById('sectionTitleSize').value = data.sectionTitleSize || 16;
                document.getElementById('bodyFontSize').value = data.bodyFontSize || 13;
                
                if (data.template) switchTemplate(data.template);
                if (data.primaryColor) {
                    document.getElementById('primaryColor').value = data.primaryColor;
                    updateColorSwatchActive(data.primaryColor);
                }
                
                renderDynamicLists();
                showToast('Données restaurées de la sauvegarde automatique', 'info');
                console.log('✅ Auto-save restored');
            }
        } catch (e) {
            console.error('Error restoring auto-save:', e);
        }
    }
}
function setupResponsive() {
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('editorSidebar');
        const toggle = document.getElementById('sidebarToggle');
        if (window.innerWidth <= 768 && isMobileOpen) {
            if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                closeSidebar();
            }
        }
    });
    
    // Handle window resize with debounce
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResponsiveResize();
        }, 250);
    });
    
    // Close sidebar when switching to desktop
    handleResponsiveResize();
}

function handleResponsiveResize() {
    if (window.innerWidth > 768) {
        openSidebar();
        document.getElementById('sidebarToggle').style.display = 'none';
    } else {
        document.getElementById('sidebarToggle').style.display = 'flex';
    }
}

function toggleSidebar() {
    if (isMobileOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('editorSidebar');
    if (!sidebar) return;
    sidebar.classList.add('active');
    isMobileOpen = true;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
}

function closeSidebar() {
    const sidebar = document.getElementById('editorSidebar');
    if (!sidebar) return;
    sidebar.classList.remove('active');
    isMobileOpen = false;
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
}

// Close sidebar when clicking outside on mobile
function initMobileClosers() {
    if (window.innerWidth <= 640) {
        // Close sidebar when clicking on preview area
        const preview = document.querySelector('.editor-preview');
        if (preview) {
            preview.addEventListener('click', () => {
                if (isMobileOpen) closeSidebar();
            });
        }

        // Close sidebar when clicking a tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(closeSidebar, 100);
            });
        });
    }
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.getAttribute('data-tab'));
        });
    });

    // Font size sliders are handled with inline oninput, but ensure event listeners exist
}

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// ===== PHOTO HANDLING WITH COMPRESSION =====
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size - compress if needed
    const maxSize = 500 * 1024; // 500KB max
    if (file.size > maxSize) {
        const canvas = document.createElement('canvas');
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Resize image
                canvas.width = img.width * 0.8;
                canvas.height = img.height * 0.8;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                currentPhotoData = canvas.toDataURL('image/jpeg', 0.8);
                updatePhotoPreview();
                updatePreview();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentPhotoData = e.target.result;
            updatePhotoPreview();
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

function updatePhotoPreview() {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = `<img src="${currentPhotoData}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
}

// ===== DYNAMIC SECTIONS =====
function renderDynamicLists() {
    renderEducationList();
    renderExperienceList();
    renderSkillsList();
    renderLanguagesList();
    renderInterestsList();
}

function addEducation() {
    educationCount++;
    cvData.educations.push({ id: educationCount, school: '', title: '', year: '' });
    renderEducationList();
}

function removeEducation(id) {
    cvData.educations = cvData.educations.filter(e => e.id !== id);
    renderEducationList();
    updatePreview();
}

function renderEducationList() {
    const list = document.getElementById('educationList');
    list.innerHTML = '';
    cvData.educations.forEach((edu, idx) => {
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="item-header">
                <span>Formation ${idx + 1}</span>
                <button class="btn-remove" onclick="removeEducation(${edu.id})"><i class="fas fa-trash"></i></button>
            </div>
            <input type="text" placeholder="École/Université" value="${edu.school || ''}" onchange="cvData.educations.find(e=>e.id==${edu.id}).school=this.value; updatePreview()">
            <input type="text" placeholder="Diplôme/Titre" value="${edu.title || ''}" onchange="cvData.educations.find(e=>e.id==${edu.id}).title=this.value; updatePreview()">
            <input type="text" placeholder="Année (ex: 2020-2023)" value="${edu.year || ''}" onchange="cvData.educations.find(e=>e.id==${edu.id}).year=this.value; updatePreview()">
        `;
        list.appendChild(div);
    });
}

function addExperience() {
    experienceCount++;
    cvData.experiences.push({ id: experienceCount, title: '', company: '', period: '', description: '' });
    renderExperienceList();
}

function removeExperience(id) {
    cvData.experiences = cvData.experiences.filter(e => e.id !== id);
    renderExperienceList();
    updatePreview();
}

function renderExperienceList() {
    const list = document.getElementById('experienceList');
    list.innerHTML = '';
    cvData.experiences.forEach((exp, idx) => {
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="item-header">
                <span>Expérience ${idx + 1}</span>
                <button class="btn-remove" onclick="removeExperience(${exp.id})"><i class="fas fa-trash"></i></button>
            </div>
            <input type="text" placeholder="Titre du poste" value="${exp.title || ''}" onchange="cvData.experiences.find(e=>e.id==${exp.id}).title=this.value; updatePreview()">
            <input type="text" placeholder="Entreprise" value="${exp.company || ''}" onchange="cvData.experiences.find(e=>e.id==${exp.id}).company=this.value; updatePreview()">
            <input type="text" placeholder="Période (ex: Jan 2020 - Présent)" value="${exp.period || ''}" onchange="cvData.experiences.find(e=>e.id==${exp.id}).period=this.value; updatePreview()">
            <textarea placeholder="Description (puces avec •)" onchange="cvData.experiences.find(e=>e.id==${exp.id}).description=this.value; updatePreview()">${exp.description || ''}</textarea>
        `;
        list.appendChild(div);
    });
}

function addSkill() {
    skillCount++;
    cvData.skills.push({ id: skillCount, name: '' });
    renderSkillsList();
}

function removeSkill(id) {
    cvData.skills = cvData.skills.filter(s => s.id !== id);
    renderSkillsList();
    updatePreview();
}

function renderSkillsList() {
    const list = document.getElementById('skillsList');
    list.innerHTML = '';
    cvData.skills.forEach((skill, idx) => {
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="skill-input-group">
                <input type="text" placeholder="Compétence" value="${skill.name || ''}" onchange="cvData.skills.find(s=>s.id==${skill.id}).name=this.value; updatePreview()">
                <button class="btn-remove" onclick="removeSkill(${skill.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(div);
    });
}

function addLanguage() {
    languageCount++;
    cvData.languages.push({ id: languageCount, name: '', level: 50 });
    renderLanguagesList();
}

function removeLanguage(id) {
    cvData.languages = cvData.languages.filter(l => l.id !== id);
    renderLanguagesList();
    updatePreview();
}

function renderLanguagesList() {
    const list = document.getElementById('languagesList');
    list.innerHTML = '';
    cvData.languages.forEach((lang, idx) => {
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="language-input-group">
                <input type="text" placeholder="Langue" value="${lang.name || ''}" onchange="cvData.languages.find(l=>l.id==${lang.id}).name=this.value; updatePreview()" style="flex:1;">
                <input type="range" min="0" max="100" value="${lang.level || 50}" onchange="cvData.languages.find(l=>l.id==${lang.id}).level=parseInt(this.value); updatePreview()" style="flex:1;">
                <span class="level-display">${lang.level || 50}%</span>
                <button class="btn-remove" onclick="removeLanguage(${lang.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(div);
    });
}

function addInterest() {
    interestCount++;
    cvData.interests.push({ id: interestCount, name: '' });
    renderInterestsList();
}

function removeInterest(id) {
    cvData.interests = cvData.interests.filter(i => i.id !== id);
    renderInterestsList();
    updatePreview();
}

function renderInterestsList() {
    const list = document.getElementById('interestsList');
    list.innerHTML = '';
    cvData.interests.forEach((interest, idx) => {
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <div class="skill-input-group">
                <input type="text" placeholder="Intérêt" value="${interest.name || ''}" onchange="cvData.interests.find(i=>i.id==${interest.id}).name=this.value; updatePreview()">
                <button class="btn-remove" onclick="removeInterest(${interest.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(div);
    });
}

// ===== LOAD EXAMPLE =====
function loadExample(exampleName) {
    const example = exampleTemplates[exampleName];
    if (!example) return;

    // Profile info
    document.getElementById('fullName').value = example.fullName;
    document.getElementById('jobTitle').value = example.jobTitle;
    document.getElementById('email').value = example.email;
    document.getElementById('phone').value = example.phone;
    document.getElementById('location').value = example.location;
    document.getElementById('about').value = example.about;

    // Data
    cvData.fullName = example.fullName;
    cvData.jobTitle = example.jobTitle;
    cvData.email = example.email;
    cvData.phone = example.phone;
    cvData.location = example.location;
    cvData.about = example.about;
    cvData.educations = example.educations.map((e, i) => ({ id: ++educationCount, ...e }));
    cvData.experiences = example.experiences.map((e, i) => ({ id: ++experienceCount, ...e }));
    cvData.skills = example.skills.map((s, i) => ({ id: ++skillCount, name: s }));
    cvData.languages = example.languages.map((l, i) => ({ id: ++languageCount, ...l }));
    cvData.interests = example.interests.map((i, idx) => ({ id: ++interestCount, name: i }));

    // Design
    document.getElementById('fontTitle').value = example.fontTitle || 'Poppins';
    document.getElementById('fontBody').value = example.fontBody || 'Roboto';
    document.getElementById('primaryColor').value = example.primaryColor || '#00eeff';

    switchTemplate(example.template);
    updateColorSwatchActive(example.primaryColor || '#00eeff');
    renderDynamicLists();
    switchTab('content');
    updatePreview();
}

// ===== TEMPLATE SWITCHING =====
function switchTemplate(templateName) {
    currentTemplate = templateName;
    document.querySelectorAll('.template-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-template="${templateName}"]`).classList.add('active');
    updatePreview();
}

function applyColorPreset(presetName) {
    const presets = {
        modern: '#00eeff',
        classic: '#1a5f7a',
        bold: '#ff6600',
        minimal: '#000000'
    };
    setColor(presets[presetName]);
}

// ===== PREVIEW UPDATE WITH DEBOUNCE & CACHE =====
let previewTimeout;
let lastPreviewState = null;
let lastPreviewHTML = '';

function updatePreview() {
    autoSaveCV(); // Auto-save on any change
    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(() => {
        renderPreview();
    }, 100); // Debounce 100ms (optimized from 150)
}

function renderPreview() {
    // Create current state for cache check
    const currentState = {
        fullName: document.getElementById('fullName').value,
        jobTitle: document.getElementById('jobTitle').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        about: document.getElementById('about').value,
        primaryColor: document.getElementById('primaryColor').value,
        fontTitle: document.getElementById('fontTitle').value,
        fontBody: document.getElementById('fontBody').value,
        nameSize: document.getElementById('nameSize')?.value || nameSize,
        jobTitleSize: document.getElementById('jobTitleSize')?.value || jobTitleSize,
        metaSize: document.getElementById('metaSize')?.value || metaSize,
        sectionTitleSize: document.getElementById('sectionTitleSize')?.value || sectionTitleSize,
        bodyFontSize: document.getElementById('bodyFontSize')?.value || bodyFontSize,
        template: currentTemplate,
        photo: currentPhotoData,
        skills: cvData.skills.length,
        experiences: cvData.experiences.length,
        educations: cvData.educations.length,
        languages: cvData.languages.length,
        interests: cvData.interests.length
    };
    
    // Compare with last state for cache hit
    if (lastPreviewState && JSON.stringify(lastPreviewState) === JSON.stringify(currentState) && lastPreviewHTML) {
        return; // Skip render if nothing changed
    }
    
    lastPreviewState = currentState;
    const preview = document.getElementById('cvPreview');
    
    // Get form values
    const fullName = document.getElementById('fullName').value || 'Nom Complet';
    const jobTitle = document.getElementById('jobTitle').value || 'Titre';
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;
    const about = document.getElementById('about').value;
    const primaryColor = document.getElementById('primaryColor').value;
    const fontTitle = document.getElementById('fontTitle').value;
    const fontBody = document.getElementById('fontBody').value;

    // Update class
    preview.className = `cv-page ${currentTemplate}-template`;
    preview.style.setProperty('--cv-primary', primaryColor);
    preview.style.fontFamily = fontBody;

    // Récupère les valeurs des tailles
    const name = document.getElementById('nameSize')?.value || nameSize;
    const jobTitle2 = document.getElementById('jobTitleSize')?.value || jobTitleSize;
    const meta = document.getElementById('metaSize')?.value || metaSize;
    const sectionTitle = document.getElementById('sectionTitleSize')?.value || sectionTitleSize;
    const body = document.getElementById('bodyFontSize')?.value || bodyFontSize;

    nameSize = parseInt(name);
    jobTitleSize = parseInt(jobTitle2);
    metaSize = parseInt(meta);
    sectionTitleSize = parseInt(sectionTitle);
    bodyFontSize = parseInt(body);

    let html = '';
    
    // Use special templates for custom layouts
    if (currentTemplate === 'professionnel') {
        html = generateProfessionnelTemplate(fullName, jobTitle, email, phone, location, about, primaryColor, fontTitle, fontBody);
    } else if (currentTemplate === 'elegant') {
        html = generateElegantTemplate(fullName, jobTitle, email, phone, location, about, primaryColor, fontTitle, fontBody);
    } else if (currentTemplate === 'corporate') {
        html = generateCorporateTemplate(fullName, jobTitle, email, phone, location, about, primaryColor, fontTitle, fontBody);
    } else if (currentTemplate === 'academic') {
        html = generateAcademicTemplate(fullName, jobTitle, email, phone, location, about, primaryColor, fontTitle, fontBody);
    } else {
        // Default templates logic
    // HEADER
    html += `
        <div class="cv-header">
            ${currentPhotoData ? `<img src="${currentPhotoData}" class="cv-photo" alt="Photo" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin-bottom:15px;">` : ''}
            <div class="cv-name" style="font-family:'${fontTitle}';font-size:${nameSize}px;font-weight:700;color:${primaryColor};margin-bottom:5px;">${fullName}</div>
            <div class="cv-title" style="font-size:${jobTitleSize}px;color:${primaryColor};font-weight:600;margin-bottom:10px;">${jobTitle}</div>
            <div class="cv-meta" style="font-size:${metaSize}px;color:#666;">
                ${email ? `<span><i class="fas fa-envelope"></i> ${email}</span> • ` : ''}
                ${phone ? `<span><i class="fas fa-phone"></i> ${phone}</span> • ` : ''}
                ${location ? `<span><i class="fas fa-map-marker"></i> ${location}</span>` : ''}
            </div>
        </div>
    `;

    // ABOUT
    if (about) {
        html += `
            <div class="cv-section" style="margin-top:20px;">
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:${sectionTitleSize}px;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">À Propos</div>
                <p style="font-size:${bodyFontSize}px;color:#333;line-height:1.6;">${about}</p>
            </div>
        `;
    }

    // SKILLS
    if (cvData.skills.length > 0) {
        html += `
            <div class="cv-section" style="margin-top:15px;">
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:${sectionTitleSize}px;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">Compétences</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${cvData.skills.map(s => `<span style="background:${primaryColor};color:white;padding:5px 10px;border-radius:15px;font-size:${bodyFontSize * 0.9}px;">${s.name}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // EXPERIENCES
    if (cvData.experiences.length > 0) {
        html += `
            <div class="cv-section" style="margin-top:15px;">
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:${sectionTitleSize}px;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">Expériences</div>
                ${cvData.experiences.map(exp => `
                    <div style="margin-bottom:12px;">
                        <div style="font-weight:700;color:#000;font-size:${bodyFontSize * 1.05}px;">${exp.title}</div>
                        <div style="color:${primaryColor};font-weight:600;font-size:${bodyFontSize * 0.95}px;">${exp.company}</div>
                        <div style="color:#999;font-size:${bodyFontSize * 0.85}px;margin-bottom:5px;">${exp.period}</div>
                        <div style="font-size:${bodyFontSize}px;color:#333;white-space:pre-wrap;line-height:1.5;">${exp.description}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // EDUCATION
    if (cvData.educations.length > 0) {
        html += `
            <div class="cv-section" style="margin-top:15px;">
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:${sectionTitleSize}px;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">Formation</div>
                ${cvData.educations.map(edu => `
                    <div style="margin-bottom:10px;">
                        <div style="font-weight:700;color:#000;font-size:${bodyFontSize}px;">${edu.title}</div>
                        <div style="color:${primaryColor};font-weight:600;font-size:${bodyFontSize * 0.95}px;">${edu.school}</div>
                        <div style="color:#999;font-size:${bodyFontSize * 0.85}px;">${edu.year}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // LANGUAGES
    if (cvData.languages.length > 0) {
        html += `
            <div class="cv-section" style="margin-top:15px;">
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:${sectionTitleSize}px;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">Langues</div>
                ${cvData.languages.map(lang => `
                    <div style="margin-bottom:8px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                            <span style="font-weight:600;font-size:${bodyFontSize}px;">${lang.name}</span>
                            <span style="color:#666;font-size:${bodyFontSize * 0.85}px;">${lang.level}%</span>
                        </div>
                        <div style="width:100%;height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden;">
                            <div style="height:100%;background:${primaryColor};width:${lang.level}%;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // INTERESTS
    if (cvData.interests.length > 0) {
        html += `
            <div class="cv-section" style="margin-top:15px;">
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:${sectionTitleSize}px;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">Intérêts</div>
                <p style="font-size:${bodyFontSize}px;color:#333;">${cvData.interests.map(i => i.name).join(' • ')}</p>
            </div>
        `;
    }
    
    } // Close else block for default templates

    preview.innerHTML = html;
    lastPreviewHTML = html; // Cache the output
    
    // Auto-adjust zoom for mobile
    adjustZoomForScreen();
    
    // Detect page overflow in auto mode
    if (isAutoPageMode) {
        setTimeout(detectPageOverflow, 50);
    }
}

// ===== SMART ZOOM FOR RESPONSIVE =====
function adjustZoomForScreen() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;
    
    if (isMobile) {
        // Mobile: fit content to viewport
        const pageContainer = document.getElementById('previewContainer');
        if (pageContainer && pageContainer.parentElement) {
            const availableWidth = Math.max(pageContainer.parentElement.clientWidth - 40, 250);
            // A4 width is 210mm = ~794px at 96dpi
            const targetZoom = (availableWidth / 794) * 100;
            zoomLevel = Math.max(Math.min(targetZoom, 100), 50);
            applyZoom();
        }
    } else if (isTablet) {
        zoomLevel = 85;
        applyZoom();
    } else {
        zoomLevel = 100;
        applyZoom();
    }
}

// ===== PROFESSIONAL 2-COLUMN TEMPLATE =====
function generateProfessionnelTemplate(fullName, jobTitle, email, phone, location, about, primaryColor, fontTitle, fontBody) {
    let html = `
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 0; height: 100%; background: white;">
            <!-- SIDEBAR (LEFT) -->
            <div style="background: #f5f5f5; padding: 40px 25px; border-right: 2px solid ${primaryColor}; display: flex; flex-direction: column; gap: 25px;">
    `;
    
    // PHOTO
    if (currentPhotoData) {
        html += `
            <div style="text-align: center;">
                <img src="${currentPhotoData}" alt="Photo" style="width: 140px; height: 140px; border-radius: 20px; object-fit: cover; border: 3px solid ${primaryColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: block; margin: 0 auto;">
            </div>
        `;
    }
    
    // PROFILE NAME & TITLE (sidebar)
    html += `
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center;">
            <div style="font-size: 1.6em; font-weight: 700; color: #000; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">${fullName}</div>
            <div style="font-size: 0.95em; color: #666; font-weight: 500;">${jobTitle}</div>
        </div>
    `;
    
    // CONTACT INFO
    html += `
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 0.85em; color: #777; line-height: 1.8;">
            ${email ? `<div style="margin-bottom: 5px;"><i style="color: ${primaryColor}; margin-right: 5px;" class="fas fa-envelope"></i>${email}</div>` : ''}
            ${phone ? `<div style="margin-bottom: 5px;"><i style="color: ${primaryColor}; margin-right: 5px;" class="fas fa-phone"></i>${phone}</div>` : ''}
            ${location ? `<div style="margin-bottom: 5px;"><i style="color: ${primaryColor}; margin-right: 5px;" class="fas fa-map-marker"></i>${location}</div>` : ''}
        </div>
    `;
    
    // INTERESTS
    if (cvData.interests.length > 0) {
        html += `
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
                <div style="font-size: 1.1em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.5px;">
                    <i class="fas fa-heart"></i> INTÉRÊTS
                </div>
                <div style="font-size: 0.9em; color: #555; line-height: 1.6;">
                    ${cvData.interests.map(i => `<div style="margin-bottom: 5px;">• ${i.name}</div>`).join('')}
                </div>
            </div>
        `;
    }
    
    // LANGUAGES
    if (cvData.languages.length > 0) {
        html += `
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
                <div style="font-size: 1.1em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.5px;">
                    <i class="fas fa-globe"></i> LANGUES
                </div>
                ${cvData.languages.map(lang => `
                    <div style="margin-bottom: 10px; font-size: 0.9em;">
                        <div style="font-weight: 500; color: #000; margin-bottom: 3px;">${lang.name}</div>
                        <div style="height: 4px; background: #e0e0e0; border-radius: 2px; overflow: hidden;">
                            <div style="height: 100%; background: ${primaryColor}; width: ${lang.level}%;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    html += `
            </div>
            
            <!-- MAIN CONTENT (RIGHT) -->
            <div style="padding: 40px 35px; display: flex; flex-direction: column; gap: 25px;">
    `;
    
    // ABOUT
    if (about) {
        html += `
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
                <div style="font-size: 1.2em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-user-circle"></i> PROFIL
                </div>
                <div style="font-size: 0.9em; color: #555; line-height: 1.6; text-align: justify;">${about}</div>
            </div>
        `;
    }
    
    // FORMATION
    if (cvData.educations.length > 0) {
        html += `
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
                <div style="font-size: 1.2em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-graduation-cap"></i> FORMATION
                </div>
                ${cvData.educations.map(edu => `
                    <div style="margin-bottom: 12px;">
                        <div style="font-weight: 700; color: #000; font-size: 0.95em;">${edu.title}</div>
                        <div style="color: ${primaryColor}; font-weight: 600; font-size: 0.9em;">${edu.school}</div>
                        <div style="color: #999; font-size: 0.85em;">${edu.year}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // COMPETENCES
    if (cvData.skills.length > 0) {
        html += `
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
                <div style="font-size: 1.2em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-cogs"></i> COMPÉTENCES
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${cvData.skills.map(s => `<div style="background: ${primaryColor}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.85em;">${s.name}</div>`).join('')}
                </div>
            </div>
        `;
    }
    
    // EXPERIENCES
    if (cvData.experiences.length > 0) {
        html += `
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
                <div style="font-size: 1.2em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-briefcase"></i> EXPÉRIENCES
                </div>
                ${cvData.experiences.map(exp => `
                    <div style="margin-bottom: 12px;">
                        <div style="font-weight: 700; color: #000; font-size: 0.95em;">${exp.title}</div>
                        <div style="color: ${primaryColor}; font-weight: 600; font-size: 0.9em;">${exp.company}</div>
                        <div style="color: #999; font-size: 0.85em; margin-bottom: 4px;">${exp.period}</div>
                        <div style="font-size: 0.85em; color: #555; line-height: 1.5; white-space: pre-wrap;">${exp.description}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// ===== ELEGANT TEMPLATE GENERATOR =====
function generateElegantTemplate(fullName, jobTitle, email, phone, location, about, primaryColor, fontTitle, fontBody) {
    let html = `
        <div style="display: flex; flex-direction: column; gap: 25px; background: white;">
            <!-- HEADER WITH PHOTO -->
            <div style="display: flex; align-items: flex-start; gap: 30px; padding: 30px 0; border-bottom: 2px solid ${primaryColor}; margin-top: 20px;">
                ${currentPhotoData ? `
                    <img src="${currentPhotoData}" alt="Photo" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid ${primaryColor}; flex-shrink: 0;">
                ` : `
                    <div style="width: 120px; height: 120px; border-radius: 50%; background: rgba(0,0,0,0.1); border: 4px solid ${primaryColor}; flex-shrink: 0;"></div>
                `}
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 2.5em; font-weight: 700; color: #000; margin-bottom: 8px; letter-spacing: 1px;">${fullName}</div>
                    <div style="font-size: 1.3em; color: ${primaryColor}; font-weight: 600; margin-bottom: 12px;">${jobTitle}</div>
                    <div style="display: flex; gap: 15px; font-size: 0.9em; color: #666; flex-wrap: wrap;">
                        ${email ? `<span style="display: flex; align-items: center; gap: 6px;"><i style="color: ${primaryColor};" class="fas fa-envelope"></i>${email}</span>` : ''}
                        ${phone ? `<span style="display: flex; align-items: center; gap: 6px;"><i style="color: ${primaryColor};" class="fas fa-phone"></i>${phone}</span>` : ''}
                        ${location ? `<span style="display: flex; align-items: center; gap: 6px;"><i style="color: ${primaryColor};" class="fas fa-map-marker-alt"></i>${location}</span>` : ''}
                    </div>
                </div>
            </div>
            
            <!-- ABOUT -->
            ${about ? `
                <div>
                    <div style="font-size: 1.2em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 2px solid rgba(0,132,255,0.2); display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-user-circle"></i> PROFIL
                    </div>
                    <div style="font-size: 0.9em; color: #555; line-height: 1.6; text-align: justify;">${about}</div>
                </div>
            ` : ''}
            
            <!-- EXPERIENCES -->
            ${cvData.experiences.length > 0 ? `
                <div>
                    <div style="font-size: 1.2em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 2px solid rgba(0,132,255,0.2); display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-briefcase"></i> EXPÉRIENCES
                    </div>
                    ${cvData.experiences.map(exp => `
                        <div style="margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #f0f0f0;">
                            <div style="font-weight: 700; color: #000; font-size: 1em; margin-bottom: 4px;">${exp.title}</div>
                            <div style="font-size: 0.95em; color: ${primaryColor}; font-weight: 600; margin-bottom: 4px;">${exp.company}</div>
                            <div style="font-size: 0.85em; color: #999; margin-bottom: 6px;">${exp.period}</div>
                            <div style="font-size: 0.9em; color: #555; line-height: 1.6; white-space: pre-wrap;">${exp.description}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- FORMATION -->
            ${cvData.educations.length > 0 ? `
                <div>
                    <div style="font-size: 1.2em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 2px solid rgba(0,132,255,0.2); display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-graduation-cap"></i> FORMATION
                    </div>
                    ${cvData.educations.map(edu => `
                        <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f5f5f5;">
                            <div style="font-weight: 700; color: #000; font-size: 0.95em;">${edu.title}</div>
                            <div style="font-size: 0.85em; color: ${primaryColor}; font-weight: 600;">${edu.school}</div>
                            <div style="font-size: 0.8em; color: #999;">${edu.year}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- COMPETENCES -->
            ${cvData.skills.length > 0 ? `
                <div>
                    <div style="font-size: 1.2em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 2px solid rgba(0,132,255,0.2); display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-cogs"></i> COMPÉTENCES
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${cvData.skills.map(s => `<div style="background: transparent; border: 1px solid ${primaryColor}; color: ${primaryColor}; padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 500;">${s.name}</div>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- LANGUES -->
            ${cvData.languages.length > 0 ? `
                <div>
                    <div style="font-size: 1.2em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 2px solid rgba(0,132,255,0.2); display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-globe"></i> LANGUES
                    </div>
                    ${cvData.languages.map(lang => `
                        <div style="display: grid; grid-template-columns: 150px 1fr; gap: 15px; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f5f5f5;">
                            <div style="font-weight: 600; color: #000; font-size: 0.95em;">${lang.name}</div>
                            <div style="height: 5px; background: #e0e0e0; border-radius: 2px; overflow: hidden;">
                                <div style="height: 100%; background: ${primaryColor}; width: ${lang.level}%;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- INTÉRÊTS -->
            ${cvData.interests.length > 0 ? `
                <div>
                    <div style="font-size: 1.2em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 2px solid rgba(0,132,255,0.2); display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-heart"></i> INTÉRÊTS
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                        ${cvData.interests.map(i => `<span style="font-size: 0.9em; color: #555;">${i.name}</span>`).join(' • ')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    return html;
}

// ===== CORPORATE TEMPLATE GENERATOR =====
function generateCorporateTemplate(fullName, jobTitle, email, phone, location, about, primaryColor, fontTitle, fontBody) {
    let html = `
        <div>
            <!-- HEADER -->
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 30px; padding: 40px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; align-items: center;">
                ${currentPhotoData ? `
                    <img src="${currentPhotoData}" alt="Photo" style="width: 100px; height: 100px; border-radius: 8px; object-fit: cover; border: 3px solid ${primaryColor};">
                ` : `
                    <div style="width: 100px; height: 100px; border-radius: 8px; background: rgba(0,0,0,0.1); border: 3px solid ${primaryColor};"></div>
                `}
                <div>
                    <div style="font-size: 2.2em; font-weight: 700; color: #000; margin-bottom: 5px;">${fullName}</div>
                    <div style="font-size: 1.1em; color: ${primaryColor}; font-weight: 600; margin-bottom: 8px;">${jobTitle}</div>
                    <div style="display: flex; gap: 20px; font-size: 0.9em; color: #666;">
                        ${email ? `<span><i style="color: ${primaryColor};" class="fas fa-envelope"></i> ${email}</span>` : ''}
                        ${phone ? `<span><i style="color: ${primaryColor};" class="fas fa-phone"></i> ${phone}</span>` : ''}
                        ${location ? `<span><i style="color: ${primaryColor};" class="fas fa-map-marker-alt"></i> ${location}</span>` : ''}
                    </div>
                </div>
            </div>
            
            <!-- SECTIONS -->
            ${about ? `
                <div style="padding: 30px 40px; border-bottom: 1px solid #f0f0f0;">
                    <div style="font-size: 1.1em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid ${primaryColor};">
                        <i class="fas fa-user-circle"></i> À PROPOS
                    </div>
                    <div style="font-size: 0.9em; color: #555; line-height: 1.6;">${about}</div>
                </div>
            ` : ''}
            
            ${cvData.experiences.length > 0 ? `
                <div style="padding: 30px 40px; border-bottom: 1px solid #f0f0f0;">
                    <div style="font-size: 1.1em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid ${primaryColor};">
                        <i class="fas fa-briefcase"></i> EXPÉRIENCES
                    </div>
                    ${cvData.experiences.map(exp => `
                        <div style="margin-bottom: 15px;">
                            <div style="font-weight: 700; color: #000; font-size: 1em;">${exp.title}</div>
                            <div style="color: ${primaryColor}; font-weight: 600; font-size: 0.95em;">${exp.company}</div>
                            <div style="color: #999; font-size: 0.85em; margin-bottom: 4px;">${exp.period}</div>
                            <div style="color: #555; font-size: 0.9em; line-height: 1.5;">${exp.description}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${cvData.educations.length > 0 ? `
                <div style="padding: 30px 40px; border-bottom: 1px solid #f0f0f0;">
                    <div style="font-size: 1.1em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid ${primaryColor};">
                        <i class="fas fa-graduation-cap"></i> FORMATION
                    </div>
                    ${cvData.educations.map(edu => `
                        <div style="margin-bottom: 12px;">
                            <div style="font-weight: 700; color: #000; font-size: 1em;">${edu.title}</div>
                            <div style="color: ${primaryColor}; font-weight: 600; font-size: 0.95em;">${edu.school}</div>
                            <div style="color: #999; font-size: 0.85em;">${edu.year}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${cvData.skills.length > 0 ? `
                <div style="padding: 30px 40px; border-bottom: 1px solid #f0f0f0;">
                    <div style="font-size: 1.1em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid ${primaryColor};">
                        <i class="fas fa-cogs"></i> COMPÉTENCES
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
                        ${cvData.skills.map(s => `<div style="background: ${primaryColor}; color: white; padding: 8px 12px; border-radius: 4px; font-size: 0.85em; text-align: center;">${s.name}</div>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${cvData.languages.length > 0 ? `
                <div style="padding: 30px 40px; border-bottom: 1px solid #f0f0f0;">
                    <div style="font-size: 1.1em; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid ${primaryColor};">
                        <i class="fas fa-globe"></i> LANGUES
                    </div>
                    ${cvData.languages.map(lang => `
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span style="font-weight: 600; font-size: 0.9em;">${lang.name}</span>
                                <span style="color: #999; font-size: 0.85em;">${lang.level}%</span>
                            </div>
                            <div style="height: 5px; background: #e0e0e0; border-radius: 2px; overflow: hidden;">
                                <div style="height: 100%; background: ${primaryColor}; width: ${lang.level}%;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    return html;
}

// ===== ACADEMIC TEMPLATE GENERATOR =====
function generateAcademicTemplate(fullName, jobTitle, email, phone, location, about, primaryColor, fontTitle, fontBody) {
    let html = `
        <div style="font-family: 'Georgia', serif;">
            <!-- HEADER -->
            <div style="padding: 40px; text-align: center; border-bottom: 2px solid #333;">
                ${currentPhotoData ? `
                    <img src="${currentPhotoData}" alt="Photo" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 2px solid #333; margin-bottom: 15px;">
                ` : ''}
                <div style="font-size: 1.8em; font-weight: 700; color: #000; margin-bottom: 5px; font-family: 'Times New Roman', serif;">${fullName}</div>
                <div style="font-size: 1em; color: #555; font-weight: 600; font-style: italic; margin-bottom: 10px;">${jobTitle}</div>
                <div style="display: flex; justify-content: center; gap: 15px; font-size: 0.9em; color: #666; flex-wrap: wrap;">
                    ${email ? `<span><i class="fas fa-envelope"></i> ${email}</span>` : ''}
                    ${phone ? `<span><i class="fas fa-phone"></i> ${phone}</span>` : ''}
                    ${location ? `<span><i class="fas fa-map-marker-alt"></i> ${location}</span>` : ''}
                </div>
            </div>
            
            <!-- ABOUT -->
            ${about ? `
                <div style="padding: 25px 40px; border-top: 1px solid #ddd;">
                    <div style="font-size: 1.1em; font-weight: 700; color: #000; text-transform: uppercase; margin-bottom: 12px; font-family: 'Times New Roman', serif;">
                        <i class="fas fa-user-circle"></i> PROFILE
                    </div>
                    <div style="font-size: 0.9em; color: #555; line-height: 1.6;">${about}</div>
                </div>
            ` : ''}
            
            <!-- EDUCATION -->
            ${cvData.educations.length > 0 ? `
                <div style="padding: 25px 40px; border-top: 1px solid #ddd;">
                    <div style="font-size: 1.1em; font-weight: 700; color: #000; text-transform: uppercase; margin-bottom: 12px; font-family: 'Times New Roman', serif;">
                        <i class="fas fa-graduation-cap"></i> EDUCATION
                    </div>
                    ${cvData.educations.map(edu => `
                        <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">
                            <div style="font-weight: 700; color: #000; font-size: 1em;">${edu.title}</div>
                            <div style="color: #666; font-style: italic; font-size: 0.95em;">${edu.school}</div>
                            <div style="color: #999; font-size: 0.85em;">${edu.year}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- EXPERIENCE -->
            ${cvData.experiences.length > 0 ? `
                <div style="padding: 25px 40px; border-top: 1px solid #ddd;">
                    <div style="font-size: 1.1em; font-weight: 700; color: #000; text-transform: uppercase; margin-bottom: 12px; font-family: 'Times New Roman', serif;">
                        <i class="fas fa-briefcase"></i> PROFESSIONAL EXPERIENCE
                    </div>
                    ${cvData.experiences.map(exp => `
                        <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0;">
                            <div style="font-weight: 700; color: #000; font-size: 1em;">${exp.title}</div>
                            <div style="color: #666; font-style: italic; font-size: 0.95em;">${exp.company}</div>
                            <div style="color: #999; font-size: 0.85em; margin-bottom: 4px;">${exp.period}</div>
                            <div style="color: #555; font-size: 0.9em; line-height: 1.6;">${exp.description}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- SKILLS -->
            ${cvData.skills.length > 0 ? `
                <div style="padding: 25px 40px; border-top: 1px solid #ddd;">
                    <div style="font-size: 1.1em; font-weight: 700; color: #000; text-transform: uppercase; margin-bottom: 12px; font-family: 'Times New Roman', serif;">
                        <i class="fas fa-cogs"></i> SKILLS
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${cvData.skills.map(s => `<div style="border: 1px solid #999; padding: 4px 8px; border-radius: 0; font-size: 0.9em;">${s.name}</div>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- LANGUAGES -->
            ${cvData.languages.length > 0 ? `
                <div style="padding: 25px 40px; border-top: 1px solid #ddd;">
                    <div style="font-size: 1.1em; font-weight: 700; color: #000; text-transform: uppercase; margin-bottom: 12px; font-family: 'Times New Roman', serif;">
                        <i class="fas fa-globe"></i> LANGUAGES
                    </div>
                    ${cvData.languages.map(lang => `
                        <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
                                <span style="font-weight: 600;">${lang.name}</span>
                                <span style="color: #999;">${lang.level}%</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    return html;
}

// ===== PHOTO EDITOR FUNCTIONS =====
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentPhotoData = e.target.result;
            document.getElementById('photoEditorTools').style.display = 'block';
            updatePreview();
            showToast('Photo téléchargée avec succès!', 'success', 2000);
        };
        reader.readAsDataURL(file);
    }
}

function applyPhotoFilter() {
    const crop = parseInt(document.getElementById('cropSlider').value) || 0;
    const brightness = parseInt(document.getElementById('brightnessSlider').value) || 100;
    const contrast = parseInt(document.getElementById('contrastSlider').value) || 100;
    
    // Apply filters to current photo display (would need canvas manipulation for true crop)
    const photoElements = document.querySelectorAll('.cv-photo, img[alt="Photo"]');
    photoElements.forEach(el => {
        el.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        el.style.borderRadius = Math.min(crop / 2, 50) + '%';
    });
    
    updatePreview();
}

// ===== EXPORT =====
function exportPDF() {
    showToast('Génération du PDF en cours...', 'info', 1500);
    const element = document.getElementById('cvPreview');
    
    // Crée une copie temporaire pour le PDF avec les styles appliqués
    const clonedElement = element.cloneNode(true);
    
    // Applique les styles inline pour que le PDF les capture
    const style = document.createElement('style');
    style.textContent = `
        body { margin: 0; padding: 0; }
        .cv-page { 
            background: white !important;
            color: #000 !important;
            padding: 40px !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
        }
    `;
    clonedElement.appendChild(style);
    
    html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: 'CV.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        },
        jsPDF: { 
            orientation: 'portrait', 
            unit: 'mm', 
            format: 'a4'
        }
    }).from(element).save();
    setTimeout(() => showToast('PDF téléchargé avec succès!', 'success'), 1000);
}

function exportPNG() {
    showToast('Génération de l\'image en cours...', 'info', 1500);
    const element = document.getElementById('cvPreview');
    html2canvas(element, { scale: 2, useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'CV.png';
        link.click();
        setTimeout(() => showToast('PNG téléchargé avec succès!', 'success'), 500);
    }).catch(() => {
        showToast('Erreur lors de la génération du PNG', 'error');
    });
}

function exportDOCX() {
    showToast('Génération du document Word en cours...', 'info', 1500);
    
    const fullName = document.getElementById('fullName').value || 'Nom Complet';
    const jobTitle = document.getElementById('jobTitle').value || 'Titre';
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;
    const about = document.getElementById('about').value;
    
    let docContent = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p><w:r><w:t xml:space="preserve">${escapeXml(fullName)}</w:t></w:r></w:p>
        <w:p><w:r><w:t xml:space="preserve">${escapeXml(jobTitle)}</w:t></w:r></w:p>
        <w:p><w:r><w:t xml:space="preserve">${escapeXml(email)} | ${escapeXml(phone)} | ${escapeXml(location)}</w:t></w:r></w:p>
        <w:p></w:p>
        <w:p><w:r><w:t xml:space="preserve">À PROPOS</w:t></w:r></w:p>
        <w:p><w:r><w:t xml:space="preserve">${escapeXml(about)}</w:t></w:r></w:p>
        <w:p></w:p>`;
    
    // Add sections
    if (cvData.experiences.length > 0) {
        docContent += `<w:p><w:r><w:t xml:space="preserve">EXPÉRIENCES</w:t></w:r></w:p>`;
        cvData.experiences.forEach(exp => {
            docContent += `<w:p><w:r><w:t xml:space="preserve">${escapeXml(exp.title)} - ${escapeXml(exp.company)} (${escapeXml(exp.period)})</w:t></w:r></w:p>`;
            docContent += `<w:p><w:r><w:t xml:space="preserve">${escapeXml(exp.description)}</w:t></w:r></w:p>`;
        });
        docContent += `<w:p></w:p>`;
    }
    
    if (cvData.educations.length > 0) {
        docContent += `<w:p><w:r><w:t xml:space="preserve">FORMATION</w:t></w:r></w:p>`;
        cvData.educations.forEach(edu => {
            docContent += `<w:p><w:r><w:t xml:space="preserve">${escapeXml(edu.title)} - ${escapeXml(edu.school)} (${escapeXml(edu.year)})</w:t></w:r></w:p>`;
        });
        docContent += `<w:p></w:p>`;
    }
    
    if (cvData.skills.length > 0) {
        docContent += `<w:p><w:r><w:t xml:space="preserve">COMPÉTENCES</w:t></w:r></w:p>`;
        docContent += `<w:p><w:r><w:t xml:space="preserve">${cvData.skills.map(s => s.name).join(', ')}</w:t></w:r></w:p>`;
        docContent += `<w:p></w:p>`;
    }
    
    if (cvData.languages.length > 0) {
        docContent += `<w:p><w:r><w:t xml:space="preserve">LANGUES</w:t></w:r></w:p>`;
        cvData.languages.forEach(lang => {
            docContent += `<w:p><w:r><w:t xml:space="preserve">${escapeXml(lang.name)} - ${lang.level}%</w:t></w:r></w:p>`;
        });
    }
    
    docContent += `</w:body></w:document>`;
    
    // Create and download simple text as DOCX-like format
    const blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'CV.docx';
    link.click();
    
    setTimeout(() => showToast('Document Word créé!', 'success'), 500);
}

function escapeXml(str) {
    if (!str) return '';
    return str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
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
        educations: cvData.educations,
        experiences: cvData.experiences,
        skills: cvData.skills,
        languages: cvData.languages,
        interests: cvData.interests,
        template: currentTemplate,
        fontTitle: document.getElementById('fontTitle').value,
        fontBody: document.getElementById('fontBody').value,
        nameSize: parseInt(document.getElementById('nameSize').value),
        jobTitleSize: parseInt(document.getElementById('jobTitleSize').value),
        metaSize: parseInt(document.getElementById('metaSize').value),
        sectionTitleSize: parseInt(document.getElementById('sectionTitleSize').value),
        bodyFontSize: parseInt(document.getElementById('bodyFontSize').value),
        primaryColor: document.getElementById('primaryColor').value,
        photo: currentPhotoData
    };

    const dataStr = JSON.stringify(data, null, 2);
    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    link.download = 'cv-data.json';
    link.click();
    showToast('Données sauvegardées avec succès!', 'success');
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

            cvData = data;
            educationCount = Math.max(...cvData.educations.map(e => e.id), 0);
            experienceCount = Math.max(...cvData.experiences.map(e => e.id), 0);
            skillCount = Math.max(...cvData.skills.map(s => s.id), 0);
            languageCount = Math.max(...cvData.languages.map(l => l.id), 0);
            interestCount = Math.max(...cvData.interests.map(i => i.id), 0);

            if (data.photo) {
                currentPhotoData = data.photo;
                const preview = document.getElementById('photoPreview');
                preview.innerHTML = `<img src="${currentPhotoData}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            }

            document.getElementById('fontTitle').value = data.fontTitle || 'Poppins';
            document.getElementById('fontBody').value = data.fontBody || 'Roboto';
            
            // Restore font sizes
            nameSize = data.nameSize || 36;
            jobTitleSize = data.jobTitleSize || 16;
            metaSize = data.metaSize || 11;
            sectionTitleSize = data.sectionTitleSize || 16;
            bodyFontSize = data.bodyFontSize || 13;
            
            document.getElementById('nameSize').value = nameSize;
            document.getElementById('jobTitleSize').value = jobTitleSize;
            document.getElementById('metaSize').value = metaSize;
            document.getElementById('sectionTitleSize').value = sectionTitleSize;
            document.getElementById('bodyFontSize').value = bodyFontSize;
            
            document.getElementById('nameSizeDisplay').textContent = nameSize + 'px';
            document.getElementById('jobTitleSizeDisplay').textContent = jobTitleSize + 'px';
            document.getElementById('metaSizeDisplay').textContent = metaSize + 'px';
            document.getElementById('sectionTitleSizeDisplay').textContent = sectionTitleSize + 'px';
            document.getElementById('bodySizeDisplay').textContent = bodyFontSize + 'px';
            
            document.getElementById('primaryColor').value = data.primaryColor || '#0ef';

            if (data.template) switchTemplate(data.template);
            updateColorSwatchActive(data.primaryColor || '#0ef');

            renderDynamicLists();
            updatePreview();
            showToast('CV chargé avec succès!', 'success');
        } catch (error) {
            showToast('Erreur lors du chargement du fichier', 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// ===== COLOR MANAGEMENT =====
function setColor(color) {
    document.getElementById('primaryColor').value = color;
    syncColorHex(color);
    updateColorSwatchActive(color);
    updatePreview();
}

function syncColorHex(color) {
    document.getElementById('primaryColorHex').textContent = color.toUpperCase();
}

function updateColorSwatchActive(color) {
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        const swatchColor = swatch.getAttribute('data-color');
        if (swatchColor === color.toLowerCase()) {
            swatch.classList.add('active');
        } else {
            swatch.classList.remove('active');
        }
    });
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
    container.style.transform = `scale(${zoomLevel / 100})`;
    container.style.transformOrigin = 'top center';
    document.getElementById('zoomLevel').textContent = zoomLevel + '%';
    // Store zoom in session
    sessionStorage.setItem('cv-zoom', zoomLevel);
}

// ===== PAGE MANAGEMENT =====
function addPage() {
    if (!isAutoPageMode) {
        totalPages++;
        currentPage = totalPages;
        updatePageIndicator();
        showToast(`Page ${totalPages} ajoutée`, 'success');
        updatePreview();
    } else {
        showToast('Mode automatique activé - les pages sont gérées automatiquement', 'info');
    }
}

function removePage() {
    if (!isAutoPageMode) {
        if (totalPages > 1) {
            totalPages--;
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            updatePageIndicator();
            showToast(`Page supprimée - ${totalPages} pages restantes`, 'success');
            updatePreview();
        } else {
            showToast('Impossible de supprimer la dernière page', 'warning');
        }
    } else {
        showToast('Mode automatique activé - les pages sont gérées automatiquement', 'info');
    }
}

function toggleAutoPage() {
    isAutoPageMode = !isAutoPageMode;
    const btn = document.getElementById('autoPageBtn');
    
    if (isAutoPageMode) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-magic"></i><span>Auto</span>';
        showToast('Mode automatique activé', 'info');
        // Reset to single page in auto mode
        totalPages = 1;
        currentPage = 1;
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-hand-pointer"></i><span>Manuel</span>';
        showToast('Mode manuel activé - vous pouvez ajouter/supprimer des pages', 'info');
    }
    
    updatePageIndicator();
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePageIndicator();
        updatePreview();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        updatePageIndicator();
        updatePreview();
    }
}

function updatePageIndicator() {
    const indicator = document.getElementById('currentPageDisplay');
    if (indicator) {
        indicator.textContent = `Page ${currentPage}/${totalPages}`;
    }
}

// ===== AUTO-PAGE DETECTION =====
function detectPageOverflow() {
    if (!isAutoPageMode) return;
    
    const preview = document.getElementById('cvPreview');
    if (!preview) return;
    
    // Calculate content height vs A4 height
    const contentHeight = preview.scrollHeight;
    const a4Height = 297 * 3.78; // Convert mm to pixels (approx)
    const maxContentHeight = a4Height * 0.85; // 85% of page height
    
    if (contentHeight > maxContentHeight) {
        // Content overflows, split into multiple pages
        const overflowRatio = contentHeight / maxContentHeight;
        const newPageCount = Math.ceil(overflowRatio);
        
        if (newPageCount !== totalPages) {
            totalPages = newPageCount;
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            updatePageIndicator();
        }
    } else {
        // Content fits on one page
        if (totalPages > 1) {
            totalPages = 1;
            currentPage = 1;
            updatePageIndicator();
        }
    }
}

// ===== NAVIGATION =====
function goBackToDashboard() {
    // Save before leaving
    if (currentCVId && currentUserId && window.CVDocumentManager) {
        autoSaveToFirebase().then(() => {
            sessionStorage.removeItem('currentCVId');
            sessionStorage.removeItem('currentUserId');
            window.location.href = 'dashboard.html';
        }).catch(() => {
            // Save failed, still go back but user will see error
            sessionStorage.removeItem('currentCVId');
            sessionStorage.removeItem('currentUserId');
            window.location.href = 'dashboard.html';
        });
    } else {
        sessionStorage.removeItem('currentCVId');
        sessionStorage.removeItem('currentUserId');
        window.location.href = 'dashboard.html';
    }
}

// ===== EXPOSE ALL FUNCTIONS TO WINDOW FOR ONCLICK HANDLERS =====
// This allows inline onclick="functionName()" to work in HTML
window.toggleDarkMode = toggleDarkMode;
window.switchTab = switchTab;
window.loadExample = loadExample;
window.exportPDF = exportPDF;
window.toggleSidebar = toggleSidebar;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.initMobileClosers = initMobileClosers;
window.toggleFont = toggleFont;
window.toggleColor = toggleColor;
window.addEducation = addEducation;
window.removeEducation = removeEducation;
window.addExperience = addExperience;
window.removeExperience = removeExperience;
window.addSkill = addSkill;
window.removeSkill = removeSkill;
window.addLanguage = addLanguage;
window.removeLanguage = removeLanguage;
window.addInterest = addInterest;
window.removeInterest = removeInterest;
window.addPage = addPage;
window.removePage = removePage;
window.toggleAutoPage = toggleAutoPage;
window.nextPage = nextPage;
window.previousPage = previousPage;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetZoom = resetZoom;
window.goBack = goBack;
window.saveCVToFirestore = saveCVToFirestore;
window.loadCVFromFirestore = loadCVFromFirestore;
window.autoSaveCVToFirestore = autoSaveCVToFirestore;
