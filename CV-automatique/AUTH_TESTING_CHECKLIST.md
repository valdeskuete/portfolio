# Email/Password Authentication Testing Checklist

## ✅ Implementation Status

### Completed Tasks
- [x] Created `auth.html` with login/signup interface
- [x] Implemented email/password authentication (Firebase SDK)
- [x] Added user registration with firstName, lastName, email, password
- [x] Auto-create user profiles in Firestore `cv_users` collection
- [x] Updated `dashboard.html` to check for authenticated users
- [x] Removed all anonymous signin references from `dashboard.html`
- [x] Added logout functionality with redirect to auth.html
- [x] Added logout button to dashboard header
- [x] Error handling with user-friendly messages
- [x] Toast notifications for success/error
- [x] Session persistence via onAuthStateChanged
- [x] Auto-redirect if user already logged in (auth.html → dashboard.html)
- [x] Auto-redirect if user not logged in (dashboard.html → auth.html)
- [x] Documentation (AUTHENTICATION_FLOW.md)

### Next Steps
- [ ] **Test signup flow** (comprehensive)
- [ ] **Test login flow** (comprehensive)
- [ ] **Test logout flow**
- [ ] **Test session persistence** (close browser, reopen)
- [ ] **Test auto-redirects**
- [ ] **Test error handling** (invalid email, weak password, etc.)
- [ ] **Update editor** (index.html) to ensure it works with real users
- [ ] **Test complete flow** (signup → dashboard → create CV → editor → logout)
- [ ] **Deploy to Firebase** (firebase deploy --only hosting)
- [ ] **Verify live deployment**

## 🧪 Test Cases

### Test 1: Signup Flow
**Objective**: User can create account with email/password

**Steps**:
1. [ ] Open `auth.html` (or `https://localhost:3000/CV-automatique/auth.html`)
2. [ ] Click "S'inscrire" tab
3. [ ] Fill in:
   - [ ] Prénom: "Jean"
   - [ ] Nom: "Dupont"
   - [ ] Email: "jean.dupont@example.com"
   - [ ] Mot de passe: "SecurePassword123!"
   - [ ] Confirmer mot de passe: "SecurePassword123!"
4. [ ] Check "J'accepte les conditions d'utilisation"
5. [ ] Click "Créer un compte"

**Expected Results**:
- [ ] Success toast notification appears
- [ ] Redirects to `dashboard.html`
- [ ] Dashboard shows empty state ("Aucun CV créé")
- [ ] Header shows "Déconnexion" button
- [ ] User profile exists in Firestore `cv_users` collection

**Verification**:
- [ ] Open Firefox DevTools → Storage → Firestore
- [ ] Navigate to `cv_users` collection
- [ ] Verify document with user.uid contains:
  ```json
  {
      userId: "...",
      email: "jean.dupont@example.com",
      firstName: "Jean",
      lastName: "Dupont",
      fullName: "Jean Dupont",
      plan: "free",
      quotaUsed: 0,
      quotaMax: 2
  }
  ```

---

### Test 2: Login Flow
**Objective**: User can log in with existing account

**Steps**:
1. [ ] Open `auth.html`
2. [ ] Click "Connexion" tab
3. [ ] Fill in:
   - [ ] Email: "jean.dupont@example.com"
   - [ ] Mot de passe: "SecurePassword123!"
4. [ ] Check "Se souvenir de moi"
5. [ ] Click "Connexion"

**Expected Results**:
- [ ] Success toast notification appears
- [ ] Redirects to `dashboard.html`
- [ ] Dashboard loads with empty state (or existing CVs if any)
- [ ] No errors in browser console

---

### Test 3: Logout Flow
**Objective**: User can log out and return to auth.html

**Steps**:
1. [ ] Logged in on `dashboard.html`
2. [ ] Click "Déconnexion" button (top right)
3. [ ] Confirm action (if prompt appears)

**Expected Results**:
- [ ] Success message appears
- [ ] Redirects to `auth.html`
- [ ] Login form is displayed (not redirected back to dashboard)
- [ ] No user session in browser storage

---

### Test 4: Session Persistence
**Objective**: User session persists across browser restarts

**Steps**:
1. [ ] Log in on `auth.html` with test account
2. [ ] Verify on `dashboard.html`
3. [ ] Close browser completely (all tabs)
4. [ ] Reopen browser
5. [ ] Open `https://valde-tech.web.app/CV-automatique/dashboard.html` directly

**Expected Results**:
- [ ] Dashboard loads automatically (no redirect to auth.html)
- [ ] User data is preserved
- [ ] CVs (if any) are displayed
- [ ] No "Not authenticated" errors

---

### Test 5: Auto-Redirect (Already Logged In)
**Objective**: If user visits auth.html while logged in, redirect to dashboard

**Steps**:
1. [ ] Log in on `dashboard.html`
2. [ ] Navigate to `auth.html`
3. [ ] Observe browser behavior

**Expected Results**:
- [ ] Automatically redirected to `dashboard.html`
- [ ] No login form is shown
- [ ] Happens within 1-2 seconds

---

### Test 6: Auto-Redirect (Not Logged In)
**Objective**: If user visits dashboard while not logged in, redirect to auth.html

**Steps**:
1. [ ] Open new incognito/private browser window
2. [ ] Navigate to `https://valde-tech.web.app/CV-automatique/dashboard.html`

**Expected Results**:
- [ ] Redirected to `auth.html`
- [ ] Login form is displayed
- [ ] No error messages

---

### Test 7: Error Handling - Invalid Email
**Objective**: System rejects invalid emails

**Steps**:
1. [ ] Open `auth.html`
2. [ ] Try to login with email: "invalidemail"
3. [ ] Click "Connexion"

**Expected Results**:
- [ ] Error message: "Email invalide"
- [ ] Red highlight on email field
- [ ] Form is not submitted

---

### Test 8: Error Handling - User Not Found
**Objective**: System rejects non-existent user

**Steps**:
1. [ ] Open `auth.html`
2. [ ] Try to login with email: "nonexistent@example.com"
3. [ ] Password: "password123"
4. [ ] Click "Connexion"

**Expected Results**:
- [ ] Error message: "Utilisateur non trouvé"
- [ ] Red highlight on email field
- [ ] Stays on login form

---

### Test 9: Error Handling - Wrong Password
**Objective**: System rejects incorrect password

**Steps**:
1. [ ] Open `auth.html`
2. [ ] Login with correct email but wrong password: "wrongpassword"
3. [ ] Click "Connexion"

**Expected Results**:
- [ ] Error message: "Mot de passe incorrect"
- [ ] Red highlight on password field
- [ ] Stays on login form

---

### Test 10: Error Handling - Email Already In Use
**Objective**: System prevents duplicate accounts

**Steps**:
1. [ ] Open `auth.html`
2. [ ] Try to signup with email already used: "jean.dupont@example.com"
3. [ ] Fill in other fields with new data
4. [ ] Click "Créer un compte"

**Expected Results**:
- [ ] Error message: "Cet email est déjà utilisé"
- [ ] Red highlight on email field
- [ ] Stays on signup form

---

### Test 11: Error Handling - Weak Password
**Objective**: System requires strong passwords

**Steps**:
1. [ ] Open `auth.html`
2. [ ] Click "S'inscrire"
3. [ ] Fill in:
   - [ ] Prénom: "Test"
   - [ ] Nom: "User"
   - [ ] Email: "test@example.com"
   - [ ] Mot de passe: "short" (less than 8 characters)
4. [ ] Click "Créer un compte"

**Expected Results**:
- [ ] Error message: "Min 8 caractères"
- [ ] Red highlight on password field
- [ ] Form is not submitted

---

### Test 12: Password Confirmation Match
**Objective**: System requires password confirmation to match

**Steps**:
1. [ ] Open `auth.html`
2. [ ] Click "S'inscrire"
3. [ ] Fill in:
   - [ ] Mot de passe: "SecurePassword123!"
   - [ ] Confirmer mot de passe: "DifferentPassword123!"
4. [ ] Click "Créer un compte"

**Expected Results**:
- [ ] Error message: "Les mots de passe ne correspondent pas"
- [ ] Red highlight on confirm password field
- [ ] Form is not submitted

---

### Test 13: CV Creation with Real User
**Objective**: Authenticated user can create CVs

**Steps**:
1. [ ] Logged in on `dashboard.html`
2. [ ] Click "Nouveau CV" button
3. [ ] Enter CV name: "Mon Premier CV"
4. [ ] Click "Créer"

**Expected Results**:
- [ ] Success message: "CV créé! Redirection..."
- [ ] Redirects to `index.html` (editor)
- [ ] Editor loads with blank CV template
- [ ] User can edit and save CV
- [ ] CV data is saved to Firestore under user's ID

---

### Test 14: Complete User Journey
**Objective**: Full signup → login → create CV → edit → logout cycle

**Steps**:
1. [ ] Open `auth.html`
2. [ ] **Signup**: Create new account with valid data
3. [ ] **Verify**: On dashboard with empty state
4. [ ] **Create CV**: Click "Nouveau CV" → enter name → create
5. [ ] **Edit**: Fill in CV data (name, email, experience, etc.)
6. [ ] **Save**: Auto-save to Firestore
7. [ ] **Return**: Click "Mes CVs" in export tab
8. [ ] **Verify**: CV appears in dashboard grid
9. [ ] **Logout**: Click "Déconnexion" button
10. [ ] **Verify**: Redirected to auth.html

**Expected Results**:
- [ ] All steps complete without errors
- [ ] CV data persists across navigation
- [ ] User data persists across sessions
- [ ] No console errors

---

## 🔍 Browser Console Checks

**Expected console output**:
```
✅ Firebase fully initialized, checking user session...
✅ User authenticated: jean.dupont@example.com
✅ User profile ensured
✅ AUTH READY - User: jean.dupont@example.com
```

**Unexpected console errors** to watch for:
- ❌ `signInAnonymously is not defined`
- ❌ `Cannot read property 'uid' of null`
- ❌ `currentUser is null but authReady is true`
- ❌ `Uncaught TypeError: window.CVDocumentManager is undefined`

---

## 📊 Firestore Verification

**Expected `cv_users` document structure**:
```json
{
    userId: "XXXXX",
    email: "jean.dupont@example.com",
    firstName: "Jean",
    lastName: "Dupont",
    fullName: "Jean Dupont",
    plan: "free",
    quotaUsed: 0,
    quotaMax: 2,
    createdAt: "2025-03-06T...",
    updatedAt: "2025-03-06T...",
    metadata: {
        lastLogin: "2025-03-06T...",
        loginCount: 1,
        timezone: "Europe/Paris"
    }
}
```

---

## 🚀 Deployment Checklist

Before deploying to Firebase:

- [ ] All tests pass locally
- [ ] No console errors
- [ ] auth.html redirects correctly
- [ ] dashboard.html checks authentication
- [ ] Logout button works
- [ ] Session persists
- [ ] Firestore rules allow authenticated users only
- [ ] No hardcoded localhost URLs
- [ ] Firebase config is correct
- [ ] Run: `firebase deploy --only hosting`
- [ ] Test live deployment on https://valde-tech.web.app
- [ ] Verify all flows work on live site

---

## 📝 Notes

### Development Testing
- Use Firefox DevTools → Storage → Cookies/LocalStorage to verify session tokens
- Check Firestore Rules to ensure proper access control
- Use Firebase Console → Authentication to view active users

### Known Issues
- None at this time

### Future Enhancements
- [ ] Email verification before account creation
- [ ] "Forgot Password" functionality
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)
- [ ] User profile editing page

---

**Last Updated**: March 6, 2025
**Tester**: [Your Name]
**Status**: Ready for testing ✅
