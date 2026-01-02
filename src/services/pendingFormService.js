// ============================================
// src/services/pendingFormService.js
// Pending Forms Service - For Review Workflow
// ============================================

import {
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

const PENDING_FORMS_COLLECTION = 'pending_forms';

// 1️⃣ Save a pending form
export const savePendingForm = async (formData, formType) => {
    try {
        const docRef = await addDoc(collection(db, PENDING_FORMS_COLLECTION), {
            type: formType, // 'client', 'subscription', 'request'
            data: formData,
            status: 'pending', // pending, approved, rejected
            createdAt: Timestamp.now(),
            notes: ''
        });
        console.log('✅ Pending form saved:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error saving pending form:', error);
        throw error;
    }
};

// 2️⃣ Get all pending forms
export const getPendingForms = async () => {
    try {
        const q = query(collection(db, PENDING_FORMS_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('❌ Error fetching pending forms:', error);
        throw error;
    }
};

// 3️⃣ Approve a pending form
export const approvePendingForm = async (formId, finalData = null) => {
    try {
        const formRef = doc(db, PENDING_FORMS_COLLECTION, formId);
        await updateDoc(formRef, {
            status: 'approved',
            approvedAt: Timestamp.now(),
            ...(finalData && { data: finalData })
        });
        console.log('✅ Form approved:', formId);
        return true;
    } catch (error) {
        console.error('❌ Error approving form:', error);
        throw error;
    }
};

// 4️⃣ Reject a pending form
export const rejectPendingForm = async (formId, reason = '') => {
    try {
        const formRef = doc(db, PENDING_FORMS_COLLECTION, formId);
        await updateDoc(formRef, {
            status: 'rejected',
            rejectedAt: Timestamp.now(),
            rejectionReason: reason
        });
        console.log('✅ Form rejected:', formId);
        return true;
    } catch (error) {
        console.error('❌ Error rejecting form:', error);
        throw error;
    }
};

// 5️⃣ Delete a pending form
export const deletePendingForm = async (formId) => {
    try {
        await deleteDoc(doc(db, PENDING_FORMS_COLLECTION, formId));
        console.log('✅ Pending form deleted:', formId);
        return true;
    } catch (error) {
        console.error('❌ Error deleting pending form:', error);
        throw error;
    }
};

// 6️⃣ Update a pending form (for edits before approval)
export const updatePendingForm = async (formId, updatedData) => {
    try {
        const formRef = doc(db, PENDING_FORMS_COLLECTION, formId);
        await updateDoc(formRef, {
            data: updatedData,
            updatedAt: Timestamp.now()
        });
        console.log('✅ Pending form updated:', formId);
        return true;
    } catch (error) {
        console.error('❌ Error updating pending form:', error);
        throw error;
    }
};

// 7️⃣ Get count of pending forms (for badges)
export const getPendingFormsCount = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, PENDING_FORMS_COLLECTION));
        return querySnapshot.docs.filter(d => d.data().status === 'pending').length;
    } catch (error) {
        console.error('❌ Error getting pending count:', error);
        return 0;
    }
};
