// ============================================
// src/services/pendingFormService.js
// Pending Forms Service - Back4App (Parse) Logic
// ============================================

import Parse from './back4app';
import { addNewClient } from './clientService'; // We'll delegate approval to clientService

const PENDING_FORM_CLASS = 'PendingForm';

// Save New Pending Form
export const savePendingForm = async (formData, formType = 'client') => {
    try {
        const PendingForm = Parse.Object.extend(PENDING_FORM_CLASS);
        const form = new PendingForm();

        // Basic meta-data
        form.set('type', formType);
        form.set('status', 'pending');
        form.set('submittedAt', new Date());

        // Store the raw form data as a JSON object in a column named 'data'
        // OR map fields individually. Storing as JSON 'data' is flexible for variable schemas.
        // However, looking at previous implementation, we might want some top-level fields for querying.

        // Let's store compact data + key fields for searching
        form.set('data', formData);

        // Hoist key fields for Dashboard/List queries
        if (formData.fullName) form.set('fullName', formData.fullName);
        if (formData.email) form.set('email', formData.email);
        if (formData.phone) form.set('phone', formData.phone);

        const result = await form.save();
        return result.id;
    } catch (error) {
        console.error("Error saving pending form:", error);
        throw error;
    }
};

// Get All Pending Forms
export const getPendingForms = async () => {
    try {
        const query = new Parse.Query(PENDING_FORM_CLASS);
        query.equalTo('status', 'pending');
        query.descending('submittedAt');

        const results = await query.find();
        return results.map(doc => ({
            id: doc.id,
            ...doc.attributes,
            // Ensure 'data' attribute is spread or accessible
            ...doc.get('data'),
            submittedAt: doc.get('submittedAt')
        }));
    } catch (error) {
        throw new Error(`Error fetching pending forms: ${error.message}`);
    }
};

// Get Pending Form by ID
export const getPendingFormById = async (id) => {
    try {
        const query = new Parse.Query(PENDING_FORM_CLASS);
        const doc = await query.get(id);
        return {
            id: doc.id,
            ...doc.attributes,
            ...doc.get('data')
        };
    } catch (error) {
        throw new Error(`Error fetching form: ${error.message}`);
    }
};

// Approve Form
// Approve Form
export const approvePendingForm = async (id, finalData) => {
    try {
        // Note: The actual creation of Client/Subscription is handled by the UI controller (PendingFormsPage)
        // This function just marks the form as approved.

        const query = new Parse.Query(PENDING_FORM_CLASS);
        const form = await query.get(id);

        form.set('status', 'approved');
        form.set('approvedAt', new Date());

        // If finalData contains a new ID (e.g., ClientID), we could save it, but mostly we just mark approved.
        if (finalData.objectId) {
            form.set('relatedId', finalData.objectId);
        }

        await form.save();
        return form.id;
    } catch (error) {
        throw new Error(`Error approving form: ${error.message}`);
    }
};

// Reject Form
export const rejectPendingForm = async (id, reason) => {
    try {
        const query = new Parse.Query(PENDING_FORM_CLASS);
        const form = await query.get(id);

        form.set('status', 'rejected');
        form.set('rejectionReason', reason);
        form.set('rejectedAt', new Date());

        await form.save();
    } catch (error) {
        throw new Error(`Error rejecting form: ${error.message}`);
    }
};

// Delete Form
export const deletePendingForm = async (id) => {
    try {
        const query = new Parse.Query(PENDING_FORM_CLASS);
        const form = await query.get(id);
        await form.destroy();
    } catch (error) {
        throw new Error(`Error deleting form: ${error.message}`);
    }
};

// Update Pending Form Data
export const updatePendingForm = async (id, updatedData) => {
    try {
        const query = new Parse.Query(PENDING_FORM_CLASS);
        const form = await query.get(id);

        // Update the 'data' object
        // Note: For deep merge patterns, we might need to fetch `data` first.
        // Assuming updatedData is the full new state or we merge manually.
        const currentData = form.get('data') || {};
        const newData = { ...currentData, ...updatedData };

        form.set('data', newData);

        // Update hoisted fields if they changed
        if (updatedData.fullName) form.set('fullName', updatedData.fullName);
        if (updatedData.email) form.set('email', updatedData.email);

        await form.save();
    } catch (error) {
        throw new Error(`Error updating form: ${error.message}`);
    }
};

// 7️⃣ Get count of pending forms (for badges)
// 7️⃣ Get count of pending forms (for badges)
export const getPendingFormsCount = async () => {
    try {
        const query = new Parse.Query(PENDING_FORM_CLASS);
        query.equalTo('status', 'pending');
        return await query.count();
    } catch (error) {
        console.error('❌ Error getting pending count:', error);
        return 0;
    }
};
