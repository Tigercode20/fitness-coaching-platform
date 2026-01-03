
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Parse from '../services/back4app' // Corrected path based on project structure

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [settings, setSettings] = useState({
        businessName: 'Fitness Coaching',
        businessLogoUrl: '',
        receiveAccounts: ['Vodafon', 'Fawry', 'FREE'],
        packages: [
            { id: 'basic', name: 'Gold', description: 'الباقة الأساسية' },
            { id: 'standard', name: 'Varialiv', description: 'الباقة المتوسطة' },
            { id: 'premium', name: 'VIP', description: 'الباقة المتقدمة' }
        ],
        currencies: ['EGP', 'USD', 'AED', 'SAR', 'KWD', 'EUR']
    })

    const [formData, setFormData] = useState({
        businessName: 'Fitness Coaching',
        businessLogo: null,
        businessLogoPreview: ''
    })

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
                    businessName: result.get('businessName') || 'Fitness Coaching',
                    businessLogoUrl: result.get('businessLogoUrl') || '',
                    receiveAccounts: result.get('receiveAccounts') || ['Vodafon', 'Fawry', 'FREE'],
                    packages: result.get('packages') || [
                        { id: 'basic', name: 'Gold', description: 'الباقة الأساسية' },
                        { id: 'standard', name: 'Varialiv', description: 'الباقة المتوسطة' },
                        { id: 'premium', name: 'VIP', description: 'الباقة المتقدمة' }
                    ],
                    currencies: result.get('currencies') || ['EGP', 'USD', 'AED', 'SAR', 'KWD', 'EUR']
                }

                setSettings(data)
                setFormData({
                    businessName: data.businessName,
                    businessLogoPreview: data.businessLogoUrl,
                    businessLogo: null
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

            newSettings.set('businessName', 'Fitness Coaching')
            newSettings.set('receiveAccounts', ['Vodafon', 'Fawry', 'FREE'])
            newSettings.set('packages', [
                { id: 'basic', name: 'Gold', description: 'الباقة الأساسية' },
                { id: 'standard', name: 'Varialiv', description: 'الباقة المتوسطة' },
                { id: 'premium', name: 'VIP', description: 'الباقة المتقدمة' }
            ])
            newSettings.set('currencies', ['EGP', 'USD', 'AED', 'SAR', 'KWD', 'EUR'])

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

            settingsObj.set('businessName', formData.businessName)

            // رفع الصورة
            if (formData.businessLogo) {
                const parseFile = new Parse.File(formData.businessLogo.name, formData.businessLogo)
                await parseFile.save()
                settingsObj.set('businessLogoUrl', parseFile.url())
            }

            await settingsObj.save()
            toast.success('✅ تم حفظ البيانات بنجاح!')
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
                if (!currencies.includes(newCurrency.toUpperCase())) {
                    currencies.push(newCurrency.toUpperCase())
                    settingsObj.set('currencies', currencies)
                    await settingsObj.save()
                    toast.success('✅ تم إضافة العملة!')
                    setNewCurrency('')
                    loadSettings()
                } else {
                    toast.warning('⚠️ العملة موجودة')
                }
            }
        } catch (error) {
            toast.error('❌ فشل الإضافة')
        } finally {
            setLoading(false)
        }
    }

    // حذف عملة
    const handleDeleteCurrency = async (currency) => {
        if (!window.confirm(`حذف "${currency}"؟`)) return

        setLoading(true)
        try {
            const query = new Parse.Query('Settings')
            const settingsObj = await query.first()

            if (settingsObj) {
                const currencies = settingsObj.get('currencies') || []
                const filtered = currencies.filter(c => c !== currency)
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

    return (
        <div className={`min-h-screen transition-colors p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
            <div className="max-w-6xl mx-auto">
                {/* الرأس */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            ⚙️ الإعدادات
                        </h1>
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                            تخصيص النظام وإضافة البيانات
                        </p>
                    </div>

                    {/* زر Dark Mode */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`px-6 py-3 rounded-lg font-bold transition flex items-center gap-2 ${darkMode
                                ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                                : 'bg-gray-800 text-white hover:bg-gray-700'
                            }`}
                    >
                        {darkMode ? '☀️ النهار' : '🌙 الليل'}
                    </button>
                </div>

                {/* التبويبات والمحتوى */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* الجانب الأيسر - التبويبات */}
                    <div className="lg:col-span-1">
                        <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'
                            }`}>
                            {[
                                { id: 'general', label: '🏢 البيانات العامة' },
                                { id: 'accounts', label: '💳 الحسابات' },
                                { id: 'packages', label: '📦 الباقات' },
                                { id: 'currencies', label: '💱 العملات' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-right px-6 py-4 border-b transition ${activeTab === tab.id
                                            ? `bg-blue-500 text-white border-l-4 border-l-blue-700 font-bold`
                                            : `${darkMode ? 'text-gray-300 hover:bg-gray-700 border-gray-700' : 'text-gray-600 hover:bg-gray-50 border-gray-200'}`
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
                            <div className={`rounded-lg shadow-lg p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    🏢 البيانات العامة
                                </h2>

                                <div className="space-y-6">
                                    {/* اسم المشروع */}
                                    <div>
                                        <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            📝 اسم المشروع
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            className={`w-full px-4 py-3 rounded-lg border-2 transition ${darkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                                }`}
                                            placeholder="اسم المشروع"
                                        />
                                    </div>

                                    {/* اللوجو */}
                                    <div>
                                        <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            🎨 اللوجو
                                        </label>
                                        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition ${darkMode
                                                ? 'border-gray-600 hover:border-blue-500 bg-gray-700'
                                                : 'border-gray-300 hover:border-blue-500 bg-gray-50'
                                            }`}>
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
                                                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>اسحب أو اضغط</p>
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveGeneral}
                                        disabled={loading}
                                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 transition"
                                    >
                                        {loading ? 'جاري...' : '💾 حفظ'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* الحسابات */}
                        {activeTab === 'accounts' && (
                            <div className={`rounded-lg shadow-lg p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    💳 حسابات الاستقبال
                                </h2>

                                {/* إضافة */}
                                <div className={`mb-8 p-6 rounded-lg border-2 border-dashed ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                                    }`}>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newAccount}
                                            onChange={(e) => setNewAccount(e.target.value)}
                                            placeholder="Vodafon, Fawry..."
                                            className={`flex-1 px-4 py-2 rounded-lg border-2 ${darkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                }`}
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
                                            className={`flex justify-between items-center p-4 rounded-lg border-l-4 border-blue-500 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                                                }`}
                                        >
                                            <span className="font-bold">💳 {account}</span>
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
                            <div className={`rounded-lg shadow-lg p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    📦 الباقات
                                </h2>

                                {/* إضافة */}
                                <div className={`mb-8 p-6 rounded-lg border-2 border-dashed ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                                    }`}>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={newPackage.name}
                                            onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                                            placeholder="اسم الباقة"
                                            className={`w-full px-4 py-2 rounded-lg border-2 ${darkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                        />
                                        <textarea
                                            value={newPackage.description}
                                            onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                                            placeholder="الوصف"
                                            rows="2"
                                            className={`w-full px-4 py-2 rounded-lg border-2 ${darkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                }`}
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
                                            className={`p-4 rounded-lg border-l-4 border-purple-500 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg">📦 {pkg.name}</h4>
                                                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                        {activeTab === 'currencies' && (
                            <div className={`rounded-lg shadow-lg p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    💱 العملات
                                </h2>

                                {/* إضافة */}
                                <div className={`mb-8 p-6 rounded-lg border-2 border-dashed ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                                    }`}>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newCurrency}
                                            onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
                                            placeholder="EGP, USD..."
                                            maxLength="3"
                                            className={`flex-1 px-4 py-2 rounded-lg border-2 uppercase ${darkMode
                                                    ? 'bg-gray-600 border-gray-500 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                        />
                                        <button
                                            onClick={handleAddCurrency}
                                            disabled={loading}
                                            className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                                        >
                                            ✅ إضافة
                                        </button>
                                    </div>
                                </div>

                                {/* القائمة */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {settings.currencies.map(currency => (
                                        <div
                                            key={currency}
                                            className={`flex justify-between items-center p-3 rounded-lg border-l-4 border-cyan-500 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                                                }`}
                                        >
                                            <span className="font-bold">💱 {currency}</span>
                                            <button
                                                onClick={() => handleDeleteCurrency(currency)}
                                                disabled={loading}
                                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
