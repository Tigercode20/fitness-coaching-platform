// ============================================
// src/services/subscriptionService.js
// Subscription Service
// ============================================

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

// Add New Subscription (from SalesForm)
export const addSubscription = async (subscriptionData) => {
    try {
        const docRef = await addDoc(collection(db, SUBSCRIPTIONS_COLLECTION), {
            ...subscriptionData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        throw new Error(`Error adding subscription: ${error.message}`);
    }
};

// Get All Subscriptions
export const getAllSubscriptions = async () => {
    try {
        const querySnapshot = await getDocs(
            query(collection(db, SUBSCRIPTIONS_COLLECTION), orderBy('createdAt', 'desc'))
        );
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Error fetching subscriptions: ${error.message}`);
    }
};

// Get Subscription by ID
export const getSubscriptionById = async (subscriptionId) => {
    try {
        const docSnap = await getDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId));
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        }
        return null;
    } catch (error) {
        throw new Error(`Error fetching subscription: ${error.message}`);
    }
};

// Get Subscriptions by Client ID
export const getSubscriptionsByClientId = async (clientId) => {
    try {
        const q = query(
            collection(db, SUBSCRIPTIONS_COLLECTION),
            where('ClientID', '==', clientId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Error fetching client subscriptions: ${error.message}`);
    }
};

// Get Active Subscriptions
export const getActiveSubscriptions = async () => {
    try {
        const q = query(
            collection(db, SUBSCRIPTIONS_COLLECTION),
            where('Status', 'in', ['Active', 'Expiring Soon']),
            orderBy('EndDate', 'asc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Error fetching active subscriptions: ${error.message}`);
    }
};

// Update Subscription
export const updateSubscription = async (subscriptionId, updates) => {
    try {
        await updateDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId), {
            ...updates,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        throw new Error(`Error updating subscription: ${error.message}`);
    }
};

// Calculate End Date
export const calculateEndDate = (startDate, durationMonths, bonusMonths) => {
    const start = new Date(startDate);
    const totalMonths = durationMonths + (bonusMonths || 0);
    const end = new Date(start.getFullYear(), start.getMonth() + totalMonths, start.getDate());
    return end;
};

// Get Subscription Status
export const getSubscriptionStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'Pending';
    if (now > end) return 'Expired';

    const daysUntilExpiry = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 14) return 'Expiring Soon';

    return 'Active';
};
