// ===== VARIABLES GLOBALES =====
let educationCount = 0;
let experienceCount = 0;
let zoomLevel = 100;
let currentTemplate = 'classic';
let currentPhotoData = null;

const colorPresets = {
    modern: { primary: '#0ef', bg: '#ffffff', text: '#333333', subtitle: '#666666' },
    classic: { primary: '#1a5f7a', bg: '#f5f5f5', text: '#000000', subtitle: '#555555' },
    minimal: { primary: '#000000', bg: '#ffffff', text: '#000000', subtitle: '#888888' },
    bold: { primary: '#ff6600', bg: '#ffffff', text: '#222222', subtitle: '#777777' }
};

const templateStyles = {
    classic: { columns: '1', layout: 'classic' },
    modern: { columns: '2', layout: 'modern' },
    minimal: { columns: '1', layout: 'minimal' },
    luxury: { columns: '1', layout: 'luxury' },
    creative: { columns: '1', layout: 'creative' },
    tech: { columns: '1', layout: 'tech' }
};

const exampleTemplates = {
    dev: {
        fullName: 'Jean Dupont',
        jobTitle: 'Ingénieur Développeur Full Stack',
        email: 'jean.dupont@email.com',
        phone: '+237 650 123 456',
        location: 'Douala, Cameroun',
        about: 'Passionné par la création d\'applications web modernes et scalables. 5+ ans d\'expérience en développement full stack.',
        skills: 'JavaScript, React, Node.js, Python, MongoDB, PostgreSQL, Docker, AWS, Git',
        languages: 'Français (natif), Anglais (bilingue)',
        interests: 'Open Source, Machine Learning, DevOps, Entrepreneuriat',
        template: 'tech',
        colorPreset: 'modern',
        fontTitle: 'Roboto',
        fontSubtitle: 'Inter',
        fontBody: 'Open Sans',
        educations: [
            { school: 'Université de Yaoundé I', title: 'Licence Informatique', year: '2018-2021' },
            { school: 'École de Formation Tech', title: 'Bootcamp Full Stack', year: '2021' }
        ],
        experiences: [
            { title: 'Senior Developer', company: 'TechCorp Solutions', period: 'Jan 2022 - Présent', description: '• Led team of 5 developers\n• Architected API REST scalable\n• Improved performance by 40%' },
            { title: 'Junior Developer', company: 'StartupXYZ', period: 'Jan 2021 - Dec 2021', description: '• Developed 10+ features\n• Fixed critical bugs\n• Mentored 2 interns' }
        ]
    },
    designer: {
        fullName: 'Marie Anderson',
        jobTitle: 'Designer UX/UI',
        email: 'marie.anderson@email.com',
        phone: '+237 651 234 567',
        location: 'Yaoundé, Cameroun',
        about: 'Designer créative spécialisée en UX/UI avec passion pour créer des expériences utilisateur exceptionnelles.',
        skills: 'Figma, Adobe XD, UI Design, UX Research, Prototyping, Design Systems, Wireframing, User Testing',
        languages: 'Français (natif), Anglais (intermédiaire)',
        interests: 'Design Thinking, Illustration, Brand Design, Web Design',
        template: 'creative',
        colorPreset: 'bold',
        fontTitle: 'Playfair Display',
        fontSubtitle: 'Montserrat',
        fontBody: 'Lato',
        educations: [
            { school: 'ENSET Douala', title: 'Licence Design Graphique', year: '2019-2022' },
            { school: 'Cours Google UX Design', title: 'Certification Google', year: '2022' }
        ],
        experiences: [
            { title: 'UX/UI Designer', company: 'Design Agency Pro', period: 'Mar 2022 - Présent', description: '• Designed 15+ projects\n• Created comprehensive design systems\n• Conducted user research sessions' },
            { title: 'Graphic Designer', company: 'Creative Studio', period: 'Jan 2021 - Feb 2022', description: '• Designed branding materials\n• Created digital assets\n• Collaborated with marketing team' }
        ]
    },
    manager: {
        fullName: 'Ahmed Ibrahim',
        jobTitle: 'Directeur Commercial',
        email: 'ahmed.ibrahim@email.com',
        phone: '+237 652 345 678',
        location: 'Douala, Cameroun',
        about: 'Leader expérimenté avec 10+ ans de management. Spécialisé en développement d\'équipes et croissance commerciale.',
        skills: 'Leadership, Gestion Équipe, Stratégie Commerciale, Négociation, Budget Management, CRM, Business Development',
        languages: 'Français (natif), Anglais (bilingue), Arabe (natif)',
        interests: 'Leadership, Coaching, Entrepreneuriat, Immobilier',
        template: 'luxury',
        colorPreset: 'classic',
        fontTitle: 'Playfair Display',
        fontSubtitle: 'Montserrat',
        fontBody: 'Roboto',
        educations: [
            { school: 'Université Yaoundé II', title: 'Master Gestion d\'Entreprise', year: '2010-2012' },
            { school: 'Université Buea', title: 'Licence Commerce International', year: '2006-2010' }
        ],
        experiences: [
            { title: 'Directeur Commercial', company: 'Big Corporation Inc', period: 'Jan 2019 - Présent', description: '• Managed team of 20 sales representatives\n• Increased revenue by 35%\n• Opened 5 new markets' },
            { title: 'Manager Commercial', company: 'Trading Company', period: 'Jan 2015 - Dec 2018', description: '• Developed business strategies\n• Negotiated major contracts\n• Achieved 150% sales target' }
        ]
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Générateur CV Pro Advanced Edition chargé');
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });

    // Color inputs
    ['primary', 'bg', 'text', 'subtitle'].forEach(color => {
        const colorKey = color.charAt(0).toUpperCase() + color.slice(1);
        const colorInput = document.getElementById(`color${colorKey}`);
        const hexInput = document.getElementById(`color${colorKey}Hex`);
        
        if (colorInput && hexInput) {
            colorInput.addEventListener('change', (e) => {
                hexInput.value = e.target.value;
                updateCVPreview();
            });
            
            hexInput.addEventListener('change', (e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    colorInput.value = e.target.value;
                    updateCVPreview();
                }
            });
        }
    });

    // Color presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const presetName = btn.getAttribute('data-preset');
            applyPreset(presetName);
        });
    });

    // Design controls
    ['fontTitle', 'fontSubtitle', 'fontBody', 'template'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateCVPreview);
    });

    // Size and spacing sliders
    document.getElementById('fontSizeTitle').addEventListener('input', (e) => {
        document.getElementById('fontSizeTitleValue').textContent = e.target.value;
        updateCVPreview();
    });

    document.getElementById('fontSizeSubtitle').addEventListener('input', (e) => {
        document.getElementById('fontSizeSubtitleValue').textContent = e.target.value;
        updateCVPreview();
    });

    document.getElementById('fontSizeBody').addEventListener('input', (e) => {
        document.getElementById('fontSizeBodyValue').textContent = e.target.value;
        updateCVPreview();
    });

    document.getElementById('spacing').addEventListener('input', (e) => {
        document.getElementById('spacingValue').textContent = e.target.value;
        updateCVPreview();
    });

    document.getElementById('margins').addEventListener('input', (e) => {
        document.getElementById('marginValue').textContent = e.target.value;
        updateCVPreview();
    });

    // Checkboxes
    ['showPhoto', 'showBorder', 'pageNumbers'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateCVPreview);
    });

    // Form inputs
    document.getElementById('cvForm').addEventListener('input', updateCVPreview);

    // Photo upload
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);

    // Dynamic sections
    addEducation();
    addExperience();

    // First render
    updateCVPreview();
});

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const tabEl = document.getElementById(`tab-${tabName}`);
    if (tabEl) tabEl.classList.add('active');
    
    event.target.classList.add('active');
}

// ===== COLOR PRESETS =====
function applyPreset(presetName) {
    const preset = colorPresets[presetName];
    if (preset) {
        document.getElementById('colorPrimary').value = preset.primary;
        document.getElementById('colorPrimaryHex').value = preset.primary;
        document.getElementById('colorBg').value = preset.bg;
        document.getElementById('colorBgHex').value = preset.bg;
        document.getElementById('colorText').value = preset.text;
        document.getElementById('colorTextHex').value = preset.text;
        document.getElementById('colorSubtitle').value = preset.subtitle;
        document.getElementById('colorSubtitleHex').value = preset.subtitle;
        updateCVPreview();
    }
}

// ===== PHOTO HANDLING =====
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentPhotoData = e.target.result;
            const preview = document.getElementById('photoPreview');
            preview.innerHTML = `<img src="${currentPhotoData}" alt="Photo profil">`;
            document.getElementById('removePhotoBtn').style.display = 'block';
            updateCVPreview();
        };
        reader.readAsDataURL(file);
    } else {
        alert('Veuillez sélectionner une image valide');
    }
}

function removePhoto() {
    currentPhotoData = null;
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '<i class="fas fa-camera"></i>';
    document.getElementById('removePhotoBtn').style.display = 'none';
    document.getElementById('photoInput').value = '';
    updateCVPreview();
}

// ===== TEMPLATE SWITCHING =====
function switchTemplate(templateName) {
    currentTemplate = templateName;
    
    // Update button active state
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-template="${templateName}"]`).classList.add('active');
    
    // Update preview
    updateCVPreview();
    console.log(`📐 Template changé: ${templateName}`);
}

// ===== LOAD EXAMPLE TEMPLATE =====
function loadExample(exampleName) {
    const example = exampleTemplates[exampleName];
    if (!example) return;
    
    // Remplir infos personnelles
    document.getElementById('fullName').value = example.fullName;
    document.getElementById('jobTitle').value = example.jobTitle;
    document.getElementById('email').value = example.email;
    document.getElementById('phone').value = example.phone;
    document.getElementById('location').value = example.location;
    document.getElementById('about').value = example.about;
    document.getElementById('skills').value = example.skills;
    document.getElementById('languages').value = example.languages;
    document.getElementById('interests').value = example.interests;
    
    // Charger polices et template
    document.getElementById('fontTitle').value = example.fontTitle;
    document.getElementById('fontSubtitle').value = example.fontSubtitle;
    document.getElementById('fontBody').value = example.fontBody;
    switchTemplate(example.template);
    
    // Charger preset couleur
    applyPreset(example.colorPreset);
    
    // Charger formations
    document.getElementById('educationList').innerHTML = '';
    educationCount = 0;
    if (example.educations) {
        example.educations.forEach(edu => {
            addEducation();
            const sections = document.querySelectorAll('#educationList .dynamic-section');
            const lastSection = sections[sections.length - 1];
            lastSection.querySelector('[data-field*="edu-school"]').value = edu.school;
            lastSection.querySelector('[data-field*="edu-title"]').value = edu.title;
            lastSection.querySelector('[data-field*="edu-year"]').value = edu.year;
        });
    }
    
    // Charger expériences
    document.getElementById('experienceList').innerHTML = '';
    experienceCount = 0;
    if (example.experiences) {
        example.experiences.forEach(exp => {
            addExperience();
            const sections = document.querySelectorAll('#experienceList .dynamic-section');
            const lastSection = sections[sections.length - 1];
            lastSection.querySelector('[data-field*="exp-title"]').value = exp.title;
            lastSection.querySelector('[data-field*="exp-company"]').value = exp.company;
            lastSection.querySelector('[data-field*="exp-period"]').value = exp.period;
            lastSection.querySelector('[data-field*="exp-desc"]').value = exp.description;
        });
    }
    
    // Re-attacher les event listeners
    document.querySelectorAll('.education-field').forEach(field => {
        field.addEventListener('input', updateCVPreview);
    });
    document.querySelectorAll('.experience-field').forEach(field => {
        field.addEventListener('input', updateCVPreview);
    });
    
    updateCVPreview();
    console.log(`✨ Exemple chargé: ${exampleName}`);
}

// ===== ADD EDUCATION =====
function addEducation() {
    const list = document.getElementById('educationList');
    const id = educationCount++;
    
    const html = `
        <div class="dynamic-section" id="education-${id}">
            <input type="text" placeholder="École/Université" data-field="edu-school-${id}" class="education-field">
            <input type="text" placeholder="Diplôme/Certificat" data-field="edu-title-${id}" class="education-field">
            <input type="text" placeholder="Année (Ex: 2022-2023)" data-field="edu-year-${id}" class="education-field">
            <button type="button" class="btn-remove" onclick="removeEducation(${id})">Supprimer</button>
        </div>
    `;
    
    list.insertAdjacentHTML('beforeend', html);
    document.querySelectorAll('.education-field').forEach(field => {
        field.addEventListener('input', updateCVPreview);
    });
}

function removeEducation(id) {
    const element = document.getElementById(`education-${id}`);
    if (element) element.remove();
    updateCVPreview();
}

// ===== ADD EXPERIENCE =====
function addExperience() {
    const list = document.getElementById('experienceList');
    const id = experienceCount++;
    
    const html = `
        <div class="dynamic-section" id="experience-${id}">
            <input type="text" placeholder="Titre du poste" data-field="exp-title-${id}" class="experience-field">
            <input type="text" placeholder="Entreprise/Organisation" data-field="exp-company-${id}" class="experience-field">
            <input type="text" placeholder="Période (Ex: 2020-2024)" data-field="exp-period-${id}" class="experience-field">
            <textarea placeholder="Description des tâches" data-field="exp-desc-${id}" class="experience-field" style="resize: vertical; min-height: 60px;"></textarea>
            <button type="button" class="btn-remove" onclick="removeExperience(${id})">Supprimer</button>
        </div>
    `;
    
    list.insertAdjacentHTML('beforeend', html);
    document.querySelectorAll('.experience-field').forEach(field => {
        field.addEventListener('input', updateCVPreview);
    });
}

function removeExperience(id) {
    const element = document.getElementById(`experience-${id}`);
    if (element) element.remove();
    updateCVPreview();
}

// ===== UPDATE CV PREVIEW =====
function updateCVPreview() {
    const fullName = document.getElementById('fullName').value || 'Nom Complet';
    const jobTitle = document.getElementById('jobTitle').value || 'Titre Professionnel';
    const email = document.getElementById('email').value || 'email@exemple.com';
    const phone = document.getElementById('phone').value || '+237 6XX XXX XXX';
    const location = document.getElementById('location').value || 'Douala, Cameroun';
    const about = document.getElementById('about').value || 'Résumé professionnel...';
    const skills = document.getElementById('skills').value;
    const languages = document.getElementById('languages').value;
    const interests = document.getElementById('interests').value;

    // Design settings
    const colorPrimary = document.getElementById('colorPrimary').value;
    const colorBg = document.getElementById('colorBg').value;
    const colorText = document.getElementById('colorText').value;
    const colorSubtitle = document.getElementById('colorSubtitle').value;
    const fontTitle = document.getElementById('fontTitle').value;
    const fontSubtitle = document.getElementById('fontSubtitle').value;
    const fontBody = document.getElementById('fontBody').value;
    const fontSizeTitle = document.getElementById('fontSizeTitle').value;
    const fontSizeSubtitle = document.getElementById('fontSizeSubtitle').value;
    const fontSizeBody = document.getElementById('fontSizeBody').value;
    const spacing = document.getElementById('spacing').value;
    const margins = document.getElementById('margins').value;

    // Education
    let educationHTML = '';
    document.querySelectorAll('#educationList .dynamic-section').forEach(section => {
        const school = section.querySelector('[data-field*="edu-school"]').value;
        const title = section.querySelector('[data-field*="edu-title"]').value;
        const year = section.querySelector('[data-field*="edu-year"]').value;
        
        if (school || title) {
            educationHTML += `
                <div class="cv-item">
                    <div class="cv-item-title">${title || 'Certificat'}</div>
                    <div class="cv-item-subtitle">${school || 'École'}</div>
                    <div class="cv-item-date">${year}</div>
                </div>
            `;
        }
    });

    // Experience
    let experienceHTML = '';
    document.querySelectorAll('#experienceList .dynamic-section').forEach(section => {
        const title = section.querySelector('[data-field*="exp-title"]').value;
        const company = section.querySelector('[data-field*="exp-company"]').value;
        const period = section.querySelector('[data-field*="exp-period"]').value;
        const desc = section.querySelector('[data-field*="exp-desc"]').value;
        
        if (title || company) {
            experienceHTML += `
                <div class="cv-item">
                    <div class="cv-item-title">${title || 'Poste'}</div>
                    <div class="cv-item-subtitle">${company || 'Entreprise'}</div>
                    <div class="cv-item-date">${period}</div>
                    ${desc ? `<div class="cv-item-description">• ${desc}</div>` : ''}
                </div>
            `;
        }
    });

    // Skills
    let skillsHTML = '';
    if (skills) {
        skillsHTML = skills.split(',').map(s => s.trim()).filter(s => s).map(s => 
            `<span class="cv-skill">${s}</span>`
        ).join('');
    }

    // Interests
    let interestsHTML = '';
    if (interests) {
        interestsHTML = interests.split(',').map(i => i.trim()).filter(i => i).map(i => 
            `<span class="cv-interest">${i}</span>`
        ).join('');
    }

    // Languages
    let languagesHTML = '';
    if (languages) {
        languagesHTML = languages.split(',').map(l => l.trim()).filter(l => l).map(l => 
            `<div class="cv-item-description">• ${l}</div>`
        ).join('');
    }

    // Build CV HTML
    const cvHTML = `
        <div class="cv-page ${currentTemplate}-template" style="
            --cv-primary: ${colorPrimary};
            --cv-text: ${colorText};
            --cv-subtitle: ${colorSubtitle};
            --cv-font-title: '${fontTitle}';
            --cv-font-subtitle: '${fontSubtitle}';
            --cv-font-body: '${fontBody}';
            --cv-size-title: ${fontSizeTitle}px;
            --cv-size-subtitle: ${fontSizeSubtitle}px;
            --cv-size-body: ${fontSizeBody}px;
            --cv-spacing: ${spacing};
            --cv-padding: ${margins}px;
            background: ${colorBg};
            color: ${colorText};
        ">
            <div class="cv-content">
                <div class="cv-header">
                    ${currentPhotoData && currentTemplate !== 'minimal' ? `<img src="${currentPhotoData}" alt="Photo profil" class="cv-photo">` : ''}
                    <div>
                        <div class="cv-name">${fullName}</div>
                        <div class="cv-job">${jobTitle}</div>
                    </div>
                </div>
                <div class="cv-contact">
                    <div><strong>Email:</strong> ${email}</div>
                    <div><strong>Tél:</strong> ${phone}</div>
                    <div style="grid-column: 1 / -1;"><strong>Localisation:</strong> ${location}</div>
                </div>
                </div>

                ${about ? `<div class="cv-about" style="color: ${colorText};">${about}</div>` : ''}

                ${educationHTML ? `
                <div class="cv-section">
                    <div class="cv-section-title">FORMATION</div>
                    ${educationHTML}
                </div>
                ` : ''}

                ${experienceHTML ? `
                <div class="cv-section">
                    <div class="cv-section-title">EXPÉRIENCES</div>
                    ${experienceHTML}
                </div>
                ` : ''}

                <div class="cv-row">
                    ${skillsHTML ? `
                    <div class="cv-col">
                        <div class="cv-section">
                            <div class="cv-section-title">COMPÉTENCES</div>
                            <div>${skillsHTML}</div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="cv-col">
                        ${interestsHTML ? `
                        <div class="cv-section">
                            <div class="cv-section-title">INTÉRÊTS</div>
                            <div>${interestsHTML}</div>
                        </div>
                        ` : ''}
                        
                        ${languagesHTML ? `
                        <div class="cv-section">
                            <div class="cv-section-title">LANGUES</div>
                            <div>${languagesHTML}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    const preview = document.getElementById('cvPreview');
    preview.innerHTML = cvHTML;
    preview.style.transform = `scale(${zoomLevel / 100})`;
}

// ===== ZOOM CONTROLS =====
function zoomIn() {
    if (zoomLevel < 150) {
        zoomLevel += 10;
        updateZoom();
    }
}

function zoomOut() {
    if (zoomLevel > 50) {
        zoomLevel -= 10;
        updateZoom();
    }
}

function updateZoom() {
    document.getElementById('zoomLevel').textContent = zoomLevel + '%';
    const preview = document.getElementById('cvPreview');
    preview.style.transform = `scale(${zoomLevel / 100})`;
}

// ===== PREVIEW PDF =====
async function previewPDF() {
    const cvElement = document.getElementById('cvPreview');
    const modalPreview = document.getElementById('modalPreview');
    
    modalPreview.innerHTML = cvElement.innerHTML;
    document.getElementById('previewModal').classList.add('active');
}

function closePreview() {
    document.getElementById('previewModal').classList.remove('active');
}

function confirmExport() {
    closePreview();
    exportPDF();
}

// ===== EXPORT PDF =====
async function exportPDF() {
    const fullName = document.getElementById('fullName').value || 'CV';
    const cvElement = document.getElementById('cvPreview');
    
    if (!fullName.trim()) {
        alert('Veuillez remplir au moins votre nom !');
        return;
    }

    try {
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `CV_${fullName.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, backgroundColor: '#ffffff' },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };

        await html2pdf().set(opt).from(cvElement).save();
        console.log('✅ PDF téléchargé');
    } catch (error) {
        console.error('❌ Erreur PDF:', error);
        alert('Erreur lors du téléchargement du PDF');
    }
}

// ===== EXPORT PNG =====
async function exportPNG() {
    const fullName = document.getElementById('fullName').value || 'CV';
    const cvElement = document.getElementById('cvPreview');
    
    if (!fullName.trim()) {
        alert('Veuillez remplir au moins votre nom !');
        return;
    }

    try {
        const canvas = await html2canvas(cvElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true
        });
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `CV_${fullName.replace(/\s+/g, '_')}.png`;
        link.click();
        
        console.log('✅ PNG téléchargé');
    } catch (error) {
        console.error('❌ Erreur PNG:', error);
        alert('Erreur lors du téléchargement du PNG');
    }
}

// ===== EXPORT JSON =====
function exportJSON() {
    const fullName = document.getElementById('fullName').value || 'CV';
    
    const data = {
        personal: {
            fullName: document.getElementById('fullName').value,
            jobTitle: document.getElementById('jobTitle').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            about: document.getElementById('about').value,
            photo: currentPhotoData
        },
        education: [],
        experience: [],
        skills: document.getElementById('skills').value,
        languages: document.getElementById('languages').value,
        interests: document.getElementById('interests').value,
        design: {
            colorPrimary: document.getElementById('colorPrimary').value,
            colorBg: document.getElementById('colorBg').value,
            colorText: document.getElementById('colorText').value,
            colorSubtitle: document.getElementById('colorSubtitle').value,
            fontTitle: document.getElementById('fontTitle').value,
            fontSubtitle: document.getElementById('fontSubtitle').value,
            fontBody: document.getElementById('fontBody').value,
            fontSizeTitle: document.getElementById('fontSizeTitle').value,
            fontSizeSubtitle: document.getElementById('fontSizeSubtitle').value,
            fontSizeBody: document.getElementById('fontSizeBody').value,
            spacing: document.getElementById('spacing').value,
            margins: document.getElementById('margins').value
        },
        template: currentTemplate
    };

    // Récupérer formations
    document.querySelectorAll('#educationList .dynamic-section').forEach(section => {
        data.education.push({
            school: section.querySelector('[data-field*="edu-school"]').value,
            title: section.querySelector('[data-field*="edu-title"]').value,
            year: section.querySelector('[data-field*="edu-year"]').value
        });
    });

    // Récupérer expériences
    document.querySelectorAll('#experienceList .dynamic-section').forEach(section => {
        data.experience.push({
            title: section.querySelector('[data-field*="exp-title"]').value,
            company: section.querySelector('[data-field*="exp-company"]').value,
            period: section.querySelector('[data-field*="exp-period"]').value,
            description: section.querySelector('[data-field*="exp-desc"]').value
        });
    });

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CV_${fullName.replace(/\s+/g, '_')}.json`;
    link.click();
    
    console.log('✅ JSON exporté');
}

// ===== IMPORT JSON =====
function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                // Restore personal data
                if (data.personal) {
                    document.getElementById('fullName').value = data.personal.fullName || '';
                    document.getElementById('jobTitle').value = data.personal.jobTitle || '';
                    document.getElementById('email').value = data.personal.email || '';
                    document.getElementById('phone').value = data.personal.phone || '';
                    document.getElementById('location').value = data.personal.location || '';
                    document.getElementById('about').value = data.personal.about || '';
                    
                    // Restore photo
                    if (data.personal.photo) {
                        currentPhotoData = data.personal.photo;
                        const preview = document.getElementById('photoPreview');
                        preview.innerHTML = `<img src="${currentPhotoData}" alt="Photo profil">`;
                        document.getElementById('removePhotoBtn').style.display = 'block';
                    }
                }

                // Restore design settings
                if (data.design) {
                    document.getElementById('colorPrimary').value = data.design.colorPrimary;
                    document.getElementById('colorBg').value = data.design.colorBg;
                    document.getElementById('colorText').value = data.design.colorText;
                    document.getElementById('colorSubtitle').value = data.design.colorSubtitle;
                    document.getElementById('fontTitle').value = data.design.fontTitle;
                    document.getElementById('fontSubtitle').value = data.design.fontSubtitle;
                    document.getElementById('fontBody').value = data.design.fontBody;
                    document.getElementById('fontSizeTitle').value = data.design.fontSizeTitle;
                    document.getElementById('fontSizeSubtitle').value = data.design.fontSizeSubtitle;
                    document.getElementById('fontSizeBody').value = data.design.fontSizeBody;
                    document.getElementById('spacing').value = data.design.spacing;
                    document.getElementById('margins').value = data.design.margins;
                }

                // Restore template
                if (data.template) {
                    switchTemplate(data.template);
                }

                // Restore skills, languages, interests
                document.getElementById('skills').value = data.skills || '';
                document.getElementById('languages').value = data.languages || '';
                document.getElementById('interests').value = data.interests || '';

                // Restore education
                document.getElementById('educationList').innerHTML = '';
                educationCount = 0;
                if (data.education) {
                    data.education.forEach(edu => {
                        addEducation();
                        const sections = document.querySelectorAll('#educationList .dynamic-section');
                        const lastSection = sections[sections.length - 1];
                        lastSection.querySelector('[data-field*="edu-school"]').value = edu.school || '';
                        lastSection.querySelector('[data-field*="edu-title"]').value = edu.title || '';
                        lastSection.querySelector('[data-field*="edu-year"]').value = edu.year || '';
                    });
                }

                // Restore experience
                document.getElementById('experienceList').innerHTML = '';
                experienceCount = 0;
                if (data.experience) {
                    data.experience.forEach(exp => {
                        addExperience();
                        const sections = document.querySelectorAll('#experienceList .dynamic-section');
                        const lastSection = sections[sections.length - 1];
                        lastSection.querySelector('[data-field*="exp-title"]').value = exp.title || '';
                        lastSection.querySelector('[data-field*="exp-company"]').value = exp.company || '';
                        lastSection.querySelector('[data-field*="exp-period"]').value = exp.period || '';
                        lastSection.querySelector('[data-field*="exp-desc"]').value = exp.description || '';
                    });
                }

                updateCVPreview();
                alert('✅ CV importé avec succès !');
            } catch (error) {
                console.error('❌ Erreur import:', error);
                alert('❌ Erreur lors de l\'import du fichier');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

console.log('📄 Générateur CV Pro Advanced - Chargé avec succès !');
