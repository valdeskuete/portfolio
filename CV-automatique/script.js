// ===== GLOBAL STATE =====
let currentPhotoData = null;
let currentTemplate = 'minimal';
let zoomLevel = 100;

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
        primaryColor: '#0ef',
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
        primaryColor: '#0ef',
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
        primaryColor: '#0ef',
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ CV Generator Pro loaded');
    initializeEventListeners();
    renderDynamicLists();
    updatePreview();
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.getAttribute('data-tab'));
        });
    });
}

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
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
        preview.innerHTML = `<img src="${currentPhotoData}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        updatePreview();
    };
    reader.readAsDataURL(file);
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
    document.getElementById('primaryColor').value = example.primaryColor || '#0ef';

    switchTemplate(example.template);
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
        modern: '#0ef',
        classic: '#1a5f7a',
        bold: '#ff6600',
        minimal: '#000000'
    };
    document.getElementById('primaryColor').value = presets[presetName];
    updatePreview();
}

// ===== PREVIEW UPDATE =====
function updatePreview() {
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

    let html = '';

    // HEADER
    html += `
        <div class="cv-header">
            ${currentPhotoData ? `<img src="${currentPhotoData}" class="cv-photo" alt="Photo" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin-bottom:15px;">` : ''}
            <div class="cv-name" style="font-family:'${fontTitle}';font-size:2.2em;font-weight:700;color:${primaryColor};margin-bottom:5px;">${fullName}</div>
            <div class="cv-title" style="font-size:1.2em;color:${primaryColor};font-weight:600;margin-bottom:10px;">${jobTitle}</div>
            <div class="cv-meta" style="font-size:0.9em;color:#666;">
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
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:1.1em;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">À Propos</div>
                <p style="font-size:0.95em;color:#333;line-height:1.6;">${about}</p>
            </div>
        `;
    }

    // SKILLS
    if (cvData.skills.length > 0) {
        html += `
            <div class="cv-section" style="margin-top:15px;">
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:1.1em;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">Compétences</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${cvData.skills.map(s => `<span style="background:${primaryColor};color:white;padding:5px 10px;border-radius:15px;font-size:0.9em;">${s.name}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // EXPERIENCES
    if (cvData.experiences.length > 0) {
        html += `
            <div class="cv-section" style="margin-top:15px;">
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:1.1em;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">Expériences</div>
                ${cvData.experiences.map(exp => `
                    <div style="margin-bottom:12px;">
                        <div style="font-weight:700;color:#000;font-size:1em;">${exp.title}</div>
                        <div style="color:${primaryColor};font-weight:600;font-size:0.95em;">${exp.company}</div>
                        <div style="color:#999;font-size:0.85em;margin-bottom:5px;">${exp.period}</div>
                        <div style="font-size:0.95em;color:#333;white-space:pre-wrap;line-height:1.5;">${exp.description}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // EDUCATION
    if (cvData.educations.length > 0) {
        html += `
            <div class="cv-section" style="margin-top:15px;">
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:1.1em;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">Formation</div>
                ${cvData.educations.map(edu => `
                    <div style="margin-bottom:10px;">
                        <div style="font-weight:700;color:#000;">${edu.title}</div>
                        <div style="color:${primaryColor};font-weight:600;font-size:0.95em;">${edu.school}</div>
                        <div style="color:#999;font-size:0.85em;">${edu.year}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // LANGUAGES
    if (cvData.languages.length > 0) {
        html += `
            <div class="cv-section" style="margin-top:15px;">
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:1.1em;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">Langues</div>
                ${cvData.languages.map(lang => `
                    <div style="margin-bottom:8px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                            <span style="font-weight:600;">${lang.name}</span>
                            <span style="color:#666;font-size:0.85em;">${lang.level}%</span>
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
                <div class="cv-section-title" style="font-family:'${fontTitle}';font-size:1.1em;font-weight:700;color:${primaryColor};margin-bottom:10px;border-bottom:2px solid ${primaryColor};padding-bottom:5px;">Intérêts</div>
                <p style="font-size:0.95em;color:#333;">${cvData.interests.map(i => i.name).join(' • ')}</p>
            </div>
        `;
    }

    preview.innerHTML = html;
}

// ===== EXPORT =====
function exportPDF() {
    const element = document.getElementById('cvPreview');
    html2pdf().set({
        margin: 10,
        filename: 'CV.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    }).from(element).save();
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
        educations: cvData.educations,
        experiences: cvData.experiences,
        skills: cvData.skills,
        languages: cvData.languages,
        interests: cvData.interests,
        template: currentTemplate,
        fontTitle: document.getElementById('fontTitle').value,
        fontBody: document.getElementById('fontBody').value,
        primaryColor: document.getElementById('primaryColor').value,
        photo: currentPhotoData
    };

    const dataStr = JSON.stringify(data, null, 2);
    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    link.download = 'cv-data.json';
    link.click();
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
            document.getElementById('primaryColor').value = data.primaryColor || '#0ef';

            if (data.template) switchTemplate(data.template);

            renderDynamicLists();
            updatePreview();
            alert('✅ CV chargé avec succès!');
        } catch (error) {
            alert('❌ Erreur lors du chargement');
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
    container.style.transform = `scale(${zoomLevel / 100})`;
    container.style.transformOrigin = 'top center';
    document.getElementById('zoomLevel').textContent = zoomLevel + '%';
}
