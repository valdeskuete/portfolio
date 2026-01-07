/**
 * Firebase CV Manager
 * Handles all Firestore operations for CV management
 * Architecture designed for scalability and future billing integration
 * 
 * ⚠️ IMPORTANT: Cette app utilise des collections SÉPARÉES (cv_users, cv_documents)
 * pour rester indépendante de la sécurité du root site (admin panel).
 * 
 * Les firestore.rules protègent:
 * - cv_users: accessible par le user lui-même OU admin
 * - cv_documents: accessible par le owner OU admin
 * - cv_billing: accessible par le user OU admin
 * - cv_activity: logs d'activité
 * 
 * Pas de conflit avec la collection 'users' du root site (role-based auth)
 */

// Firebase configuration (imported from main firebase-config.js)
const firebaseDb = window.db || window.firebaseDb;
const firebaseAuth = window.auth || window.firebaseAuth;

// ===== COLLECTION PATHS =====
const COLLECTIONS = {
    USERS: 'cv_users',        // User profiles with quota info
    CVS: 'cv_documents',       // CV documents
    BILLING: 'cv_billing',     // Billing/subscription data
    ACTIVITY: 'cv_activity'    // Activity logs for analytics
};

// ===== PLAN DEFINITIONS =====
const PLANS = {
    FREE: {
        name: 'free',
        maxCVs: 2,
        features: ['basic_templates', 'pdf_export'],
        price: 0
    },
    PRO: {
        name: 'pro',
        maxCVs: 10,
        features: ['all_templates', 'pdf_export', 'png_export', 'word_export', 'cloud_sync'],
        price: 9.99
    },
    ENTERPRISE: {
        name: 'enterprise',
        maxCVs: 999,
        features: ['all_templates', 'all_exports', 'cloud_sync', 'priority_support', 'custom_branding'],
        price: 29.99
    }
};

// ===== USER MANAGEMENT =====
class CVUserManager {
    /**
     * Get or create user profile
     */
    static async ensureUserProfile(userId, email) {
        try {
            const userDoc = await this.getUserProfile(userId);
            
            if (!userDoc) {
                // Create new user with FREE plan
                await this.createUserProfile(userId, email, 'free');
                console.log('✅ New user profile created');
            }
            
            return await this.getUserProfile(userId);
        } catch (err) {
            console.error('Error ensuring user profile:', err);
            throw err;
        }
    }

    static async getUserProfile(userId) {
        try {
            const userRef = window.doc(firebaseDb, COLLECTIONS.USERS, userId);
            const userSnap = await window.getDoc(userRef);
            return userSnap.exists() ? userSnap.data() : null;
        } catch (err) {
            console.error('Error getting user profile:', err);
            return null;
        }
    }

    static async createUserProfile(userId, email, plan = 'free') {
        try {
            const userRef = window.doc(firebaseDb, COLLECTIONS.USERS, userId);
            const userData = {
                userId: userId,
                email: email,
                plan: plan,
                quotaUsed: 0,
                quotaMax: PLANS[plan.toUpperCase()] ? PLANS[plan.toUpperCase()].maxCVs : 2,
                createdAt: window.serverTimestamp(),
                updatedAt: window.serverTimestamp(),
                metadata: {
                    lastLogin: window.serverTimestamp(),
                    loginCount: 1,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };
            
            await window.setDoc(userRef, userData);
            console.log('✅ User profile created:', userId);
            return userData;
        } catch (err) {
            console.error('Error creating user profile:', err);
            throw err;
        }
    }

    static async updateUserPlan(userId, newPlan) {
        try {
            const userRef = window.doc(firebaseDb, COLLECTIONS.USERS, userId);
            const newQuota = PLANS[newPlan.toUpperCase()] ? PLANS[newPlan.toUpperCase()].maxCVs : 2;
            
            await window.updateDoc(userRef, {
                plan: newPlan,
                quotaMax: newQuota,
                updatedAt: window.serverTimestamp()
            });
            
            // Log billing event
            await this.logActivity(userId, 'plan_updated', { 
                oldPlan: (await this.getUserProfile(userId)).plan,
                newPlan: newPlan 
            });
            
            console.log('✅ User plan updated:', newPlan);
        } catch (err) {
            console.error('Error updating user plan:', err);
            throw err;
        }
    }

    static async logActivity(userId, action, data = {}) {
        try {
            await window.addDoc(window.collection(firebaseDb, COLLECTIONS.ACTIVITY), {
                userId: userId,
                action: action,
                data: data,
                timestamp: window.serverTimestamp()
            });
        } catch (err) {
            console.error('Error logging activity:', err);
        }
    }
}

// ===== CV MANAGEMENT =====
class CVDocumentManager {
    /**
     * Get all CVs for a user
     */
    static async getUserCVs(userId) {
        try {
            const q = window.query(
                window.collection(firebaseDb, COLLECTIONS.CVS),
                window.where('userId', '==', userId),
                window.orderBy('updatedAt', 'desc')
            );
            
            const querySnapshot = await window.getDocs(q);
            const cvs = [];
            querySnapshot.forEach(doc => {
                cvs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return cvs;
        } catch (err) {
            console.error('Error getting user CVs:', err);
            return [];
        }
    }

    /**
     * Get single CV by ID
     */
    static async getCV(cvId) {
        try {
            const cvRef = window.doc(firebaseDb, COLLECTIONS.CVS, cvId);
            const cvSnap = await window.getDoc(cvRef);
            return cvSnap.exists() ? { id: cvId, ...cvSnap.data() } : null;
        } catch (err) {
            console.error('Error getting CV:', err);
            return null;
        }
    }

    /**
     * Create new CV
     */
    static async createCV(userId, cvName) {
        try {
            // Check quota
            const userProfile = await CVUserManager.getUserProfile(userId);
            if (userProfile.quotaUsed >= userProfile.quotaMax) {
                throw new Error(`Quota reached. You can have max ${userProfile.quotaMax} CVs on your ${userProfile.plan} plan.`);
            }

            const cvData = {
                userId: userId,
                name: cvName,
                fullName: '',
                jobTitle: '',
                email: '',
                phone: '',
                location: '',
                about: '',
                photoData: null,
                educations: [],
                experiences: [],
                skills: [],
                languages: [],
                interests: [],
                template: 'minimal',
                fontTitle: 'Poppins',
                fontBody: 'Roboto',
                primaryColor: '#0084ff',
                createdAt: window.serverTimestamp(),
                updatedAt: window.serverTimestamp(),
                metadata: {
                    viewCount: 0,
                    exportCount: 0,
                    lastModifiedBy: 'user'
                }
            };

            const docRef = await window.addDoc(
                window.collection(firebaseDb, COLLECTIONS.CVS),
                cvData
            );

            // Update quota
            await window.updateDoc(window.doc(firebaseDb, COLLECTIONS.USERS, userId), {
                quotaUsed: window.increment(1)
            });

            // Log activity
            await CVUserManager.logActivity(userId, 'cv_created', { 
                cvId: docRef.id,
                cvName: cvName
            });

            console.log('✅ CV created:', docRef.id);
            return docRef.id;
        } catch (err) {
            console.error('Error creating CV:', err);
            throw err;
        }
    }

    /**
     * Update CV data
     */
    static async updateCV(cvId, cvData) {
        try {
            const cvRef = window.doc(firebaseDb, COLLECTIONS.CVS, cvId);
            
            // Add update timestamp and metadata
            const updateData = {
                ...cvData,
                updatedAt: window.serverTimestamp(),
                'metadata.lastModifiedBy': 'user'
            };

            await window.updateDoc(cvRef, updateData);
            console.log('💾 CV saved:', cvId);
            return true;
        } catch (err) {
            console.error('Error updating CV:', err);
            throw err;
        }
    }

    /**
     * Delete CV
     */
    static async deleteCV(cvId, userId) {
        try {
            const cvRef = window.doc(firebaseDb, COLLECTIONS.CVS, cvId);
            
            // Verify ownership
            const cv = await this.getCV(cvId);
            if (cv.userId !== userId) {
                throw new Error('Unauthorized: CV does not belong to user');
            }

            await window.deleteDoc(cvRef);

            // Update quota
            await window.updateDoc(window.doc(firebaseDb, COLLECTIONS.USERS, userId), {
                quotaUsed: window.increment(-1)
            });

            // Log activity
            await CVUserManager.logActivity(userId, 'cv_deleted', { cvId: cvId });

            console.log('✅ CV deleted:', cvId);
            return true;
        } catch (err) {
            console.error('Error deleting CV:', err);
            throw err;
        }
    }

    /**
     * Duplicate CV
     */
    static async duplicateCV(cvId, userId) {
        try {
            const originalCV = await this.getCV(cvId);
            
            // Verify ownership
            if (originalCV.userId !== userId) {
                throw new Error('Unauthorized: CV does not belong to user');
            }

            // Check quota
            const userProfile = await CVUserManager.getUserProfile(userId);
            if (userProfile.quotaUsed >= userProfile.quotaMax) {
                throw new Error(`Quota reached. You can have max ${userProfile.quotaMax} CVs on your ${userProfile.plan} plan.`);
            }

            // Create duplicate
            const duplicateData = {
                ...originalCV,
                name: originalCV.name + ' (Copie)',
                createdAt: window.serverTimestamp(),
                updatedAt: window.serverTimestamp(),
                metadata: {
                    ...originalCV.metadata,
                    duplicatedFrom: cvId
                }
            };

            delete duplicateData.id; // Remove ID so it gets a new one

            const docRef = await window.addDoc(
                window.collection(firebaseDb, COLLECTIONS.CVS),
                duplicateData
            );

            // Update quota
            await window.updateDoc(window.doc(firebaseDb, COLLECTIONS.USERS, userId), {
                quotaUsed: window.increment(1)
            });

            // Log activity
            await CVUserManager.logActivity(userId, 'cv_duplicated', { 
                originalId: cvId,
                duplicateId: docRef.id
            });

            console.log('✅ CV duplicated:', docRef.id);
            return docRef.id;
        } catch (err) {
            console.error('Error duplicating CV:', err);
            throw err;
        }
    }

    /**
     * Real-time listener for CV updates
     */
    static onCVUpdate(cvId, callback) {
        try {
            const cvRef = window.doc(firebaseDb, COLLECTIONS.CVS, cvId);
            return window.onSnapshot(cvRef, (doc) => {
                if (doc.exists()) {
                    callback({ id: doc.id, ...doc.data() });
                } else {
                    callback(null);
                }
            }, (err) => {
                console.error('Error listening to CV:', err);
            });
        } catch (err) {
            console.error('Error setting up CV listener:', err);
            return null;
        }
    }

    /**
     * Real-time listener for user's CVs
     */
    static onUserCVsUpdate(userId, callback) {
        try {
            const q = window.query(
                window.collection(firebaseDb, COLLECTIONS.CVS),
                window.where('userId', '==', userId),
                window.orderBy('updatedAt', 'desc')
            );
            
            return window.onSnapshot(q, (querySnapshot) => {
                const cvs = [];
                querySnapshot.forEach(doc => {
                    cvs.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(cvs);
            }, (err) => {
                console.error('Error listening to user CVs:', err);
            });
        } catch (err) {
            console.error('Error setting up CVs listener:', err);
            return null;
        }
    }
}

// ===== BILLING MANAGEMENT (Ready for integration) =====
class CVBillingManager {
    /**
     * Get user billing info
     */
    static async getBillingInfo(userId) {
        try {
            const billingRef = window.doc(firebaseDb, COLLECTIONS.BILLING, userId);
            const billingSnap = await window.getDoc(billingRef);
            return billingSnap.exists() ? billingSnap.data() : null;
        } catch (err) {
            console.error('Error getting billing info:', err);
            return null;
        }
    }

    /**
     * Create billing record (called after subscription)
     */
    static async createBillingRecord(userId, plan, paymentMethod) {
        try {
            const billingRef = window.doc(firebaseDb, COLLECTIONS.BILLING, userId);
            const billingData = {
                userId: userId,
                plan: plan,
                status: 'active',
                paymentMethod: paymentMethod,
                startDate: window.serverTimestamp(),
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdAt: window.serverTimestamp()
            };

            await window.setDoc(billingRef, billingData);
            console.log('✅ Billing record created');
            return billingData;
        } catch (err) {
            console.error('Error creating billing record:', err);
            throw err;
        }
    }

    /**
     * Cancel subscription
     */
    static async cancelSubscription(userId) {
        try {
            const billingRef = window.doc(firebaseDb, COLLECTIONS.BILLING, userId);
            await window.updateDoc(billingRef, {
                status: 'cancelled',
                cancelledAt: window.serverTimestamp()
            });

            // Downgrade to FREE plan
            await CVUserManager.updateUserPlan(userId, 'free');

            console.log('✅ Subscription cancelled');
        } catch (err) {
            console.error('Error cancelling subscription:', err);
            throw err;
        }
    }

    /**
     * Get billing history
     */
    static async getBillingHistory(userId) {
        try {
            const q = window.query(
                window.collection(firebaseDb, COLLECTIONS.BILLING + '/' + userId + '/history'),
                window.orderBy('date', 'desc')
            );
            
            const querySnapshot = await window.getDocs(q);
            const history = [];
            querySnapshot.forEach(doc => {
                history.push(doc.data());
            });
            
            return history;
        } catch (err) {
            console.error('Error getting billing history:', err);
            return [];
        }
    }
}

// ===== EXPORT TO GLOBAL =====
window.CVUserManager = CVUserManager;
window.CVDocumentManager = CVDocumentManager;
window.CVBillingManager = CVBillingManager;
window.CV_PLANS = PLANS;
window.CV_COLLECTIONS = COLLECTIONS;

console.log('✅ Firebase CV Config loaded');
