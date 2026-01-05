/**
 * ========== FIREBASE CLOUD FUNCTIONS - RÉSERVÉ ==========
 * 
 * Actuellement non utilisé (forfait Spark - pas de Cloud Functions)
 * 
 * À implémenter si passage au forfait Blaze:
 * - askGemini() - Proxy sécurisé pour Gemini API
 * - verifyRecaptcha() - Vérification serveur reCAPTCHA
 * - sendContactEmail() - Gestion sécurisée des messages
 * 
 * NOTES:
 * - Actuellement, Gemini est utilisé côté client avec protections
 * - Voir SECURITY.md pour détails de la stratégie de sécurité
 * - reCAPTCHA v3 est validé client-side + Firestore Rules
 */

// This file is only for local development and Firebase Emulator
// Do NOT deploy to production (Cloud Functions require Blaze plan)

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        message: 'Cloud Functions not initialized - Spark plan active'
    };
}

