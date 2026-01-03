import { useState, useEffect } from 'react'
import { getSalesBy, createSale } from '../services/salesService'
import { getAllClients } from '../services/clientService'
import { getSettings } from '../services/settingsService'
import { FaSpinner } from 'react-icons/fa'
import { toast } from 'react-toastify'

export default function SalesPage() {
    const [clients, setClients] = useState([])
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedClientCode, setSelectedClientCode] = useState('')
    const [selectedClient, setSelectedClient] = useState(null)
    const [settings, setSettings] = useState(null)

    // بيانات المبيعة
    const [formData, setFormData] = useState({
        email: '',
        subscriptionType: 'new',
        clientCode: '',
        clientName: '',
        phoneNumber: '',
        amountPaid: '',
        currency: 'EGP',
        receiveAccount: '',
        package: 'basic',
        startDate: new Date().toISOString().split('T')[0],
        duration: 1,
        bonusDuration: 0,
        screenshot: null,
        receiveTrainingPlan: false,
        notes: ''
    })

    // تحميل العملاء والإعدادات عند الفتح
    useEffect(() => {
        loadClients()
        loadSales()
        loadAppSettings()
    }, [])

    const loadAppSettings = async () => {
        try {
            const s = await getSettings()
            setSettings(s)
            // تحديث العملة والباقة الافتراضية إذا وجدت
            if (s.currencies && s.currencies.length > 0) {
                const first = s.currencies[0]
                const code = typeof first === 'object' ? first.code : first
                setFormData(prev => ({ ...prev, currency: code }))
            }
            if (s.packages && s.packages.length > 0) {
                setFormData(prev => ({ ...prev, package: s.packages[0].id }))
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل الإعدادات:', error)
        }
    }

    const loadClients = async () => {
        try {
            const clientsList = await getAllClients()
            // ترتيب الأكواد من الأحدث للأقدم
            // Assuming createdAt is ISO string or Date object
            const sorted = clientsList.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            )
            setClients(sorted)
        } catch (error) {
            console.error('❌ خطأ في جلب العملاء:', error)
            toast.error('فشل جلب بيانات العملاء')
        }
    }

    const loadSales = async () => {
        try {
            const salesList = await getSalesBy()
            setSales(salesList)
        } catch (error) {
            console.error('❌ خطأ في جلب المبيعات:', error)
        }
    }

    // عند اختيار كود العميل
    const handleClientCodeChange = (e) => {
        const code = e.target.value
        setSelectedClientCode(code)

        if (code) {
            // البحث عن العميل
            const client = clients.find(c => {
                const cCode = c.ClientCode || (c.get && c.get('ClientCode')) || (c.get && c.get('code'));
                return String(cCode) === String(code);
            })

            if (client) {
                setSelectedClient(client)

                // Extract Data
                const name = client.FullName || (client.get && client.get('FullName')) || (client.get && client.get('fullName')) || '';
                const email = client.Email || (client.get && client.get('Email')) || (client.get && client.get('email')) || '';
                const phone = client.PhoneNumber || (client.get && client.get('PhoneNumber')) || (client.get && client.get('phone')) || '';

                // ملء البيانات تلقائياً
                setFormData(prev => ({
                    ...prev,
                    clientCode: code,
                    clientName: name,
                    email: email,
                    phoneNumber: phone
                }))
            }
        } else {
            setSelectedClient(null)
            setFormData(prev => ({
                ...prev,
                clientCode: '',
                clientName: '',
                email: '',
                phoneNumber: ''
            }))
        }
    }

    // معالجة رفع الصورة
    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({
                ...prev,
                screenshot: file
            }))
        }
    }

    // تقديم النموذج
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createSale({
                ...formData,
                clientId: selectedClient?.id,
                timestamp: new Date().toISOString()
            })

            toast.success('تم حفظ المبيعة بنجاح!')

            // إعادة تعيين النموذج (مع الحفاظ على الإعدادات الافتراضية)
            setFormData(prev => ({
                email: '',
                subscriptionType: 'new',
                clientCode: '',
                clientName: '',
                phoneNumber: '',
                amountPaid: '',
                currency: settings?.currencies?.[0] || 'EGP',
                receiveAccount: '',
                package: settings?.packages?.[0]?.id || 'basic',
                startDate: new Date().toISOString().split('T')[0],
                duration: 1,
                bonusDuration: 0,
                screenshot: null,
                receiveTrainingPlan: false,
                notes: ''
            }))
            setSelectedClientCode('')
            setSelectedClient(null)

            loadSales()
        } catch (error) {
            console.error('❌ خطأ:', error)
            toast.error(`خطأ: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* الرأس */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">📊 إدارة المبيعات</h1>
                    <p className="text-gray-600 dark:text-gray-400">أضف مبيعة جديدة أو عرض المبيعات الحالية</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* النموذج */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">نموذج المبيعة الجديدة</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* 1. اختيار كود العميل */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        🔍 كود العميل
                                    </label>
                                    <select
                                        value={selectedClientCode}
                                        onChange={handleClientCodeChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">-- اختر كود العميل --</option>
                                        {clients.map(client => {
                                            const code = client.ClientCode || (client.get && client.get('ClientCode')) || (client.get && client.get('code'));
                                            const name = client.FullName || (client.get && client.get('FullName')) || (client.get && client.get('fullName'));
                                            const date = client.createdAt ? new Date(client.createdAt).toLocaleDateString('ar-EG') : 'N/A';

                                            if (!code) return null;

                                            return (
                                                <option key={client.id} value={code}>
                                                    {code} - {name} - {date}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* بيانات العميل المملوءة تلقائياً */}
                                {selectedClient && formData.clientName && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                                        <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">✅ بيانات العميل:</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                                            <div>
                                                <span className="font-semibold block">الاسم:</span>
                                                <p>{formData.clientName}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold block">البريد:</span>
                                                <p>{formData.email}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold block">الهاتف:</span>
                                                <p>{formData.phoneNumber}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold block">تسجيل البيانات:</span>
                                                <p>{selectedClient.createdAt ? new Date(selectedClient.createdAt).toISOString().split('T')[0] : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. نوع الاشتراك dynamic */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        🚧 نوع الاشتراك
                                    </label>
                                    <div className="space-y-2 text-gray-700 dark:text-gray-300">
                                        {settings?.subscriptionTypes?.map(type => (
                                            <label key={type.id} className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="subscriptionType"
                                                    value={type.id}
                                                    checked={formData.subscriptionType === type.id}
                                                    onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })}
                                                    className="mr-3 text-blue-600 focus:ring-blue-500"
                                                />
                                                {type.icon} {type.name}
                                            </label>
                                        )) || (
                                                // Fallback default
                                                <>
                                                    <label className="flex items-center cursor-pointer">
                                                        <input type="radio" name="subscriptionType" value="new" checked={formData.subscriptionType === 'new'} onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })} className="mr-3 text-blue-600 focus:ring-blue-500" />
                                                        ✨ جديد
                                                    </label>
                                                    <label className="flex items-center cursor-pointer">
                                                        <input type="radio" name="subscriptionType" value="renewal" checked={formData.subscriptionType === 'renewal'} onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })} className="mr-3 text-blue-600 focus:ring-blue-500" />
                                                        🔄 تجديد
                                                    </label>
                                                </>
                                            )}
                                    </div>
                                </div>

                                {/* 3. المبلغ المدفوع */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            💵 المبلغ المدفوع
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.amountPaid}
                                            onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="1000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            💲 العملة
                                        </label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            {settings?.currencies?.map(currency => {
                                                const code = typeof currency === 'object' ? currency.code : currency
                                                return <option key={code} value={code}>{code}</option>
                                            })}
                                            {(!settings?.currencies || settings.currencies.length === 0) && (
                                                <option value="EGP">EGP</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {/* 4. حساب الاستقبال */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        💳 حساب الاستقبال
                                    </label>
                                    <select
                                        value={formData.receiveAccount}
                                        onChange={(e) => setFormData({ ...formData, receiveAccount: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- اختر حساب الاستقبال --</option>
                                        {settings?.receiveAccounts?.map(account => (
                                            <option key={account} value={account}>{account}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 5. الباقة */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        📦 الباقة
                                    </label>
                                    <select
                                        value={formData.package}
                                        onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        {settings?.packages?.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 6. تاريخ البداية */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        📅 تاريخ البداية
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* 7. المدة والمدة الإضافية */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            ⌛ المدة (شهور)
                                        </label>
                                        <select
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="1">1 شهر</option>
                                            <option value="3">3 شهور</option>
                                            <option value="6">6 شهور</option>
                                            <option value="12">12 شهر</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            ➕ مدة إضافية مجانية (شهور)
                                        </label>
                                        <select
                                            value={formData.bonusDuration}
                                            onChange={(e) => setFormData({ ...formData, bonusDuration: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="0">لا توجد</option>
                                            <option value="1">1 شهر</option>
                                            <option value="2">2 شهر</option>
                                            <option value="3">3 شهور</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 8. الصورة */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        📸 لقطة شاشة لإيصال الدفع
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                    {formData.screenshot && (
                                        <p className="text-sm text-green-600 mt-2">✅ تم اختيار الصورة: {formData.screenshot.name}</p>
                                    )}
                                </div>

                                {/* 9. استقبال خطة التدريب */}
                                <div>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.receiveTrainingPlan}
                                            onChange={(e) => setFormData({ ...formData, receiveTrainingPlan: e.target.checked })}
                                            className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">📩 استقبال خطة التدريب</span>
                                    </label>
                                </div>

                                {/* 10. ملاحظات */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        📝 ملاحظات
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="أي ملاحظات إضافية..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 transition flex justify-center items-center gap-2"
                                >
                                    {loading && <FaSpinner className="animate-spin" />}
                                    {loading ? 'جاري الحفظ...' : '💾 حفظ المبيعة'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* قائمة المبيعات */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">آخر المبيعات</h2>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {sales.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد مبيعات حتى الآن</p>
                                ) : (
                                    sales.slice(0, 10).map(sale => (
                                        <div key={sale.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition">
                                            <p className="font-bold text-gray-900 dark:text-white">{sale.get('clientName')}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {sale.get('amountPaid')} {sale.get('currency')}
                                            </p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(sale.createdAt).toLocaleDateString('ar-EG')}
                                                </p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded ${sale.get('subscriptionType') === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {sale.get('subscriptionType') === 'new' ? 'جديد' : 'تجديد'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
