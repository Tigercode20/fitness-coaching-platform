import { useState, useEffect } from 'react'
import { getSalesBy, createSale } from '../services/salesService'
import { getAllClients } from '../services/clientService'
import { FaSpinner } from 'react-icons/fa' // Using icons if available, or simple text

// Simple Toast replacement if react-toastify is not installed/configured globally yet
const toast = {
    success: (msg) => alert(`✅ ${msg}`),
    error: (msg) => alert(`❌ ${msg}`)
}

export default function SalesPage() {
    const [clients, setClients] = useState([])
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedClientCode, setSelectedClientCode] = useState('')
    const [selectedClient, setSelectedClient] = useState(null)

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

    // تحميل العملاء عند الفتح
    useEffect(() => {
        loadClients()
        loadSales()
    }, [])

    const loadClients = async () => {
        try {
            const clientsList = await getAllClients()
            // ترتيب الأكواد من الأحدث للأقدم
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
            // Note: Parse objects need .get() usually, but our service might return mapped objects.
            // Let's assume the service returns mapped objects OR Parse objects.
            // Logic for Parse Object: c.get('code') or c.attributes.code
            // Logic for Mapped Object: c.ClientCode or c.code

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

            // إعادة تعيين النموذج
            setFormData({
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

                                            // Only show clients with codes
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
                                                <p>{selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleString('ar-EG') : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. نوع الاشتراك */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        🚧 نوع الاشتراك
                                    </label>
                                    <div className="space-y-2 text-gray-700 dark:text-gray-300">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="subscriptionType"
                                                value="new"
                                                checked={formData.subscriptionType === 'new'}
                                                onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })}
                                                className="mr-3 text-blue-600 focus:ring-blue-500"
                                            />
                                            جديد
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="subscriptionType"
                                                value="renewal"
                                                checked={formData.subscriptionType === 'renewal'}
                                                onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })}
                                                className="mr-3 text-blue-600 focus:ring-blue-500"
                                            />
                                            تجديد
                                        </label>
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
                                            <option value="EGP">EGP - الجنيه المصري</option>
                                            <option value="USD">USD - الدولار</option>
                                            <option value="AED">AED - الدرهم الإماراتي</option>
                                            <option value="SAR">SAR - الريال السعودي</option>
                                            <option value="KWD">KWD - الدينار الكويتي</option>
                                            <option value="EUR">EUR - اليورو</option>
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
                                        <option value="vodafon">Vodafon</option>
                                        <option value="fawry">Fawry</option>
                                        <option value="free">FREE</option>
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
                                        <option value="basic">Gold</option>
                                        <option value="standard">Varialiv</option>
                                        <option value="premium">VIP</option>
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
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {new Date(sale.createdAt).toLocaleString('ar-EG')}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
