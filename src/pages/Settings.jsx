
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Parse from '../services/back4app' // Corrected path based on project structure

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(false)

    const [settings, setSettings] = useState({
        businessName: 'Fitness Coaching',
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
            { code: 'SAR', rate: 13 }
        ],
        primaryCurrency: 'EGP',
        language: 'ar'
    })

    const [formData, setFormData] = useState({
        businessName: 'Fitness Coaching',
        businessLogo: null,
        businessLogoPreview: '',
        primaryCurrency: 'EGP',
        language: 'ar'
    })

    const [newAccount, setNewAccount] = useState('')
    const [newPackage, setNewPackage] = useState({ name: '', description: '' })
    const [newCurrency, setNewCurrency] = useState({ code: '', rate: '' })

    // State for editing
    const [editingCurrency, setEditingCurrency] = useState(null)

    // قائمة العملات المتاحة
    const AVAILABLE_CURRENCIES = [
        { code: 'EGP', name: 'Egyptian Pound' },
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'SAR', name: 'Saudi Riyal' },
        { code: 'AED', name: 'UAE Dirham' },
        { code: 'KWD', name: 'Kuwaiti Dinar' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'CAD', name: 'Canadian Dollar' },
        { code: 'AUD', name: 'Australian Dollar' },
        { code: 'JPY', name: 'Japanese Yen' },
        { code: 'QAR', name: 'Qatari Riyal' },
        { code: 'BHD', name: 'Bahraini Dinar' },
        { code: 'OMR', name: 'Omani Rial' },
        { code: 'JOD', name: 'Jordanian Dinar' }
    ]

    // جلب سعر الصرف المباشر
    const fetchLiveRate = async (base, target) => {
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`)
            const data = await response.json()
            return data.rates[target]
        } catch (error) {
            console.error('Failed to fetch rate:', error)
            return null
        }
    }

    useEffect(() => {
        loadSettings()
    }, [])

    // تحميل الإعدادات
    const loadSettings = async () => {
        try {
            const query = new Parse.Query('Settings')
            const result = await query.first()

            if (result) {
                // Handle legacy currencies (array of strings)
                let loadedCurrencies = result.get('currencies') || ['EGP', 'USD', 'AED', 'SAR', 'KWD', 'EUR']
                if (loadedCurrencies.length > 0 && typeof loadedCurrencies[0] === 'string') {
                    loadedCurrencies = loadedCurrencies.map(c => ({ code: c, rate: 1 }))
                }

                const data = {
                    businessName: result.get('businessName') || 'Fitness Coaching',
                    businessLogoUrl: result.get('businessLogoUrl') || '',
                    receiveAccounts: result.get('receiveAccounts') || ['Vodafon', 'Fawry', 'FREE'],
                    packages: result.get('packages') || [
                        { id: 'basic', name: 'Gold', description: 'الباقة الأساسية' },
                        { id: 'standard', name: 'Varialiv', description: 'الباقة المتوسطة' },
                        { id: 'premium', name: 'VIP', description: 'الباقة المتقدمة' }
                    ],
                    currencies: loadedCurrencies,
                    primaryCurrency: result.get('primaryCurrency') || 'EGP',
                    language: result.get('language') || 'ar'
                }

                setSettings(data)
                setFormData({
                    businessName: data.businessName,
                    businessLogoPreview: data.businessLogoUrl,
                    businessLogo: null,
                    primaryCurrency: data.primaryCurrency,
                    language: data.language
                })
            } else {
                await initializeSettings()
            }
        } catch (error) {
            console.error('❌ خطأ:', error)
        }
    }

    // إنشاء إعدادات افتراضية
    const initializeSettings = async () => {
        try {
            const Settings = Parse.Object.extend('Settings')
            const newSettings = new Settings()
            const defaultCurrencies = [
                { code: 'EGP', rate: 1 },
                { code: 'USD', rate: 50 },
                { code: 'AED', rate: 13 },
                { code: 'SAR', rate: 13 }
            ]

            newSettings.set('businessName', 'Fitness Coaching')
            newSettings.set('receiveAccounts', ['Vodafon', 'Fawry', 'FREE'])
            newSettings.set('packages', [
                { id: 'basic', name: 'Gold', description: 'الباقة الأساسية' },
                { id: 'standard', name: 'Varialiv', description: 'الباقة المتوسطة' },
                { id: 'premium', name: 'VIP', description: 'الباقة المتقدمة' }
            ])
            newSettings.set('currencies', defaultCurrencies)
            newSettings.set('primaryCurrency', 'EGP')
            newSettings.set('language', 'ar')

            await newSettings.save()
            toast.success('✅ تم إنشاء الإعدادات الافتراضية')
            loadSettings()
        } catch (error) {
            console.error('❌ خطأ:', error)
        }
    }

    // حفظ البيانات العامة
    const handleSaveGeneral = async () => {
        if (!formData.businessName.trim()) {
            toast.warning('⚠️ أدخل اسم المشروع')
            return
        }

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            let settingsObj = await query.first()

            if (!settingsObj) {
                settingsObj = new (Parse.Object.extend('Settings'))()
            }

            // التحقق من تغيير العملة الرئيسية
            const oldPrimary = settings.primaryCurrency
            const newPrimary = formData.primaryCurrency

            let updatedCurrencies = [...settings.currencies]

            if (oldPrimary !== newPrimary) {
                // نحتاج لإعادة حساب أسعار الصرف بالنسبة للعملة الجديدة
                const newPrimaryObj = settings.currencies.find(c => c.code === newPrimary)
                const conversionFactor = newPrimaryObj ? newPrimaryObj.rate : 1

                updatedCurrencies = updatedCurrencies.map(c => {
                    if (c.code === newPrimary) return { ...c, rate: 1, isManual: false }
                    return {
                        ...c,
                        rate: parseFloat((c.rate / conversionFactor).toFixed(4))
                    }
                })
            }

            settingsObj.set('businessName', formData.businessName)
            settingsObj.set('primaryCurrency', formData.primaryCurrency)
            settingsObj.set('language', formData.language)
            settingsObj.set('currencies', updatedCurrencies)

            // رفع الصورة
            if (formData.businessLogo) {
                const parseFile = new Parse.File(formData.businessLogo.name, formData.businessLogo)
                await parseFile.save()
                settingsObj.set('businessLogoUrl', parseFile.url())
            }

            await settingsObj.save()
            toast.success('✅ تم حفظ البيانات وتحديث العملات!')
            loadSettings()
        } catch (error) {
            console.error('❌ خطأ:', error)
            toast.error(`❌ خطأ: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    // إضافة حساب
    const handleAddAccount = async () => {
        if (!newAccount.trim()) {
            toast.warning('⚠️ أدخل اسم الحساب')
            return
        }

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            if (settingsObj) {
                const accounts = settingsObj.get('receiveAccounts') || []
                if (!accounts.includes(newAccount)) {
                    accounts.push(newAccount)
                    settingsObj.set('receiveAccounts', accounts)
                    await settingsObj.save()
                    toast.success('✅ تم إضافة الحساب!')
                    setNewAccount('')
                    loadSettings()
                } else {
                    toast.warning('⚠️ الحساب موجود بالفعل')
                }
            }
        } catch (error) {
            toast.error('❌ فشل الإضافة')
        } finally {
            setLoading(false)
        }
    }

    // حذف حساب
    const handleDeleteAccount = async (account) => {
        if (!window.confirm(`حذف "${account}"؟`)) return

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            if (settingsObj) {
                const accounts = settingsObj.get('receiveAccounts') || []
                const filtered = accounts.filter(a => a !== account)
                settingsObj.set('receiveAccounts', filtered)
                await settingsObj.save()
                toast.success('✅ تم الحذف!')
                loadSettings()
            }
        } catch (error) {
            toast.error('❌ فشل الحذف')
        } finally {
            setLoading(false)
        }
    }

    // إضافة باقة
    const handleAddPackage = async () => {
        if (!newPackage.name.trim()) {
            toast.warning('⚠️ أدخل اسم الباقة')
            return
        }

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            if (settingsObj) {
                const packages = settingsObj.get('packages') || []
                const newId = `pkg_${Date.now()}`
                packages.push({
                    id: newId,
                    name: newPackage.name,
                    description: newPackage.description
                })
                settingsObj.set('packages', packages)
                await settingsObj.save()
                toast.success('✅ تم إضافة الباقة!')
                setNewPackage({ name: '', description: '' })
                loadSettings()
            }
        } catch (error) {
            toast.error('❌ فشل الإضافة')
        } finally {
            setLoading(false)
        }
    }

    // حذف باقة
    const handleDeletePackage = async (pkgId) => {
        if (!window.confirm('حذف الباقة؟')) return

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            if (settingsObj) {
                const packages = settingsObj.get('packages') || []
                const filtered = packages.filter(p => p.id !== pkgId)
                settingsObj.set('packages', filtered)
                await settingsObj.save()
                toast.success('✅ تم الحذف!')
                loadSettings()
            }
        } catch (error) {
            toast.error('❌ فشل الحذف')
        } finally {
            setLoading(false)
        }
    }

    // إضافة عملة
    const handleAddCurrency = async () => {
        if (!newCurrency.code) {
            toast.warning('⚠️ اختر العملة')
            return
        }

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            if (settingsObj) {
                let currentCurrencies = settings.currencies || []

                const existingIndex = currentCurrencies.findIndex(c => c.code === newCurrency.code)

                if (existingIndex === -1) {
                    // Try to fetch live rate
                    let rate = parseFloat(newCurrency.rate)
                    if (!rate || isNaN(rate)) {
                        const liveRate = await fetchLiveRate(newCurrency.code, settings.primaryCurrency)
                        rate = liveRate || 1
                    }

                    currentCurrencies.push({
                        code: newCurrency.code,
                        rate: rate,
                        isManual: false
                    })

                    settingsObj.set('currencies', currentCurrencies)
                    await settingsObj.save()
                    toast.success(`✅ تم إضافة ${newCurrency.code} بسعر ${rate}`)
                    setNewCurrency({ code: AVAILABLE_CURRENCIES[0].code, rate: '' })
                    loadSettings()
                } else {
                    toast.warning('⚠️ العملة موجودة بالفعل')
                }
            }
        } catch (error) {
            toast.error('❌ فشل الإضافة')
        } finally {
            setLoading(false)
        }
    }

    // تحديث (Refresh) سعر عملة من السوق
    const handleRefreshRate = async (currency) => {
        setLoading(true)
        try {
            const liveRate = await fetchLiveRate(currency.code, settings.primaryCurrency)
            if (liveRate) {
                const query = new Parse.Query('Settings')
                const settingsObj = await query.first()

                let currentCurrencies = settings.currencies.map(c => {
                    if (c.code === currency.code) {
                        return { ...c, rate: liveRate, isManual: false }
                    }
                    return c
                })

                settingsObj.set('currencies', currentCurrencies)
                await settingsObj.save()
                toast.success(`✅ تم تحديث سعر ${currency.code} إلى ${liveRate}`)
                loadSettings()
            } else {
                toast.error('❌ تعذر جلب السعر من السوق')
            }
        } catch (error) {
            toast.error('❌ خطأ في التحديث')
        } finally {
            setLoading(false)
        }
    }

    // حفظ تعديل يدوي
    const handleSaveEdit = async (currencyCode, newRate) => {
        const rate = parseFloat(newRate)
        if (isNaN(rate) || rate <= 0) return

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            let currentCurrencies = settings.currencies.map(c => {
                if (c.code === currencyCode) {
                    return { ...c, rate: rate, isManual: true }
                }
                return c
            })

            settingsObj.set('currencies', currentCurrencies)
            await settingsObj.save()
            toast.success('✅ تم حفظ التعديل')
            setEditingCurrency(null)
            loadSettings()
        } catch (error) {
            toast.error('❌ فشل الحفظ')
        } finally {
            setLoading(false)
        }
    }

    // حذف عملة
    const handleDeleteCurrency = async (currencyCode) => {
        if (!window.confirm(`حذف "${currencyCode}"؟`)) return

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            if (settingsObj) {
                let currentCurrencies = settingsObj.get('currencies') || []
                // Handle possible legacy format during delete
                if (currentCurrencies.length > 0 && typeof currentCurrencies[0] === 'string') {
                    currentCurrencies = currentCurrencies.map(c => ({ code: c, rate: 1, isManual: false }))
                }

                const filtered = currentCurrencies.filter(c => c.code !== currencyCode)
                settingsObj.set('currencies', filtered)
                await settingsObj.save()
                toast.success('✅ تم الحذف!')
                loadSettings()
            }
        } catch (error) {
            toast.error('❌ فشل الحذف')
        } finally {
            setLoading(false)
        }
    }

    // تحديث سعر الصرف
    const handleUpdateRate = async (code, newRate) => {
        const rate = parseFloat(newRate)
        if (isNaN(rate) || rate < 0) return

        try {
            // We update local state optimistically, but save via a separate button or auto-save? 
            // To keep it simple, let's just update the backend when they change it or click a small save icon?
            // Actually, recreating the `currencies` array and saving is safer.
            // For now, let's assume the user deletes and re-adds to change rate significantly, 
            // OR we add a small API call to save just this change.

            // Simplest approach: "Edit" isn't requested explicitly but implied. 
            // Let's rely on Add/Delete for now as per minimal viable change, 
            // OR better: allow re-adding same code to update rate?
            // The prompt asks for "side by side", so showing it is key. editing is nice-to-have.
            // I'll stick to Delete/Add for simplicity unless I add an Edit mode.
            // Wait, user said "beside each currency its value".
        } catch (e) { }
    }

    return (
        <div className="min-h-screen transition-colors p-8 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                {/* الرأس */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                            ⚙️ الإعدادات
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            تخصيص النظام، العملات، واللغات
                        </p>
                    </div>
                </div>

                {/* التبويبات والمحتوى */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* الجانب الأيسر - التبويبات */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800">
                            {[
                                { id: 'general', label: '🏢 البيانات العامة' },
                                { id: 'accounts', label: '💳 الحسابات' },
                                { id: 'packages', label: '📦 الباقات' },
                                { id: 'currencies', label: '💱 العملات وأسعار الصرف' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-right px-6 py-4 border-b transition ${activeTab === tab.id
                                        ? `bg-blue-500 text-white border-l-4 border-l-blue-700 font-bold`
                                        : `text-gray-600 hover:bg-gray-50 border-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-700`
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* الجانب الأيمن - المحتوى */}
                    <div className="lg:col-span-3">
                        {/* البيانات العامة */}
                        {activeTab === 'general' && (
                            <div className="rounded-lg shadow-lg p-8 bg-white dark:bg-gray-800">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                                    🏢 البيانات العامة
                                </h2>

                                <div className="space-y-6">
                                    {/* اسم المشروع */}
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                            📝 اسم المشروع
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border-2 transition bg-white border-gray-300 text-gray-900 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="اسم المشروع"
                                        />
                                    </div>

                                    {/* العملة الرئيسية واللغة */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                                💰 العملة الرئيسية (للتقارير)
                                            </label>
                                            <select
                                                value={formData.primaryCurrency}
                                                onChange={(e) => setFormData({ ...formData, primaryCurrency: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border-2 transition bg-white border-gray-300 text-gray-900 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                {settings.currencies.map(c => (
                                                    <option key={c.code} value={c.code}>{c.code}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                                🌐 لغة الموقع
                                            </label>
                                            <select
                                                value={formData.language}
                                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border-2 transition bg-white border-gray-300 text-gray-900 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value="ar">العربية</option>
                                                <option value="en">English</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* اللوجو */}
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                            🎨 اللوجو
                                        </label>
                                        <div className="border-2 border-dashed rounded-lg p-8 text-center transition border-gray-300 hover:border-blue-500 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                                            {formData.businessLogoPreview && (
                                                <div className="mb-4">
                                                    <img
                                                        src={formData.businessLogoPreview}
                                                        alt="Logo"
                                                        className="h-24 w-24 mx-auto rounded-lg object-cover border-2 border-blue-500"
                                                    />
                                                    <p className="text-sm text-green-500 mt-2">✅ تم التحميل</p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0]
                                                    if (file) {
                                                        setFormData({ ...formData, businessLogo: file })
                                                        const reader = new FileReader()
                                                        reader.onload = (e) => {
                                                            setFormData(prev => ({ ...prev, businessLogoPreview: e.target.result }))
                                                        }
                                                        reader.readAsDataURL(file)
                                                    }
                                                }}
                                                className="hidden"
                                                id="logo-input"
                                            />
                                            <label htmlFor="logo-input" className="cursor-pointer">
                                                <p className="text-gray-600 dark:text-gray-300">اسحب أو اضغط</p>
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveGeneral}
                                        disabled={loading}
                                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 transition"
                                    >
                                        {loading ? 'جاري...' : '💾 حفظ التغييرات'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* الحسابات */}
                        {activeTab === 'accounts' && (
                            <div className="rounded-lg shadow-lg p-8 bg-white dark:bg-gray-800">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                                    💳 حسابات الاستقبال
                                </h2>

                                {/* إضافة */}
                                <div className="mb-8 p-6 rounded-lg border-2 border-dashed bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newAccount}
                                            onChange={(e) => setNewAccount(e.target.value)}
                                            placeholder="Vodafon, Fawry..."
                                            className="flex-1 px-4 py-2 rounded-lg border-2 bg-white border-gray-300 text-gray-900 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                        />
                                        <button
                                            onClick={handleAddAccount}
                                            disabled={loading}
                                            className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50"
                                        >
                                            ✅ إضافة
                                        </button>
                                    </div>
                                </div>

                                {/* القائمة */}
                                <div className="grid gap-3">
                                    {settings.receiveAccounts.map(account => (
                                        <div
                                            key={account}
                                            className="flex justify-between items-center p-4 rounded-lg border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-700"
                                        >
                                            <span className="font-bold border-none">💳 {account}</span>
                                            <button
                                                onClick={() => handleDeleteAccount(account)}
                                                disabled={loading}
                                                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* الباقات */}
                        {activeTab === 'packages' && (
                            <div className="rounded-lg shadow-lg p-8 bg-white dark:bg-gray-800">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                                    📦 الباقات
                                </h2>

                                {/* إضافة */}
                                <div className="mb-8 p-6 rounded-lg border-2 border-dashed bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={newPackage.name}
                                            onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                                            placeholder="اسم الباقة"
                                            className="w-full px-4 py-2 rounded-lg border-2 bg-white border-gray-300 text-gray-900 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                        />
                                        <textarea
                                            value={newPackage.description}
                                            onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                                            placeholder="الوصف"
                                            rows="2"
                                            className="w-full px-4 py-2 rounded-lg border-2 bg-white border-gray-300 text-gray-900 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                        />
                                        <button
                                            onClick={handleAddPackage}
                                            disabled={loading}
                                            className="w-full px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                                        >
                                            ✅ إضافة
                                        </button>
                                    </div>
                                </div>

                                {/* القائمة */}
                                <div className="grid gap-4">
                                    {settings.packages.map(pkg => (
                                        <div
                                            key={pkg.id}
                                            className="p-4 rounded-lg border-l-4 border-purple-500 bg-gray-50 dark:bg-gray-700"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg">📦 {pkg.name}</h4>
                                                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                                                        {pkg.description}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePackage(pkg.id)}
                                                    disabled={loading}
                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* العملات */}
                        {activeTab === 'currencies' && (() => {
                            // Logic to calculate displayed currencies based on pending Primary Currency change
                            let displayedCurrencies = settings.currencies || []
                            const isPrimaryChanged = formData.primaryCurrency !== settings.primaryCurrency

                            if (isPrimaryChanged) {
                                const newPrimaryCode = formData.primaryCurrency
                                const oldPrimaryCode = settings.primaryCurrency

                                // Find rate of New Primary relative to Old Primary
                                const newPrimaryObj = settings.currencies.find(c => c.code === newPrimaryCode)
                                const conversionFactor = newPrimaryObj ? parseFloat(newPrimaryObj.rate) : 1

                                // Recalculate all for preview
                                displayedCurrencies = settings.currencies.map(c => {
                                    if (c.code === newPrimaryCode) {
                                        return { ...c, rate: 1 }
                                    }
                                    // New Rate = Old Rate / Conversion Factor
                                    const estimatedRate = conversionFactor > 0 ? (c.rate / conversionFactor) : 0
                                    return {
                                        ...c,
                                        rate: parseFloat(estimatedRate.toFixed(4))
                                    }
                                })
                            }

                            return (
                                <div className="rounded-lg shadow-lg p-8 bg-white dark:bg-gray-800">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                                        💱 العملات وأسعار الصرف
                                    </h2>

                                    {isPrimaryChanged && (
                                        <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                                            ⚠️ <b>تنبيه:</b> الأسعار المعروضة أدناه هي <b>تقديرية</b> بناءً على اختيارك الجديد للعملة الرئيسية ({formData.primaryCurrency}).
                                            يرجى حفظ التغييرات في تبويب "البيانات العامة" لاعتمادها.
                                        </div>
                                    )}

                                    <p className="mb-4 text-sm text-gray-500">
                                        حدد سعر الصرف مقابل العملة الرئيسية المختارة ({formData.primaryCurrency}).
                                        {!isPrimaryChanged && " استخدم زر التحديث 🔄 لجلب السعر الحالي من السوق، أو القلم ✏️ للتعديل اليدوي."}
                                    </p>

                                    {/* إضافة */}
                                    {!isPrimaryChanged && (
                                        <div className="mb-8 p-6 rounded-lg border-2 border-dashed bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                                            <div className="flex gap-3">
                                                <select
                                                    value={newCurrency.code}
                                                    onChange={(e) => {
                                                        setNewCurrency({ ...newCurrency, code: e.target.value })
                                                        if (e.target.value) {
                                                            fetchLiveRate(e.target.value, settings.primaryCurrency)
                                                                .then(rate => {
                                                                    if (rate) setNewCurrency(prev => ({ ...prev, code: e.target.value, rate: rate }))
                                                                })
                                                        }
                                                    }}
                                                    className="w-1/3 px-4 py-2 rounded-lg border-2 bg-white border-gray-300 text-gray-900 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                >
                                                    {AVAILABLE_CURRENCIES
                                                        .filter(c => !settings.currencies.some(sc => sc.code === c.code))
                                                        .map(c => (
                                                            <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                                        ))
                                                    }
                                                </select>
                                                <input
                                                    type="number"
                                                    value={newCurrency.rate}
                                                    onChange={(e) => setNewCurrency({ ...newCurrency, rate: e.target.value })}
                                                    placeholder="السعر (Auto if empty)"
                                                    className="w-1/3 px-4 py-2 rounded-lg border-2 bg-white border-gray-300 text-gray-900 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                />
                                                <button
                                                    onClick={handleAddCurrency}
                                                    disabled={loading}
                                                    className="w-1/3 px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                                                >
                                                    ✅ إضافة
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* القائمة */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {displayedCurrencies.map(currency => (
                                            <div
                                                key={currency.code}
                                                className={`flex justify-between items-center p-3 rounded-lg border-l-4 ${currency.isManual ? 'border-orange-500' : 'border-cyan-500'} bg-gray-50 dark:bg-gray-700`}
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <span className="font-bold text-lg">💱 {currency.code}</span>

                                                    {(!isPrimaryChanged && editingCurrency === currency.code) ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                defaultValue={currency.rate}
                                                                id={`edit-rate-${currency.code}`}
                                                                className="w-24 px-2 py-1 rounded border text-black"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const val = document.getElementById(`edit-rate-${currency.code}`).value
                                                                    handleSaveEdit(currency.code, val)
                                                                }}
                                                                className="text-green-500 hover:text-green-700"
                                                            >✅</button>
                                                            <button
                                                                onClick={() => setEditingCurrency(null)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >❌</button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded flex items-center gap-2">
                                                            = {currency.rate} {formData.primaryCurrency}
                                                            {currency.isManual && <span className="text-xs text-orange-500" title="Manual Rate">🖐️</span>}
                                                        </span>
                                                    )}
                                                </div>

                                                {!isPrimaryChanged && (
                                                    <div className="flex items-center gap-2">
                                                        {/* Edit Button */}
                                                        {!editingCurrency && (
                                                            <button
                                                                onClick={() => setEditingCurrency(currency.code)}
                                                                disabled={loading}
                                                                className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600 transition"
                                                                title="تعديل يدوي"
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}

                                                        {/* Refresh Button */}
                                                        <button
                                                            onClick={() => handleRefreshRate(currency)}
                                                            disabled={loading}
                                                            className="p-2 text-green-500 hover:text-green-700 rounded-full hover:bg-green-100 dark:hover:bg-gray-600 transition"
                                                            title="تحديث من السوق"
                                                        >
                                                            🔄
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => handleDeleteCurrency(currency.code)}
                                                            disabled={loading}
                                                            className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 transition"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                </div>
            </div>
        </div>
    )
}
