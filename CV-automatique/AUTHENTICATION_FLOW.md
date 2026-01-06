# Authentication Flow - CV Pro

## Overview
CV Pro uses Firebase email/password authentication with user profiles stored in Firestore. Users must be authenticated to access the application.

## Architecture

### 1. Authentication Entry Point: `auth.html`
**Purpose**: User login and registration interface
**Features**:
- Dual-tab interface (Login / Signup)
- Email/password validation
- User registration with firstName, lastName, email, password
- Automatic redirect if user already logged in
- Toast notifications for errors/success

**User Registration Data**:
```javascript
{
    userId: user.uid,           // Firebase Auth UID
    email: email,               // User email
    firstName: firstName,       // First name (required)
    lastName: lastName,         // Last name (required)
    fullName: `${firstName} ${lastName}`,
    plan: 'free',              // Quota plan
    quotaUsed: 0,              // Number of CVs created
    quotaMax: 2,               // Max CVs allowed for free plan
    createdAt: ISO8601,        // Account creation date
    updatedAt: ISO8601,        // Last update date
    metadata: {
        lastLogin: ISO8601,    // Last login timestamp
        loginCount: number,    // Total login count
        timezone: string       // User's timezone
    }
}
```

**Collection**: `cv_users` in Firestore
**Document ID**: `user.uid` (Firebase Auth UID)

### 2. Dashboard: `dashboard.html`
**Purpose**: CV management hub
**Authentication Flow**:
1. `initAuth()` function checks if user is logged in
2. If no user → redirects to `auth.html`
3. If user exists → loads CVs from Firestore
4. `onAuthStateChanged` listener monitors session changes

**Header Actions**:
- ✏️ Create new CV
- 🌙 Toggle dark mode
- 🚪 Logout button

**Logout Function**:
```javascript
async function logout() {
    await window.auth.signOut();
    window.location.href = 'auth.html';
}
```

### 3. CV Editor: `index.html`
**Purpose**: CV editing interface
**Requirements**:
- User must be authenticated (checked in dashboard)
- SessionStorage contains:
  - `currentCVId`: The CV being edited
  - `currentUserId`: The authenticated user's UID

### 4. Firebase Configuration
**Project**: valde-tech
**Firebase Modules Used**:
- Authentication (email/password + signOut)
- Firestore (cv_users collection)

**Endpoints**:
- API Key: `AIzaSyBirIXLKxkuWT7js3CB4_pGB6tk4wPa2AM`
- Auth Domain: `valde-tech.firebaseapp.com`
- Project ID: `valde-tech`

## Authentication Flow Diagrams

### Login Flow
```
User → auth.html
       ├─ If logged in → redirect to dashboard.html
       └─ If not logged in → show login form
          └─ Click "Connexion"
             ├─ Validate email/password
             ├─ signInWithEmailAndPassword()
             ├─ Success → redirect to dashboard.html
             └─ Error → show error message
```

### Signup Flow
```
User → auth.html
       └─ Click "S'inscrire"
          ├─ Validate firstName, lastName, email, password
          ├─ createUserWithEmailAndPassword()
          ├─ Auto-create user profile in Firestore
          ├─ Success → redirect to dashboard.html
          └─ Error → show error message
```

### Session Persistence
```
Browser Start
└─ auth.html loads
   └─ onAuthStateChanged checks Firebase session
      ├─ User session exists → redirect to dashboard.html
      └─ No session → stay on auth.html

Dashboard Load
└─ initAuth() waits for Firebase modules
   └─ onAuthStateChanged fires
      ├─ User logged in → load CVs
      └─ No user → redirect to auth.html
```

### Logout Flow
```
User clicks "Déconnexion" button
└─ logout() function
   ├─ auth.signOut() clears session
   ├─ Redirect to auth.html
   └─ onAuthStateChanged detects no user
      └─ Stay on auth.html (no redirect loop)
```

## Error Handling

### Login Errors
- `auth/invalid-email`: Shows "Email invalide"
- `auth/user-not-found`: Shows "Utilisateur non trouvé"
- `auth/wrong-password`: Shows "Mot de passe incorrect"

### Signup Errors
- `auth/email-already-in-use`: Shows "Cet email est déjà utilisé"
- `auth/invalid-email`: Shows "Email invalide"
- `auth/weak-password`: Shows "Mot de passe trop faible"

## Security Features

### Password Requirements
- Minimum 8 characters (enforced by Firebase + HTML input)
- Validated on client before submission
- Transmitted securely via HTTPS to Firebase

### User Data Protection
- All user data stored in Firestore with security rules
- Users can only access their own CVs
- Ownership verified on all mutations

### Session Management
- Firebase handles session tokens securely
- Session persists across browser restarts
- Logout clears all session data

## Future Enhancements

### Planned Features
- [ ] "Forgot Password" functionality
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)
- [ ] Account deletion
- [ ] Profile editing

### Quota System
- FREE plan: 2 CVs max
- PRO plan: 10 CVs max
- ENTERPRISE plan: Unlimited CVs

## Testing the Auth Flow

### Test Case 1: Signup
1. Open `auth.html`
2. Click "S'inscrire" tab
3. Enter: firstName, lastName, email, password
4. Click "Créer un compte"
5. Should redirect to dashboard.html
6. Should show "Mes CVs" with empty state

### Test Case 2: Login
1. Open `auth.html`
2. Click "Connexion" tab
3. Enter: email, password
4. Click "Connexion"
5. Should redirect to dashboard.html
6. Should show user's CVs

### Test Case 3: Logout
1. Logged in on dashboard.html
2. Click "Déconnexion" button
3. Should redirect to auth.html
4. Should show login form (no auto-redirect to dashboard)

### Test Case 4: Session Persistence
1. Logged in on dashboard.html
2. Close browser and reopen
3. Open `https://valde-tech.web.app/CV-automatique/dashboard.html`
4. Should automatically load dashboard (not redirect to auth.html)

### Test Case 5: Auto-Redirect
1. Logged in on auth.html
2. onAuthStateChanged detects existing session
3. Should automatically redirect to dashboard.html

## File Structure

```
CV-automatique/
├── auth.html                 # Login/Signup interface
├── dashboard.html            # CV management hub
├── index.html                # CV editor (requires auth)
├── firebase-cv-config.js     # CV manager classes
├── script.js                 # Editor logic
├── style.css                 # Shared styles
└── AUTHENTICATION_FLOW.md    # This file
```

## Important Notes

1. **No Anonymous Auth**: Old system used `signInAnonymously()`. This has been completely removed.

2. **Real Users Only**: All CVs are now associated with real authenticated users, enabling:
   - User-specific data
   - Quota enforcement
   - Analytics per user
   - Premium plans

3. **Data Migration**: Old anonymous CVs stored in Firestore should be handled separately (future migration task).

4. **Deployment**: Deploy to Firebase with `firebase deploy --only hosting`

---

**Last Updated**: March 6, 2025
**Maintained by**: Valde Tech Dev Team
