import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Parse from '../services/back4app'

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        businessName: '',
        businessLogo: null,
        businessLogoUrl: '',
        receiveAccounts: [],
        packages: [],
        currencies: [],
        subscriptionTypes: []
    })

    const [formData, setFormData] = useState({
        businessName: '',
        businessLogo: null,
        businessLogoUrl: ''
    })

    // State for new items
    const [newAccount, setNewAccount] = useState('')
    const [newPackage, setNewPackage] = useState({ name: '', description: '' })
    const [newCurrency, setNewCurrency] = useState('')

    useEffect(() => {
        loadSettings()
    }, [])

    // تحميل الإعدادات
    const loadSettings = async () => {
        try {
            const query = new Parse.Query('Settings')
            const result = await query.first()

            if (result) {
                const data = {
                    businessName: result.get('businessName') || '',
                    businessLogoUrl: result.get('businessLogoUrl') || '',
                    receiveAccounts: result.get('receiveAccounts') || ['Vodafon', 'Fawry', 'FREE'],
                    packages: result.get('packages') || [
                        { id: 'basic', name: 'Gold', description: 'الباقة الأساسية' },
                        { id: 'standard', name: 'Varialiv', description: 'الباقة المتوسطة' },
                        { id: 'premium', name: 'VIP', description: 'الباقة المتقدمة' }
                    ],
                    currencies: result.get('currencies') || ['EGP', 'USD', 'AED', 'SAR', 'KWD', 'EUR'],
                    subscriptionTypes: result.get('subscriptionTypes') || [
                        { id: 'new', name: 'جديد', icon: '✨' },
                        { id: 'renewal', name: 'تجديد', icon: '🔄' }
                    ]
                }

                setSettings(data)
                setFormData({
                    businessName: data.businessName,
                    businessLogoUrl: data.businessLogoUrl,
                    businessLogo: null
                })
            } else {
                // إعدادات افتراضية أولى
                initializeSettings()
            }
        } catch (error) {
            console.error('❌ خطأ:', error)
            toast.error('فشل تحميل الإعدادات')
        }
    }

    // إنشاء إعدادات افتراضية
    const initializeSettings = async () => {
        try {
            const Settings = Parse.Object.extend('Settings')
            const settings = new Settings()

            settings.set('businessName', 'Fitness Coaching Platform')
            settings.set('receiveAccounts', ['Vodafon', 'Fawry', 'FREE'])
            settings.set('packages', [
                { id: 'basic', name: 'Gold', description: 'الباقة الأساسية' },
                { id: 'standard', name: 'Varialiv', description: 'الباقة المتوسطة' },
                { id: 'premium', name: 'VIP', description: 'الباقة المتقدمة' }
            ])
            settings.set('currencies', ['EGP', 'USD', 'AED', 'SAR', 'KWD', 'EUR'])
            settings.set('subscriptionTypes', [
                { id: 'new', name: 'جديد', icon: '✨' },
                { id: 'renewal', name: 'تجديد', icon: '🔄' }
            ])

            await settings.save()
            loadSettings()
            toast.success('✅ تم إنشاء الإعدادات الافتراضية')
        } catch (error) {
            console.error('❌ خطأ:', error)
            toast.error('فشل إنشاء الإعدادات')
        }
    }

    // حفظ الإعدادات العامة
    const handleSaveGeneral = async () => {
        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            let settingsObj = await query.first()

            if (!settingsObj) {
                settingsObj = new (Parse.Object.extend('Settings'))()
            }

            settingsObj.set('businessName', formData.businessName)

            // رفع الصورة إذا كانت موجودة
            if (formData.businessLogo) {
                const parseFile = new Parse.File(formData.businessLogo.name, formData.businessLogo)
                await parseFile.save()
                settingsObj.set('businessLogoUrl', parseFile.url())
            }

            await settingsObj.save()

            toast.success('✅ تم حفظ البيانات الأساسية!')
            loadSettings()
        } catch (error) {
            console.error('❌ خطأ:', error)
            toast.error(`❌ خطأ: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    // إضافة حساب استقبال جديد
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
            console.error('❌ خطأ:', error)
            toast.error('فشل إضافة الحساب')
        } finally {
            setLoading(false)
        }
    }

    // حذف حساب استقبال
    const handleDeleteAccount = async (account) => {
        if (!window.confirm(`هل تريد حذف حساب "${account}"؟`)) return

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            if (settingsObj) {
                const accounts = settingsObj.get('receiveAccounts') || []
                const filtered = accounts.filter(a => a !== account)
                settingsObj.set('receiveAccounts', filtered)
                await settingsObj.save()
                toast.success('✅ تم حذف الحساب!')
                loadSettings()
            }
        } catch (error) {
            console.error('❌ خطأ:', error)
            toast.error('فشل الحذف')
        } finally {
            setLoading(false)
        }
    }

    // إضافة باقة جديدة
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
                const newId = `package_${Date.now()}`
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
            console.error('❌ خطأ:', error)
            toast.error('فشل إضافة الباقة')
        } finally {
            setLoading(false)
        }
    }

    // حذف باقة
    const handleDeletePackage = async (packageId) => {
        if (!window.confirm('هل تريد حذف هذه الباقة؟')) return

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            if (settingsObj) {
                const packages = settingsObj.get('packages') || []
                const filtered = packages.filter(p => p.id !== packageId)
                settingsObj.set('packages', filtered)
                await settingsObj.save()
                toast.success('✅ تم حذف الباقة!')
                loadSettings()
            }
        } catch (error) {
            console.error('❌ خطأ:', error)
            toast.error('فشل الحذف')
        } finally {
            setLoading(false)
        }
    }

    // إضافة عملة جديدة
    const handleAddCurrency = async () => {
        if (!newCurrency.trim()) {
            toast.warning('⚠️ أدخل رمز العملة')
            return
        }

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            if (settingsObj) {
                const currencies = settingsObj.get('currencies') || []
                if (!currencies.includes(newCurrency)) {
                    currencies.push(newCurrency)
                    settingsObj.set('currencies', currencies)
                    await settingsObj.save()
                    toast.success('✅ تم إضافة العملة!')
                    setNewCurrency('')
                    loadSettings()
                } else {
                    toast.warning('⚠️ العملة موجودة بالفعل')
                }
            }
        } catch (error) {
            console.error('❌ خطأ:', error)
            toast.error('فشل إضافة العملة')
        } finally {
            setLoading(false)
        }
    }

    // حذف عملة
    const handleDeleteCurrency = async (currency) => {
        if (!window.confirm(`هل تريد حذف العملة "${currency}"؟`)) return

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            if (settingsObj) {
                const currencies = settingsObj.get('currencies') || []
                const filtered = currencies.filter(c => c !== currency)
                settingsObj.set('currencies', filtered)
                await settingsObj.save()
                toast.success('✅ تم حذف العملة!')
                loadSettings()
            }
        } catch (error) {
            console.error('❌ خطأ:', error)
            toast.error('فشل الحذف')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                {/* الرأس */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">⚙️ الإعدادات</h1>
                    <p className="text-gray-600 dark:text-gray-400">تخصيص النظام وإضافة البيانات الخاصة بك</p>
                </div>

                {/* التبويبات */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* الجانب الأيسر - التبويبات */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border dark:border-gray-700">
                            <div className="space-y-0">
                                {[
                                    { id: 'general', label: '🏢 البيانات العامة', icon: '🏢' },
                                    { id: 'accounts', label: '💳 حسابات الاستقبال', icon: '💳' },
                                    { id: 'packages', label: '📦 الباقات', icon: '📦' },
                                    { id: 'currencies', label: '💱 العملات', icon: '💱' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-right px-6 py-4 border-b dark:border-gray-700 transition ${activeTab === tab.id
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* الجانب الأيمن - المحتوى */}
                    <div className="lg:col-span-3">
                        {/* البيانات العامة */}
                        {activeTab === 'general' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border dark:border-gray-700">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">🏢 البيانات العامة</h2>

                                <div className="space-y-6">
                                    {/* اسم المشروع */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                            📝 اسم المشروع / الشركة
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="Fitness Coaching Platform"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">سيظهر في جميع الفواتير والرسائل</p>
                                    </div>

                                    {/* اللوجو */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                            🎨 اللوجو / الصورة الشخصية
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition">
                                            {formData.businessLogoUrl && (
                                                <div className="mb-4">
                                                    <img
                                                        src={formData.businessLogoUrl}
                                                        alt="Logo"
                                                        className="h-24 w-24 mx-auto rounded-lg object-cover border-2 border-gray-300"
                                                    />
                                                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">✅ تم تحميل الصورة</p>
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
                                                            setFormData(prev => ({ ...prev, businessLogoUrl: e.target.result }))
                                                        }
                                                        reader.readAsDataURL(file)
                                                    }
                                                }}
                                                className="hidden"
                                                id="logo-input"
                                            />
                                            <label htmlFor="logo-input" className="cursor-pointer">
                                                <p className="text-gray-600 dark:text-gray-400">اسحب الصورة هنا أو اضغط للاختيار</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">PNG, JPG, SVG (max 2MB)</p>
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">ستظهر في الفواتير والرسائل والمستندات</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={handleSaveGeneral}
                                            disabled={loading}
                                            className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 transition"
                                        >
                                            {loading ? 'جاري الحفظ...' : '💾 حفظ البيانات'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* حسابات الاستقبال */}
                        {activeTab === 'accounts' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border dark:border-gray-700">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">💳 حسابات الاستقبال</h2>

                                {/* إضافة حساب جديد */}
                                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">➕ إضافة حساب جديد</h3>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newAccount}
                                            onChange={(e) => setNewAccount(e.target.value)}
                                            placeholder="مثال: Vodafon, Fawry, Instapay..."
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                        <button
                                            onClick={handleAddAccount}
                                            disabled={loading}
                                            className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 transition"
                                        >
                                            ✅ إضافة
                                        </button>
                                    </div>
                                </div>

                                {/* قائمة الحسابات */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">الحسابات الموجودة:</h3>
                                    {settings.receiveAccounts.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد حسابات</p>
                                    ) : (
                                        <div className="grid gap-3">
                                            {settings.receiveAccounts.map(account => (
                                                <div
                                                    key={account}
                                                    className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition"
                                                >
                                                    <span className="text-gray-900 dark:text-white font-semibold">💳 {account}</span>
                                                    <button
                                                        onClick={() => handleDeleteAccount(account)}
                                                        disabled={loading}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition"
                                                    >
                                                        🗑️ حذف
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* الباقات */}
                        {activeTab === 'packages' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border dark:border-gray-700">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">📦 الباقات</h2>

                                {/* إضافة باقة جديدة */}
                                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">➕ إضافة باقة جديدة</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={newPackage.name}
                                            onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                                            placeholder="اسم الباقة (مثال: Gold, VIP...)"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                        <textarea
                                            value={newPackage.description}
                                            onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                                            placeholder="وصف الباقة"
                                            rows="2"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                        <button
                                            onClick={handleAddPackage}
                                            disabled={loading}
                                            className="w-full px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 transition"
                                        >
                                            ✅ إضافة الباقة
                                        </button>
                                    </div>
                                </div>

                                {/* قائمة الباقات */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">الباقات الموجودة:</h3>
                                    {settings.packages.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد باقات</p>
                                    ) : (
                                        <div className="grid gap-4">
                                            {settings.packages.map(pkg => (
                                                <div
                                                    key={pkg.id}
                                                    className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border-l-4 border-purple-500 hover:shadow-md transition"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">📦 {pkg.name}</h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{pkg.description}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">ID: {pkg.id}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeletePackage(pkg.id)}
                                                            disabled={loading}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition"
                                                        >
                                                            🗑️ حذف
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* العملات */}
                        {activeTab === 'currencies' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border dark:border-gray-700">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">💱 العملات</h2>

                                {/* إضافة عملة جديدة */}
                                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">➕ إضافة عملة جديدة</h3>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newCurrency}
                                            onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
                                            placeholder="رمز العملة (مثال: EGP, USD, AED...)"
                                            maxLength="3"
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase dark:bg-gray-700 dark:text-white"
                                        />
                                        <button
                                            onClick={handleAddCurrency}
                                            disabled={loading}
                                            className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 transition"
                                        >
                                            ✅ إضافة
                                        </button>
                                    </div>
                                </div>

                                {/* قائمة العملات */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">العملات المتوفرة:</h3>
                                    {settings.currencies.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد عملات</p>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {settings.currencies.map(currency => (
                                                <div
                                                    key={currency}
                                                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition"
                                                >
                                                    <span className="text-gray-900 dark:text-white font-bold">💱 {currency}</span>
                                                    <button
                                                        onClick={() => handleDeleteCurrency(currency)}
                                                        disabled={loading}
                                                        className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50 transition"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
