import { useState, useEffect } from 'react'
import { getSalesByClient, updateSale, deleteSale } from '../services/salesService'
import { getAllClients } from '../services/clientService'
import { getSettings } from '../services/settingsService'
import { toast } from 'react-toastify'
import Parse from '../services/back4app'

export default function SubscriptionsPage() {
    const [clients, setClients] = useState([])
    const [subscriptions, setSubscriptions] = useState([])
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editFormData, setEditFormData] = useState(null)
    const [settings, setSettings] = useState(null)
    const [expandedId, setExpandedId] = useState(null)

    useEffect(() => {
        loadClientsAndSubscriptions()
        loadAppSettings()
    }, [])

    const loadAppSettings = async () => {
        try {
            const s = await getSettings()
            setSettings(s)
        } catch (error) {
            console.error('❌ خطأ في تحميل الإعدادات:', error)
        }
    }

    const loadClientsAndSubscriptions = async () => {
        try {
            const clientsList = await getAllClients()
            setClients(clientsList)

            // جلب جميع الاشتراكات
            const query = new Parse.Query('Sale')
            query.descending('timestamp')
            query.limit(1000)
            const allSales = await query.find()

            setSubscriptions(allSales)
        } catch (error) {
            console.error('❌ خطأ:', error)
            toast.error('فشل جلب البيانات')
        }
    }

    // فتح نموذج التعديل
    const handleEdit = (subscription) => {
        setEditingId(subscription.id)
        setExpandedId(subscription.id) // Ensure it stays open
        setEditFormData({
            subscriptionType: subscription.get('subscriptionType'),
            amountPaid: subscription.get('amountPaid'),
            currency: subscription.get('currency'),
            receiveAccount: subscription.get('receiveAccount'),
            package: subscription.get('package'),
            startDate: subscription.get('startDate'),
            duration: subscription.get('duration'),
            bonusDuration: subscription.get('bonusDuration'),
            receiveTrainingPlan: subscription.get('receiveTrainingPlan'),
            notes: subscription.get('notes')
        })
    }

    // حفظ التعديلات
    const handleSave = async (subId) => {
        setLoading(true)
        try {
            await updateSale(subId, {
                ...editFormData,
                startDate: new Date(editFormData.startDate)
            })

            toast.success('✅ تم تحديث الاشتراك بنجاح!')
            setEditingId(null)
            setEditFormData(null)
            loadClientsAndSubscriptions()
        } catch (error) {
            console.error('❌ خطأ:', error)
            toast.error(`❌ خطأ: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    // حذف اشتراك
    const handleDelete = async (subId) => {
        if (window.confirm('هل تريد حقاً حذف هذا الاشتراك؟')) {
            setLoading(true)
            try {
                await deleteSale(subId)
                toast.success('✅ تم حذف الاشتراك!')
                loadClientsAndSubscriptions()
            } catch (error) {
                console.error('❌ خطأ:', error)
                toast.error('❌ فشل الحذف')
            } finally {
                setLoading(false)
            }
        }
    }

    // العثور على اسم العميل (Fallback)
    const getClientName = (clientId) => {
        const client = clients.find(c => c.id === clientId || c.objectId === clientId)
        return client ? client.FullName : 'غير معروف'
    }

    // حساب الحالة
    const calculateStatus = (sub) => {
        const start = new Date(sub.get('startDate') || sub.createdAt);
        const duration = parseInt(sub.get('duration') || 0);
        const bonus = parseInt(sub.get('bonusDuration') || 0);

        // حساب تاريخ الانتهاء
        const end = new Date(start);
        end.setMonth(end.getMonth() + duration + bonus);

        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return { text: 'منتهي', color: 'bg-red-500 text-white', dot: '🔴' };
        if (diffDays <= 10) return { text: 'قارب علي الانتهاء', color: 'bg-yellow-500 text-black', dot: '🟡' };
        return { text: 'نشط', color: 'bg-green-500 text-white', dot: '🟢' };
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">📋 إدارة الاشتراكات</h1>
                    <p className="text-gray-600 dark:text-gray-400">عرض وتعديل وحذف الاشتراكات</p>
                </div>

                {subscriptions.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد اشتراكات حتى الآن 📭</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {subscriptions.map(sub => {
                            const status = calculateStatus(sub);
                            const isExpanded = expandedId === sub.id || editingId === sub.id;
                            const isEditing = editingId === sub.id;

                            return (
                                <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border dark:border-gray-700 transition-all duration-300">
                                    {/* الشريط الأرق (Compact Header) */}
                                    <div
                                        onClick={() => !isEditing && setExpandedId(isExpanded ? null : sub.id)}
                                        className={`p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:from-blue-700 hover:to-blue-600 transition-all ${isExpanded ? 'shadow-inner' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <span className="bg-white/20 px-3 py-1 rounded text-sm font-mono">{sub.get('clientCode') || 'N/A'}</span>
                                            <h3 className="font-bold text-lg truncate min-w-[150px]">
                                                {sub.get('clientName') || getClientName(sub.get('clientId'))}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-lg ltr">
                                                {sub.get('amountPaid')} {sub.get('currency')}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${status.color}`}>
                                                {status.text}
                                            </span>
                                            <span className="text-white/70 transform transition-transform duration-300">
                                                {isExpanded ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body (Details or Edit Form) */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
                                            {isEditing ? (
                                                // نموذج التعديل
                                                <div className="p-6 space-y-4 bg-gray-50 dark:bg-gray-700/50">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-bold mb-2 dark:text-white">نوع الاشتراك</label>
                                                            <div className="flex flex-col gap-2">
                                                                {settings?.subscriptionTypes?.map(type => (
                                                                    <label key={type.id} className="flex items-center cursor-pointer dark:text-white">
                                                                        <input
                                                                            type="radio"
                                                                            name="subscriptionType"
                                                                            value={type.id}
                                                                            checked={editFormData.subscriptionType === type.id}
                                                                            onChange={(e) => setEditFormData({ ...editFormData, subscriptionType: e.target.value })}
                                                                            className="mr-2"
                                                                        />
                                                                        {type.icon} {type.name}
                                                                    </label>
                                                                )) || (
                                                                        <select
                                                                            value={editFormData.subscriptionType}
                                                                            onChange={(e) => setEditFormData({ ...editFormData, subscriptionType: e.target.value })}
                                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                                        >
                                                                            <option value="new">جديد</option>
                                                                            <option value="renewal">تجديد</option>
                                                                        </select>
                                                                    )}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-bold mb-2 dark:text-white">المبلغ</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={editFormData.amountPaid}
                                                                onChange={(e) => setEditFormData({ ...editFormData, amountPaid: parseFloat(e.target.value) })}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-bold mb-2 dark:text-white">العملة</label>
                                                            <select
                                                                value={editFormData.currency}
                                                                onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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

                                                        <div>
                                                            <label className="block text-sm font-bold mb-2 dark:text-white">حساب الاستقبال</label>
                                                            <select
                                                                value={editFormData.receiveAccount}
                                                                onChange={(e) => setEditFormData({ ...editFormData, receiveAccount: e.target.value })}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                            >
                                                                {settings?.receiveAccounts?.map(account => (
                                                                    <option key={account} value={account}>{account}</option>
                                                                ))}
                                                                {(!settings?.receiveAccounts || settings.receiveAccounts.length === 0) && (
                                                                    <option value="">N/A</option>
                                                                )}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-bold mb-2 dark:text-white">الباقة</label>
                                                            <select
                                                                value={editFormData.package}
                                                                onChange={(e) => setEditFormData({ ...editFormData, package: e.target.value })}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                            >
                                                                {settings?.packages?.map(pkg => (
                                                                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                                                                ))}
                                                                {(!settings?.packages || settings.packages.length === 0) && (
                                                                    <option value="basic">Gold</option>
                                                                )}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-bold mb-2 dark:text-white">المدة (شهور)</label>
                                                            <input
                                                                type="number"
                                                                value={editFormData.duration}
                                                                onChange={(e) => setEditFormData({ ...editFormData, duration: parseInt(e.target.value) })}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-bold mb-2 dark:text-white">المدة الإضافية المجانية</label>
                                                            <input
                                                                type="number"
                                                                value={editFormData.bonusDuration}
                                                                onChange={(e) => setEditFormData({ ...editFormData, bonusDuration: parseInt(e.target.value) })}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-bold mb-2 dark:text-white">تاريخ البداية</label>
                                                            <input
                                                                type="date"
                                                                value={
                                                                    editFormData.startDate instanceof Date
                                                                        ? editFormData.startDate.toISOString().split('T')[0]
                                                                        : editFormData.startDate
                                                                            ? new Date(editFormData.startDate).toISOString().split('T')[0]
                                                                            : ''
                                                                }
                                                                onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold mb-2 dark:text-white">الملاحظات</label>
                                                        <textarea
                                                            value={editFormData.notes}
                                                            onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                                            rows="3"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="flex gap-3 justify-end pt-4">
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(null)
                                                                setEditFormData(null)
                                                            }}
                                                            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white transition"
                                                        >
                                                            إلغاء
                                                        </button>
                                                        <button
                                                            onClick={() => handleSave(sub.id)}
                                                            disabled={loading}
                                                            className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition"
                                                        >
                                                            {loading ? 'جاري الحفظ...' : '💾 حفظ'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-6">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">📧 البريد الإلكتروني</p>
                                                            <p className="text-gray-900 dark:text-white font-bold truncate" title={sub.get('email')}>{sub.get('email')}</p>
                                                        </div>

                                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">🔢 الهاتف</p>
                                                            <p className="text-gray-900 dark:text-white font-bold text-lg">{sub.get('phoneNumber')}</p>
                                                        </div>

                                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">💳 حساب الاستقبال</p>
                                                            <p className="text-gray-900 dark:text-white font-bold text-lg">{sub.get('receiveAccount')}</p>
                                                        </div>

                                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">⌛ المدة</p>
                                                            <p className="text-gray-900 dark:text-white font-bold text-lg">{sub.get('duration')} شهور</p>
                                                        </div>

                                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">➕ إضافي</p>
                                                            <p className="text-gray-900 dark:text-white font-bold text-lg">{sub.get('bonusDuration')} شهور</p>
                                                        </div>

                                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">📅 تاريخ البداية</p>
                                                            <p className="text-gray-900 dark:text-white font-bold">{sub.get('startDate') ? new Date(sub.get('startDate')).toISOString().split('T')[0] : '-'}</p>
                                                        </div>

                                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">⏰ تم الاشتراك</p>
                                                            <span className="text-gray-900 dark:text-white font-bold text-sm">
                                                                {sub.get('timestamp') ? new Date(sub.get('timestamp')).toISOString().split('T')[0] :
                                                                    sub.createdAt ? new Date(sub.createdAt).toISOString().split('T')[0] : '-'}
                                                            </span>
                                                        </div>

                                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">📩 خطة التدريب</p>
                                                            <p className="text-gray-900 dark:text-white font-bold">{sub.get('receiveTrainingPlan') ? '✅ نعم' : '❌ لا'}</p>
                                                        </div>
                                                    </div>

                                                    {/* الملاحظات */}
                                                    {sub.get('notes') && (
                                                        <div className="px-6 py-4 bg-yellow-50 dark:bg-yellow-900/10 border-t border-gray-200 dark:border-gray-700 rounded-lg mb-4">
                                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📝 ملاحظات:</p>
                                                            <p className="text-gray-700 dark:text-gray-300">{sub.get('notes')}</p>
                                                        </div>
                                                    )}

                                                    {/* أزرار التحكم */}
                                                    <div className="flex justify-end gap-3 mt-4">
                                                        <button
                                                            onClick={() => toast.info('سيتم تفعيل هذه الميزة قريباً')}
                                                            className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition flex items-center gap-2"
                                                        >
                                                            📂 فتح سجل العميل
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(sub)}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
                                                        >
                                                            ✏️ تعديل
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(sub.id)}
                                                            disabled={loading}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            🗑️ حذف
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
