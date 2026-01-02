import { addNewClient, getAllClients, deleteClient } from './clientService';
import { addSubscription, getAllSubscriptions, deleteSubscription } from './subscriptionService'; // You might need to add deleteSubscription to subscriptionService if it doesn't exist, or use deleteDoc directly here if I import db
import { deleteDoc, doc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

// ✅ Fake Data Generator - Firestore Version

export const generateFakeClient = () => {
    const firstNames = ['محمد', 'أحمد', 'علي', 'سارة', 'فاطمة', 'ليلى', 'خالد', 'نور', 'زيد', 'هناء'];
    const lastNames = ['محمود', 'السيد', 'حسن', 'علي', 'الشامي', 'الدين', 'الحسن'];
    const goals = ['فقدان الوزن', 'بناء العضلات', 'اللياقة العامة', 'تحسين الصحة', 'الرشاقة'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const num = Math.floor(Math.random() * 10000);
    const phoneNum = Math.floor(Math.random() * 90000000) + 10000000;

    return {
        FullName: `${firstName} ${lastName}`, // Capitalized as per previous files
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
                    Type: plan, // Using 'Type' based on SubscriptionsPage
                    Price: prices[plan],
                    StartDate: startDate.toISOString().split('T')[0],
                    EndDate: endDate.toISOString().split('T')[0],
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
        const batchButton = confirm('This will specificially delete ALL clients and subscriptions from Cloud Firestore. Are you sure?');
        if (!batchButton) return false;

        console.log('Clearing all data...');
        const batch = writeBatch(db);
        let opCount = 0;
        const MAX_BATCH_SIZE = 450; // Firestore limit is 500

        // Get all clients
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        clientsSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
            opCount++;
        });

        // Get all subscriptions
        const subsSnapshot = await getDocs(collection(db, 'subscriptions'));
        subsSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
            opCount++;
        });

        // If we have operations, commit them. 
        // Note: For very large datasets, we should chunk this. 
        // Assuming reasonable test data size for now (<500 docs total).
        if (opCount > 0) {
            if (opCount > 500) {
                alert('Too many documents to delete at once. Please implement batch chunking.');
                return false;
            }
            await batch.commit();
            console.log(`✅ Deleted ${opCount} documents.`);
        } else {
            console.log('No data to delete.');
        }

        return true;
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        alert('Failed to clear data: ' + error.message);
        return false;
    }
};
