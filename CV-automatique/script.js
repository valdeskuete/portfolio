// ===== VARIABLES GLOBALES =====
let educationCount = 0;
let experienceCount = 0;
let currentColor = '#0ef';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ CV Generator chargé');
    
    // Event listeners
    document.getElementById('cvForm').addEventListener('input', updateCVPreview);
    document.getElementById('colorPrimary').addEventListener('change', (e) => {
        currentColor = e.target.value;
        updateCVPreview();
    });

    // Color palette buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            currentColor = btn.getAttribute('data-color');
            document.getElementById('colorPrimary').value = currentColor;
            updateColorButtons();
            updateCVPreview();
        });
    });

    // Ajouter une première formation et expérience
    addEducation();
    addExperience();

    // Premier render
    updateCVPreview();
});

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
    
    // Add event listeners
    document.querySelectorAll('.education-field').forEach(field => {
        field.addEventListener('input', updateCVPreview);
    });
}

// ===== REMOVE EDUCATION =====
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
    
    // Add event listeners
    document.querySelectorAll('.experience-field').forEach(field => {
        field.addEventListener('input', updateCVPreview);
    });
}

// ===== REMOVE EXPERIENCE =====
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

    // Récupérer formations
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

    // Récupérer expériences
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

    // Compétences
    let skillsHTML = '';
    if (skills) {
        skillsHTML = skills.split(',').map(s => s.trim()).filter(s => s).map(s => 
            `<span class="cv-skill">${s}</span>`
        ).join('');
    }

    // Intérêts
    let interestsHTML = '';
    if (interests) {
        interestsHTML = interests.split(',').map(i => i.trim()).filter(i => i).map(i => 
            `<span class="cv-interest">${i}</span>`
        ).join('');
    }

    // Langues
    let languagesHTML = '';
    if (languages) {
        languagesHTML = languages.split(',').map(l => l.trim()).filter(l => l).map(l => 
            `<div style="margin-bottom: 0.5rem;">• ${l}</div>`
        ).join('');
    }

    // Construire le CV
    const cvHTML = `
        <div class="cv-header">
            <div class="cv-left">
                <h1 class="cv-name">${fullName}</h1>
                <p class="cv-job">${jobTitle}</p>
            </div>
            <div class="cv-right">
                <p class="cv-info"><strong>Email:</strong> ${email}</p>
                <p class="cv-info"><strong>Tél:</strong> ${phone}</p>
                <p class="cv-info"><strong>Localisation:</strong> ${location}</p>
            </div>
        </div>

        <div class="cv-about">
            <p>${about}</p>
        </div>

        ${educationHTML ? `
        <div class="cv-section">
            <h3 class="cv-section-title">FORMATION</h3>
            ${educationHTML}
        </div>
        ` : ''}

        ${experienceHTML ? `
        <div class="cv-section">
            <h3 class="cv-section-title">EXPÉRIENCES</h3>
            ${experienceHTML}
        </div>
        ` : ''}

        <div class="cv-row">
            ${skillsHTML ? `
            <div class="cv-col">
                <h3 class="cv-section-title">COMPÉTENCES</h3>
                <div>${skillsHTML}</div>
            </div>
            ` : ''}
            
            <div class="cv-col">
                ${interestsHTML ? `
                <div style="margin-bottom: 2rem;">
                    <h3 class="cv-section-title">INTÉRÊTS</h3>
                    <div>${interestsHTML}</div>
                </div>
                ` : ''}
                
                ${languagesHTML ? `
                <div>
                    <h3 class="cv-section-title">LANGUES</h3>
                    <div>${languagesHTML}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    // Mettre à jour le preview
    const preview = document.getElementById('cvPreview');
    preview.innerHTML = cvHTML;
    preview.style.setProperty('--cv-color', currentColor);
}

// ===== UPDATE COLOR BUTTONS =====
function updateColorButtons() {
    document.querySelectorAll('.color-btn').forEach(btn => {
        if (btn.getAttribute('data-color') === currentColor) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ===== EXPORT PDF =====
async function exportPDF() {
    const fullName = document.getElementById('fullName').value || 'CV';
    const cvElement = document.getElementById('cvPreview');
    
    if (!fullName.trim()) {
        alert('Veuillez remplir au moins votre nom !');
        return;
    }

    const opt = {
        margin: 10,
        filename: `CV_${fullName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff' },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    try {
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
        // Utiliser html2canvas pour convertir le DOM en image
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.head.appendChild(script);
        
        script.onload = async () => {
            const canvas = await window.html2canvas(cvElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true
            });
            
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `CV_${fullName.replace(/\s+/g, '_')}.png`;
            link.click();
            
            console.log('✅ PNG téléchargé');
        };
    } catch (error) {
        console.error('❌ Erreur PNG:', error);
        alert('Erreur lors du téléchargement du PNG');
    }
}

// ===== RESET FORM =====
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cvForm').addEventListener('reset', () => {
        setTimeout(updateCVPreview, 50);
    });
});

console.log('📄 Générateur de CV Automatique - Prêt !');
