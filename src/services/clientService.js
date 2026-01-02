// ============================================
// src/services/clientService.js
// Client Service - Database Operations
// ============================================

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

const CLIENTS_COLLECTION = 'clients';

// Add New Client (from NewClientForm)
export const addNewClient = async (clientData) => {
    try {
        const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), {
            ...clientData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        throw new Error(`Error adding client: ${error.message}`);
    }
};

// Get All Clients
export const getAllClients = async () => {
    try {
        const querySnapshot = await getDocs(
            query(collection(db, CLIENTS_COLLECTION), orderBy('createdAt', 'desc'))
        );
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Error fetching clients: ${error.message}`);
    }
};

// Get Client by ID
export const getClientById = async (clientId) => {
    try {
        const docSnap = await getDoc(doc(db, CLIENTS_COLLECTION, clientId));
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        }
        return null;
    } catch (error) {
        throw new Error(`Error fetching client: ${error.message}`);
    }
};

// Get Client by Email
export const getClientByEmail = async (email) => {
    try {
        const q = query(
            collection(db, CLIENTS_COLLECTION),
            where('Email', '==', email)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return {
                id: querySnapshot.docs[0].id,
                ...querySnapshot.docs[0].data()
            };
        }
        return null;
    } catch (error) {
        throw new Error(`Error fetching client by email: ${error.message}`);
    }
};

// Get Client by ClientCode
export const getClientByCode = async (clientCode) => {
    try {
        const q = query(
            collection(db, CLIENTS_COLLECTION),
            where('ClientCode', '==', clientCode)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return {
                id: querySnapshot.docs[0].id,
                ...querySnapshot.docs[0].data()
            };
        }
        return null;
    } catch (error) {
        throw new Error(`Error fetching client by code: ${error.message}`);
    }
};

// Update Client
export const updateClient = async (clientId, updates) => {
    try {
        await updateDoc(doc(db, CLIENTS_COLLECTION, clientId), {
            ...updates,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        throw new Error(`Error updating client: ${error.message}`);
    }
};

// Delete Client
export const deleteClient = async (clientId) => {
    try {
        await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId));
    } catch (error) {
        throw new Error(`Error deleting client: ${error.message}`);
    }
};

// Search Clients by Name
export const searchClientsByName = async (searchTerm) => {
    try {
        const allClients = await getAllClients();
        return allClients.filter(client =>
            client.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.ClientCode?.includes(searchTerm)
        );
    } catch (error) {
        throw new Error(`Error searching clients: ${error.message}`);
    }
};
