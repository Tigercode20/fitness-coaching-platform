// ============================================
// src/services/clientService.js
// Client Service - Back4App (Parse) Operations
// ============================================

import Parse from './back4app';

const CLIENT_CLASS = 'Client';

// Add New Client
export const addNewClient = async (clientData) => {
    try {
        const Client = Parse.Object.extend(CLIENT_CLASS);
        const client = new Client();

        // Set fields
        Object.keys(clientData).forEach(key => {
            if (clientData[key] !== undefined) {
                client.set(key, clientData[key]);
            }
        });

        const result = await client.save();
        return result.id;
    } catch (error) {
        throw new Error(`Error adding client: ${error.message}`);
    }
};

// Get All Clients
export const getAllClients = async () => {
    try {
        const query = new Parse.Query(CLIENT_CLASS);
        query.descending('createdAt');
        query.limit(1000); // Adjust limit as needed
        const results = await query.find();

        return results.map(doc => ({
            id: doc.id,
            ...doc.attributes,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        }));
    } catch (error) {
        throw new Error(`Error fetching clients: ${error.message}`);
    }
};

// Get Client by ID
export const getClientById = async (clientId) => {
    try {
        const query = new Parse.Query(CLIENT_CLASS);
        const doc = await query.get(clientId);
        return {
            id: doc.id,
            ...doc.attributes
        };
    } catch (error) {
        throw new Error(`Error fetching client: ${error.message}`);
    }
};

// Get Client by Email
export const getClientByEmail = async (email) => {
    try {
        const query = new Parse.Query(CLIENT_CLASS);
        query.equalTo('Email', email);
        const doc = await query.first();

        if (doc) {
            return {
                id: doc.id,
                ...doc.attributes
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
        const query = new Parse.Query(CLIENT_CLASS);
        query.equalTo('ClientCode', clientCode);
        const doc = await query.first();

        if (doc) {
            return {
                id: doc.id,
                ...doc.attributes
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
        const query = new Parse.Query(CLIENT_CLASS);
        const client = await query.get(clientId);

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                // Handle special logic if needed for specific fields
                client.set(key, updates[key]);
            }
        });

        await client.save();
    } catch (error) {
        throw new Error(`Error updating client: ${error.message}`);
    }
};

// Delete Client
export const deleteClient = async (clientId) => {
    try {
        const query = new Parse.Query(CLIENT_CLASS);
        const client = await query.get(clientId);
        await client.destroy();
    } catch (error) {
        throw new Error(`Error deleting client: ${error.message}`);
    }
};

// Search Clients by Name
export const searchClientsByName = async (searchTerm) => {
    try {
        const lowerTerm = searchTerm.toLowerCase();

        const q1 = new Parse.Query(CLIENT_CLASS);
        q1.matches('FullName', new RegExp(searchTerm, 'i')); // Case-insensitive regex

        const q2 = new Parse.Query(CLIENT_CLASS);
        q2.matches('Email', new RegExp(searchTerm, 'i'));

        const q3 = new Parse.Query(CLIENT_CLASS);
        q3.startsWith('ClientCode', searchTerm);

        const mainQuery = Parse.Query.or(q1, q2, q3);
        const results = await mainQuery.find();

        return results.map(doc => ({
            id: doc.id,
            ...doc.attributes
        }));
    } catch (error) {
        throw new Error(`Error searching clients: ${error.message}`);
    }
};
