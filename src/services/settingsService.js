import Parse from './back4app'

// جلب الإعدادات
// جلب الإعدادات
export const getSettings = async () => {
    try {
        const query = new Parse.Query('Settings')
        const result = await query.first()

        if (!result) {
            return {
                businessName: 'Fitness Coaching Platform',
                businessLogoUrl: '',
                receiveAccounts: ['Vodafon', 'Fawry', 'FREE'],
                packages: [
                    { id: 'basic', name: 'Gold', description: 'الباقة الأساسية' },
                    { id: 'standard', name: 'Varialiv', description: 'الباقة المتوسطة' },
                    { id: 'premium', name: 'VIP', description: 'الباقة المتقدمة' }
                ],
                currencies: [
                    { code: 'EGP', rate: 1 },
                    { code: 'USD', rate: 50 },
                    { code: 'AED', rate: 13 },
                    { code: 'SAR', rate: 13 }
                ],
                primaryCurrency: 'EGP',
                language: 'ar',
                subscriptionTypes: [
                    { id: 'new', name: 'جديد', icon: '✨' },
                    { id: 'renewal', name: 'تجديد', icon: '🔄' }
                ]
            }
        }

        // Handle legacy currencies (array of strings)
        let loadedCurrencies = result.get('currencies') || ['EGP', 'USD', 'AED', 'SAR', 'KWD', 'EUR']
        if (loadedCurrencies.length > 0 && typeof loadedCurrencies[0] === 'string') {
            loadedCurrencies = loadedCurrencies.map(c => ({ code: c, rate: 1 }))
        }

        return {
            businessName: result.get('businessName') || 'Fitness Coaching Platform',
            businessLogoUrl: result.get('businessLogoUrl') || '',
            receiveAccounts: result.get('receiveAccounts') || ['Vodafon', 'Fawry', 'FREE'],
            packages: result.get('packages') || [
                { id: 'basic', name: 'Gold', description: 'الباقة الأساسية' },
                { id: 'standard', name: 'Varialiv', description: 'الباقة المتوسطة' },
                { id: 'premium', name: 'VIP', description: 'الباقة المتقدمة' }
            ],
            currencies: loadedCurrencies,
            primaryCurrency: result.get('primaryCurrency') || 'EGP',
            language: result.get('language') || 'ar',
            subscriptionTypes: result.get('subscriptionTypes') || [
                { id: 'new', name: 'جديد', icon: '✨' },
                { id: 'renewal', name: 'تجديد', icon: '🔄' }
            ]
        }
    } catch (error) {
        console.error('❌ خطأ:', error.message)
        throw error
    }
}

// جلب اسم المشروع واللوجو
export const getBusinessInfo = async () => {
    try {
        const settings = await getSettings()
        return {
            name: settings.businessName,
            logo: settings.businessLogoUrl
        }
    } catch (error) {
        console.error('❌ خطأ:', error.message)
        throw error
    }
}

// جلب خيارات Select
export const getSelectOptions = async (type) => {
    try {
        const settings = await getSettings()

        switch (type) {
            case 'accounts':
                return settings.receiveAccounts
            case 'packages':
                return settings.packages
            case 'currencies':
                return settings.currencies
            case 'subscriptionTypes':
                return settings.subscriptionTypes
            default:
                return []
        }
    } catch (error) {
        console.error('❌ خطأ:', error.message)
        throw error
    }
}
