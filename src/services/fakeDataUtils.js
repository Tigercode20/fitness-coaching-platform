// ============================================
// src/services/fakeDataUtils.js
// Fake Data Generator - Back4App (Parse) Version
// ============================================

import { addNewClient } from './clientService';
import { addSubscription } from './subscriptionService';
import Parse from './back4app';

// ✅ Fake Data Generator

export const generateFakeClient = () => {
    const firstNames = ['محمد', 'أحمد', 'علي', 'سارة', 'فاطمة', 'ليلى', 'خالد', 'نور', 'زيد', 'هناء'];
    const lastNames = ['محمود', 'السيد', 'حسن', 'علي', 'الشامي', 'الدين', 'الحسن'];
    const goals = ['فقدان الوزن', 'بناء العضلات', 'اللياقة العامة', 'تحسين الصحة', 'الرشاقة'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const num = Math.floor(Math.random() * 10000);
    const phoneNum = Math.floor(Math.random() * 90000000) + 10000000;

    return {
        FullName: `${firstName} ${lastName}`,
        Email: `user${num}@gmail.com`,
        PhoneNumber: `+2010${phoneNum}`,
        Age: Math.floor(Math.random() * (60 - 18)) + 18,
        Gender: Math.random() > 0.5 ? 'ذكر' : 'أنثى',
        Goal: goals[Math.floor(Math.random() * goals.length)],
        Status: Math.random() > 0.2 ? 'Active' : 'Inactive',
        ClientCode: `${Math.floor(Math.random() * 9000) + 1000}`,
        Notes: 'عميل وهمي للاختبار'
    };
};

export const addFakeData = async (count = 5) => {
    try {
        console.log(`Starting to add ${count} fake clients...`);
        const clients = [];

        // 1. Add Clients
        for (let i = 0; i < count; i++) {
            const clientData = generateFakeClient();
            const clientId = await addNewClient(clientData);
            clients.push({ id: clientId, ...clientData });
            console.log(`Added client: ${clientData.FullName}`);
        }

        // 2. Add Subscriptions for these clients
        const plans = ['شهري', 'ثلاثة أشهر', 'سنوي'];
        const prices = { 'شهري': 500, 'ثلاثة أشهر': 1200, 'سنوي': 4000 };

        for (const client of clients) {
            // 80% chance to have a subscription
            if (Math.random() > 0.2) {
                const plan = plans[Math.floor(Math.random() * plans.length)];
                const startDate = new Date();
                // Random start date within last 30 days
                startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));

                const durationMonths = plan === 'شهري' ? 1 : plan === 'ثلاثة أشهر' ? 3 : 12;
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + durationMonths);

                const subscriptionData = {
                    ClientID: client.id,
                    ClientName: client.FullName,
                    Type: plan,
                    Price: prices[plan],
                    StartDate: startDate, // Date object
                    EndDate: endDate, // Date object
                    Status: 'Active',
                    PaidAmount: prices[plan],
                    RemainingAmount: 0
                };

                await addSubscription(subscriptionData);
                console.log(`Added subscription for: ${client.FullName}`);
            }
        }

        console.log(`✅ Successfully added fake data!`);
        return true;
    } catch (error) {
        console.error('❌ Error adding fake data:', error);
        alert('Failed to add fake data: ' + error.message);
        return false;
    }
};

export const clearAllData = async () => {
    try {
        const batchButton = confirm('This will specificially delete ALL clients and subscriptions from Back4App. Are you sure?');
        if (!batchButton) return false;

        console.log('Clearing all data...');

        // 1. Delete Clients
        const clientQuery = new Parse.Query('Client');
        clientQuery.limit(1000);
        const clients = await clientQuery.find();
        if (clients.length > 0) {
            await Parse.Object.destroyAll(clients);
            console.log(`Deleted ${clients.length} clients.`);
        }

        // 2. Delete Subscriptions
        const subQuery = new Parse.Query('Subscription');
        subQuery.limit(1000);
        const subscriptions = await subQuery.find();
        if (subscriptions.length > 0) {
            await Parse.Object.destroyAll(subscriptions);
            console.log(`Deleted ${subscriptions.length} subscriptions.`);
        }

        // 3. Delete Pending Forms
        const pendingQuery = new Parse.Query('PendingForm');
        pendingQuery.limit(1000);
        const pendingForms = await pendingQuery.find();
        if (pendingForms.length > 0) {
            await Parse.Object.destroyAll(pendingForms);
            console.log(`Deleted ${pendingForms.length} pending forms.`);
        }

        return true;
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        alert('Failed to clear data: ' + error.message);
        return false;
    }
};
