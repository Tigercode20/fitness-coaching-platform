// ============================================
// src/services/subscriptionService.js
// Subscription Service - Back4App (Parse) Logic
// ============================================

import Parse from './back4app';

const SUBSCRIPTION_CLASS = 'Subscription';

// Add New Subscription
export const addSubscription = async (subscriptionData) => {
    try {
        const Subscription = Parse.Object.extend(SUBSCRIPTION_CLASS);
        const subscription = new Subscription();

        // Set fields
        Object.keys(subscriptionData).forEach(key => {
            if (subscriptionData[key] !== undefined) {
                subscription.set(key, subscriptionData[key]);
            }
        });

        // Ensure dates are stored as Date objects if they are ISO strings
        if (typeof subscriptionData.StartDate === 'string') {
            subscription.set('StartDate', new Date(subscriptionData.StartDate));
        }
        if (typeof subscriptionData.EndDate === 'string') {
            subscription.set('EndDate', new Date(subscriptionData.EndDate));
        }

        const result = await subscription.save();
        return result.id;
    } catch (error) {
        throw new Error(`Error adding subscription: ${error.message}`);
    }
};

// Get All Subscriptions
export const getAllSubscriptions = async () => {
    try {
        const query = new Parse.Query(SUBSCRIPTION_CLASS);
        query.descending('createdAt');
        query.limit(1000);

        const results = await query.find();

        return results.map(doc => ({
            id: doc.id,
            ...doc.attributes,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        }));
    } catch (error) {
        throw new Error(`Error fetching subscriptions: ${error.message}`);
    }
};

// Get Subscription by ID
export const getSubscriptionById = async (subscriptionId) => {
    try {
        const query = new Parse.Query(SUBSCRIPTION_CLASS);
        const doc = await query.get(subscriptionId);
        return {
            id: doc.id,
            ...doc.attributes
        };
    } catch (error) {
        throw new Error(`Error fetching subscription: ${error.message}`);
    }
};

// Get Subscriptions by Client ID
export const getSubscriptionsByClientId = async (clientId) => {
    try {
        const query = new Parse.Query(SUBSCRIPTION_CLASS);
        query.equalTo('ClientID', clientId);
        query.descending('createdAt');

        const results = await query.find();
        return results.map(doc => ({
            id: doc.id,
            ...doc.attributes
        }));
    } catch (error) {
        throw new Error(`Error fetching client subscriptions: ${error.message}`);
    }
};

// Get Active Subscriptions
export const getActiveSubscriptions = async () => {
    try {
        const query = new Parse.Query(SUBSCRIPTION_CLASS);
        // 'Status' field: 'Active' or 'Expiring Soon'
        query.containedIn('Status', ['Active', 'Expiring Soon']);
        query.ascending('EndDate');

        const results = await query.find();
        return results.map(doc => ({
            id: doc.id,
            ...doc.attributes
        }));
    } catch (error) {
        throw new Error(`Error fetching active subscriptions: ${error.message}`);
    }
};

// Update Subscription
export const updateSubscription = async (subscriptionId, updates) => {
    try {
        const query = new Parse.Query(SUBSCRIPTION_CLASS);
        const subscription = await query.get(subscriptionId);

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                subscription.set(key, updates[key]);
            }
        });

        // Handle Date updates
        if (updates.StartDate) subscription.set('StartDate', new Date(updates.StartDate));
        if (updates.EndDate) subscription.set('EndDate', new Date(updates.EndDate));

        await subscription.save();
    } catch (error) {
        throw new Error(`Error updating subscription: ${error.message}`);
    }
};

// Calculate End Date
export const calculateEndDate = (startDate, durationMonths, bonusMonths) => {
    const start = new Date(startDate);
    const totalMonths = parseInt(durationMonths) + (parseInt(bonusMonths) || 0);
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

// Delete Subscription
export const deleteSubscription = async (subscriptionId) => {
    try {
        const query = new Parse.Query(SUBSCRIPTION_CLASS);
        const subscription = await query.get(subscriptionId);
        await subscription.destroy();
    } catch (error) {
        throw new Error(`Error deleting subscription: ${error.message}`);
    }
};
