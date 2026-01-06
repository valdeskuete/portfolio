# Forgot Password / Password Recovery Feature

## Overview
Users can now recover their forgotten passwords by receiving a password reset email from Firebase Authentication.

## How It Works

### User Flow

```
User on auth.html
    ↓
Click "Mot de passe oublié?" link
    ↓
Redirected to reset password form
    ↓
Enter email address
    ↓
Click "Envoyer le lien"
    ↓
Firebase sends password reset email
    ↓
User receives email with reset link
    ↓
User clicks link in email
    ↓
Firebase auth page opens to reset password
    ↓
User enters new password
    ↓
Password is updated in Firebase
    ↓
User can log in with new password
```

### Technical Implementation

#### 1. Reset Password Form (`auth.html`)

**HTML Elements**:
```html
<!-- Reset Password Tab -->
<form class="auth-form" id="resetForm" onsubmit="handleReset(event)">
    <button type="button" class="back-button" onclick="switchAuthTab('login')">
        <i class="fas fa-arrow-left"></i> Retour
    </button>
    
    <div class="form-group">
        <label for="resetEmail">Email</label>
        <input type="email" id="resetEmail" placeholder="votre@email.com" required>
        <span class="form-error" id="resetEmailError"></span>
    </div>
    
    <button type="submit" class="btn-primary" id="resetBtn">
        <i class="fas fa-spinner"></i> Envoyer le lien
    </button>
</form>
```

**Navigation**:
- Link visible in login form: `<a class="forgot-password-link" onclick="switchAuthTab('reset')">Mot de passe oublié?</a>`
- Back button returns to login form
- Tabs are hidden when on reset password form
- Tab bar shown only for login/signup tabs

#### 2. JavaScript Handler Function

```javascript
async function handleReset(e) {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('resetEmail').value.trim();
    const btn = document.getElementById('resetBtn');

    if (!email) {
        setError('resetEmail', 'Email requis');
        return;
    }

    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner"></i> Envoi en cours...';

    try {
        // Firebase function to send password reset email
        await window.sendPasswordResetEmail(window.auth, email);
        
        // Show success message
        showToast('✅ Lien envoyé! Vérifiez votre email.', 'success');
        
        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
            document.getElementById('resetEmail').value = '';
            switchAuthTab('login');
        }, 2000);
    } catch (error) {
        // Handle Firebase errors
        let message = 'Erreur lors de l\'envoi du lien';
        
        if (error.code === 'auth/user-not-found') {
            message = 'Aucun compte associé à cet email';
            setError('resetEmail', message);
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email invalide';
            setError('resetEmail', message);
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Trop de tentatives. Réessayez plus tard.';
            setError('resetEmail', message);
        }
        
        showToast(message, 'error');
    } finally {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-spinner"></i> Envoyer le lien';
    }
}
```

#### 3. Firebase Function

```javascript
// Import Firebase
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Expose to window
window.sendPasswordResetEmail = sendPasswordResetEmail;

// Usage in handleReset
await window.sendPasswordResetEmail(window.auth, email);
```

## Error Handling

### Firebase Error Codes

| Error Code | Message | UI Feedback |
|---|---|---|
| `auth/user-not-found` | No account with this email | "Aucun compte associé à cet email" |
| `auth/invalid-email` | Invalid email format | "Email invalide" |
| `auth/too-many-requests` | Too many reset attempts | "Trop de tentatives. Réessayez plus tard." |
| (other) | Generic error | "Erreur lors de l'envoi du lien" |

### User Feedback

- ✅ **Success**: Green toast notification "✅ Lien envoyé! Vérifiez votre email."
- ❌ **Error**: Red toast notification with specific error message
- Red highlight on email field if validation fails
- Loading state on button during submission

## Email Content

Firebase automatically sends a professional password reset email containing:

1. **Email Address**: Confirms the email address
2. **Reset Link**: Direct link to Firebase's password reset page
3. **Expiration**: Link expires after 24 hours
4. **Security**: Email is required to prevent unauthorized password changes

### Example Email Format:
```
Subject: CV Pro - Réinitialiser votre mot de passe

Bonjour,

Vous avez demandé un lien pour réinitialiser votre mot de passe.
Cliquez sur le lien ci-dessous:

[RESET LINK - expires in 24 hours]

Si vous n'avez pas demandé cela, ignorez simplement cet email.

CV Pro Team
```

## Security Features

### Rate Limiting
- Firebase limits password reset requests per email/IP
- Error: "Trop de tentatives. Réessayez plus tard."
- Prevents brute force attacks

### Email Verification
- User must have access to registered email
- Reset link is sent to email on file
- Prevents account takeover without email access

### Link Expiration
- Reset links expire after 24 hours
- User must request new link if old one expires
- Prevents old links from being exploited

### No Password Exposure
- Reset link never contains password
- Password is set by user on Firebase's secure page
- Original password never transmitted via email

## User Experience

### Success Flow
```
1. User clicks "Mot de passe oublié?"
   → Reset form appears

2. User enters email
   → Form validates email format

3. User clicks "Envoyer le lien"
   → Loading spinner shows

4. Email sent successfully
   → Green success toast appears
   → Form clears
   → Auto-redirect to login after 2 seconds

5. User checks email
   → Firebase password reset email arrives

6. User clicks reset link
   → Browser opens Firebase password reset page

7. User enters new password
   → Password is updated in Firebase

8. User logs in with new password
   → User is authenticated and directed to dashboard
```

### Error Flow
```
1. User enters invalid email
   → Error message below email field
   → Red highlight on field
   → Button shows error icon

2. User enters email with no account
   → Toast notification: "Aucun compte associé à cet email"
   → Email field highlighted in red
   → User can try again or go back to signup

3. User tries to reset too many times
   → Toast notification: "Trop de tentatives. Réessayez plus tard."
   → User must wait before trying again
   → Can go back to login and try regular signin
```

## Testing the Feature

### Test Case 1: Valid Email
1. Open auth.html
2. Click "Mot de passe oublié?"
3. Enter registered email
4. Click "Envoyer le lien"
5. **Expected**: Success toast appears, redirects to login after 2 seconds

### Test Case 2: Unregistered Email
1. Open auth.html
2. Click "Mot de passe oublié?"
3. Enter email with no account: "nonexistent@example.com"
4. Click "Envoyer le lien"
5. **Expected**: Error message "Aucun compte associé à cet email"

### Test Case 3: Invalid Email Format
1. Open auth.html
2. Click "Mot de passe oublié?"
3. Enter invalid email: "notanemail"
4. Browser prevents form submission due to HTML5 validation
5. **Expected**: Browser shows "Please include an '@' in the email address"

### Test Case 4: Back Button
1. Open auth.html
2. Click "Mot de passe oublié?"
3. See reset form
4. Click "← Retour" button
5. **Expected**: Returns to login form

### Test Case 5: Complete Reset
1. Open auth.html
2. Enter test account email
3. Click "Mot de passe oublié?"
4. Enter email and submit
5. Check email inbox for password reset link
6. Click link in email
7. Enter new password
8. Confirm new password
9. Return to auth.html
10. Login with new password
11. **Expected**: Successfully logs in to dashboard

## Firebase Configuration

### Required Setup
```javascript
// sendPasswordResetEmail must be imported
import { sendPasswordResetEmail } from "firebase/auth";

// Exposed to window for use
window.sendPasswordResetEmail = sendPasswordResetEmail;

// Called with auth instance and email
await window.sendPasswordResetEmail(window.auth, email);
```

### Email Configuration
Firebase uses the project's default email configuration:
- Sender: `noreply@valde-tech.firebaseapp.com`
- Template: Firebase default reset email
- Subject: Automatic (Firebase managed)

### Future Customization
To customize the password reset email:
1. Go to Firebase Console
2. Navigate to: Authentication → Email Templates
3. Edit "Password Reset" template
4. Customize subject, text, and branding

## Best Practices

### For Users
1. **Check Spam Folder**: Reset email might end up in spam
2. **Act Quickly**: Reset links expire after 24 hours
3. **New Password**: Use a strong, unique password
4. **Browser History**: Don't share reset links

### For Developers
1. **Monitor**: Track password reset request rates in Firebase Console
2. **Security**: Never display the reset link in logs
3. **Rate Limiting**: Firebase handles this automatically
4. **Notification**: Consider adding email delivery status to Firestore logs

## Known Limitations

1. **Email Delivery**: Depends on email service reliability
2. **Spam Filters**: Reset email might be filtered as spam
3. **Browser Dependent**: User must have email access
4. **24-Hour Expiration**: Link expires after 24 hours

## Future Enhancements

- [ ] Add resend button if email not received
- [ ] SMS-based password reset as alternative
- [ ] Security questions verification
- [ ] Multi-factor authentication
- [ ] Admin password reset capability
- [ ] Account recovery with backup codes

---

**Last Updated**: January 6, 2026
**Feature Status**: ✅ Implemented and Tested
**Firebase SDK**: v10.7.1
