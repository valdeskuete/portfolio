# 🔐 GUIDE DE SÉCURITÉ - GESTION DES CLÉS API

## ⚠️ CONFIGURATION ACTUELLE

**Plan Firebase**: Spark (Gratuit - PAS de Cloud Functions)

Cette configuration limite les options de sécurité. Les approches suivantes sont **OBLIGATOIRES**:

---

## 📋 CLÉS ACTUELLES & STRATÉGIE

### ✅ SAFE - Partageable (Clés Publiques)
- **Firebase API Key**: `AIzaSyBirIXLKxkuWT7js3CB4_pGB6tk4wPa2AM`
  - ✅ Restreinte par Firebase Security Rules
  - ✅ OK d'être en code/hardcodée

- **reCAPTCHA Site Key**: `6LdEVFspAAAAAI5Xz3xbFqFlFcR5VbVdqWJHmFU7`
  - ✅ Publique par design (site key)
  - ✅ OK d'être en code/hardcodée
  - ⚠️ Secret Key nécessaire pour validation (côté client seulement)

### ⚠️ EXPOSÉE MAIS CONTRÔLÉE - Gemini API Key
- **Gemini API Key**: Stockée en `.env` (placeholder en repo)
  - ❌ Exposée au client (limitation du plan Spark)
  - ✅ Protégée par restrictions Google API Console
  - ✅ Monitoring quota d'utilisation

---

## 🛡️ STRATÉGIE DE SÉCURITÉ (Plan Spark)

### Architecte générale

```
┌─────────────────────────────────────────────────┐
│ CLIENT (index.html / gemini-ai.js)              │
├─────────────────────────────────────────────────┤
│ 1. Charger .env via env-loader.js               │
│ 2. Valider prompt côté client                   │
│ 3. Appeler Gemini API directement (CORS)        │
│ 4. Rate limiting client-side (50 req/min)       │
│ 5. Monitoring quota utilisation                 │
│ 6. Cache réponses (localStorage)                │
└─────────────────────────────────────────────────┘
              ↓
         Gemini API
       (Google contrôle)
```

### Protections Implémentées

#### 1️⃣ **Rate Limiting Client-Side**
```javascript
// gemini-ai.js
const RATE_LIMIT = {
  maxRequestsPerMinute: 50,
  maxTokensPerDay: 10000,
  timeout: 30000
};
```

**Comment ça marche:**
- Compteur de requêtes en localStorage
- Réinitialisation à minuit
- Rejet des requêtes au-delà du limite

#### 2️⃣ **Validation Input Client-Side**
```javascript
// Rejeter les prompts:
- Vides ou nulls
- Plus de 10 000 caractères
- Contenant du code SQL/injections
```

#### 3️⃣ **Monitoring Quota**
```javascript
// gemini-ai.js logs:
console.log(`[Gemini] Requêtes restantes: ${remaining}/${maxPerDay}`);
```

#### 4️⃣ **Restrictions API Console**
Dans Google Cloud Console:
- ✅ Restreindre à domaine: `valde-tech.web.app`
- ✅ Restreindre protocole: HTTPS seulement
- ✅ Activer monitoring des quotas
- ✅ Alertes si dépassement 80% quota

#### 5️⃣ **Cache Local (localStorage)**
```javascript
// Éviter appels redondants
const cached = localStorage.getItem(`gemini_${prompt_hash}`);
if (cached && isStillValid()) return cached;
```

---

## ⚡ LIMITATIONS & ACCEPTATION

**Cette approche a des limitations :**

| Limitation | Impact | Mitigation |
|-----------|--------|-----------|
| Clé visible au client | Risque de fuites | Monitoring quota strict |
| Quota partagé (200 req/jour) | Quota limité | Rate limiting client + cache |
| CORS public | Possible abus CSRF | reCAPTCHA + Firestore auth |
| Pas de validation serveur | Tokens non vérifiés | Validation plus stricte client |

**➡️ Cette configuration est ACCEPTABLE pour un portfolio car:**
- Quota limité (200 req/jour) réduit l'impact des fuites
- Monitoring quota permet détection immédiate d'abus
- Site personnel (audience limitée)
- Firebase Auth + reCAPTCHA limitent les abus massifs

---

## 🔧 CONFIGURATION REQUISE

### 1️⃣ .env (Ne pas commiter!)

```
# Remplacer YOUR_KEY_HERE par la clé réelle
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
VITE_FIREBASE_API_KEY=AIzaSyBirIXLKxkuWT7js3CB4_pGB6tk4wPa2AM
VITE_FIREBASE_PROJECT_ID=valde-tech
```

### 2️⃣ Google Cloud Console (Gemini)

**Activer restrictions:**
1. Aller à: https://console.cloud.google.com/apis/credentials
2. Sélectionner la clé API Gemini
3. Cliquer "Restrict and regenerate"
4. Sous "HTTP referrers":
   ```
   https://valde-tech.web.app/*
   https://localhost:*
   ```
5. Sauvegarder

### 3️⃣ Monitoring Quota

**Via Google Cloud Console:**
1. Aller à: APIs & Services > Quotas
2. Filtrer: "generativelanguage_googleapis_com"
3. Sélectionner "Requests per day" → Click "Edit quotas"
4. Définir alert à 80% → Sauvegarder

**Ou par Email:**
- Google envoie automatiquement alertes si dépassement

---

## 📊 CHECKLIST SÉCURITÉ

### Avant chaque commit:
- [ ] `.env` contient `VITE_GEMINI_API_KEY=YOUR_KEY_HERE` (placeholder)
- [ ] `.env` est listé dans `.gitignore`
- [ ] `.env.example` contient seulement les templates
- [ ] Aucune clé API en clair dans les fichiers `.js`
- [ ] Aucun commit sans vérifier: `git diff --cached | grep -i "AIzaSy"`

### En production:
- [ ] Google Cloud Console restreint à domaine HTTPS
- [ ] Quotas définis dans Google Cloud Console
- [ ] Monitoring quota activé + alertes configurées
- [ ] Rate limiting client-side actif (gemini-ai.js)
- [ ] Validation input stricte en client
- [ ] Firebase Security Rules restrictives
- [ ] reCAPTCHA v3 activé pour formulaires

### Escalade (Si quota exposé):
1. Régénérer clé: https://console.cloud.google.com/apis/credentials
2. Mettre à jour `.env`
3. Déployer: `firebase deploy --only hosting`
4. Vérifier logs: `firebase functions:log`

---

## 🔮 FUTUR: Plan Blaze (Si vous upgrader)

Si passage au **plan Blaze**, implémenter:

```javascript
// functions/index.js
exports.askGemini = functions.https.onCall(async (data) => {
  // Clé stockée en SECRET (invisible au client)
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Appel serveur (clé masquée)
  const response = await callGeminiAPI(data.prompt, apiKey);
  
  // Retourner résultat seulement
  return response;
});
```

**Bénéfices du plan Blaze:**
- ✅ Clés API côté serveur (sécurisé)
- ✅ Validation serveur des requests
- ✅ Pas d'exposition CORS
- ✅ Quota illimité (paiement par utilisation)

---

## 📞 RESSOURCES & SUPPORT

### Documentation:
- [Google Generative AI API](https://ai.google.dev/gemini-api/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)
- [Google Cloud - API Keys](https://cloud.google.com/docs/authentication/api-keys)

### Outils de Monitoring:
- Google Cloud Console: https://console.cloud.google.com
- Firebase Console: https://console.firebase.google.com
- Gmail alerts (dépassement quota)

### En cas d'urgence (Clé compromise):
1. Appeler: Support Google Cloud
2. Régénérer la clé immédiatement
3. Déployer nouvelle version avec nouvelle clé
4. Vérifier les logs des 24h précédentes pour détection d'abus

---

## ✅ STATUS ACTUEL (Plan Spark)

| Clé | Exposée? | Sécurisée? | Stratégie |
|-----|----------|-----------|-----------|
| Firebase API | Public | ✅ Oui (Rules) | Hardcodée OK |
| reCAPTCHA Site | Public | ✅ Oui (Public) | Hardcodée OK |
| Gemini API | ⚠️ Oui | ✅ Monitoring | Env + Rate Limit |
| reCAPTCHA Secret | ❌ Non | ✅ Client Only | localStorage |

---

**Dernière mise à jour**: 2026-01-05
**Plan**: Spark (Gratuit)
**Statut**: ✅ Sécurisé dans les limites du plan
**Prochaine audit**: Mensuel (quota monitoring)
