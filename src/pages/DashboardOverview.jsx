
import { useState, useEffect } from 'react'
import { getAllClients } from '../services/clientService'
import { getSalesBy } from '../services/salesService'
import { getSettings } from '../services/settingsService'
import { Link } from 'react-router-dom'
import EditClientModal from '../components/Modals/EditClientModal'
import ClientDetailsModal from '../components/Modals/ClientDetailsModal'

export default function DashboardOverview() {
    const [clients, setClients] = useState([])
    const [sales, setSales] = useState([])
    const [businessInfo, setBusinessInfo] = useState({ name: 'Fitness Coaching', logo: '' })
    const [settings, setSettings] = useState({ primaryCurrency: 'EGP', currencies: [] })
    const [editingClient, setEditingClient] = useState(null)
    const [viewingClient, setViewingClient] = useState(null)
    const [actionClient, setActionClient] = useState(null) // Client selected for action choice
    const [stats, setStats] = useState({
        totalClients: 0,
        totalSubscriptions: 0,
        thisMonthSubscriptions: 0,
        totalRevenue: 0,
        avgDuration: 0
    })

    useEffect(() => {
        loadAllData()
        // تحديث البيانات كل 5 ثواني
        const interval = setInterval(loadAllData, 5000)
        return () => clearInterval(interval)
    }, [])

    const loadAllData = async () => {
        try {
            // 1. جلب البيانات الأساسية
            const clientsList = await getAllClients()
            const recentClients = clientsList
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
            setClients(recentClients)

            // 2. جلب المبيعات
            const salesList = await getSalesBy()
            const recentSales = salesList.slice(0, 5)
            setSales(recentSales)

            // 3. جلب الإعدادات (باستخدام getSettings للحصول على العملات)
            const appSettings = await getSettings()
            setBusinessInfo({
                name: appSettings.businessName,
                logo: appSettings.businessLogoUrl
            })
            setSettings({
                primaryCurrency: appSettings.primaryCurrency,
                currencies: appSettings.currencies
            })

            // 4. حساب الإحصائيات من البيانات الحقيقية
            const now = new Date()
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

            // المبيعات من هذا الشهر
            const thisMonthSales = salesList.filter(sale => {
                const saleDate = new Date(sale.get('timestamp'))
                return saleDate >= firstDayOfMonth
            })

            // حساب الإيرادات مع مراعاة فرق العملة
            const totalRevenue = salesList.reduce((sum, sale) => {
                const amount = parseFloat(sale.get('amountPaid')) || 0
                const currencyCode = sale.get('currency') || 'EGP' // افتراض الجنيه في حالة عدم التحديد

                // البحث عن سعر الصرف للعملة المستخدمة
                // العملات المخزنة في الإعدادات قد تكون سلاسل نصية (قديم) أو كائنات (جديد)
                // getSettings في الخدمة يتولى توحيدها إلى كائنات، لكن نتحقق للأمان
                let rate = 1

                if (appSettings.currencies && Array.isArray(appSettings.currencies)) {
                    const currencySetting = appSettings.currencies.find(c => c.code === currencyCode)
                    if (currencySetting) {
                        rate = parseFloat(currencySetting.rate) || 1
                    }
                }

                return sum + (amount * rate)
            }, 0)

            const totalDuration = salesList.reduce((sum, sale) => sum + (parseInt(sale.get('duration')) || 0), 0)
            const avgDur = salesList.length > 0 ? (totalDuration / salesList.length).toFixed(1) : 0

            setStats({
                totalClients: clientsList.length,
                totalSubscriptions: salesList.length,
                thisMonthSubscriptions: thisMonthSales.length,
                totalRevenue: totalRevenue.toFixed(2),
                avgDuration: avgDur
            })
        } catch (error) {
            console.error('❌ خطأ في تحميل البيانات:', error)
        }
    }

    return (
        <div className="min-h-screen transition-colors bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* الرأس */}
                <div className="mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {businessInfo.logo && (
                            <img
                                src={businessInfo.logo}
                                alt="Logo"
                                className="h-16 w-16 rounded-lg object-cover border-2 border-blue-500"
                            />
                        )}
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                🏠 {businessInfo.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                إدارة شاملة لعملائك واشتراكاتك ومبيعاتك
                            </p>
                        </div>
                    </div>
                </div>

                {/* البطاقات الإحصائية */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {/* إجمالي العملاء */}
                    <div className="rounded-lg shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    👥 إجمالي العملاء
                                </p>
                                <p className="text-5xl font-bold mt-2 text-blue-500">
                                    {stats.totalClients}
                                </p>
                            </div>
                            <span className="text-4xl">👥</span>
                        </div>
                        <p className="text-sm mt-4 text-blue-600 dark:text-gray-500">
                            عدد العملاء المسجلين
                        </p>
                    </div>

                    {/* إجمالي الاشتراكات */}
                    <div className="rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    📋 إجمالي الاشتراكات
                                </p>
                                <p className="text-5xl font-bold mt-2 text-green-500">
                                    {stats.totalSubscriptions}
                                </p>
                            </div>
                            <span className="text-4xl">📋</span>
                        </div>
                        <p className="text-sm mt-4 text-green-600 dark:text-gray-500">
                            عدد الاشتراكات المنشأة
                        </p>
                    </div>

                    {/* اشتراكات هذا الشهر */}
                    <div className="rounded-lg shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    📅 هذا الشهر
                                </p>
                                <p className="text-5xl font-bold mt-2 text-orange-500">
                                    {stats.thisMonthSubscriptions}
                                </p>
                            </div>
                            <span className="text-4xl">📅</span>
                        </div>
                        <p className="text-sm mt-4 text-orange-600 dark:text-gray-500">
                            اشتراكات شهر الحالي
                        </p>
                    </div>

                    {/* إجمالي الإيرادات */}
                    <div className="rounded-lg shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    💰 الإيرادات
                                </p>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <p className={`font-bold text-purple-500 ${stats.totalRevenue.length > 7 ? 'text-2xl' : stats.totalRevenue.length > 5 ? 'text-3xl' : 'text-4xl'}`}>
                                        {parseFloat(stats.totalRevenue) > 10000
                                            ? Math.floor(parseFloat(stats.totalRevenue))
                                            : stats.totalRevenue}
                                        {parseFloat(stats.totalRevenue) > 10000 && <span className="text-sm">.00</span>}
                                    </p>
                                    <span className="text-lg font-bold text-purple-400">
                                        {settings.primaryCurrency}
                                    </span>
                                </div>
                            </div>
                            <span className="text-4xl">💰</span>
                        </div>
                        <p className="text-sm mt-4 text-purple-600 dark:text-gray-500">
                            من جميع الاشتراكات
                        </p>
                    </div>

                    {/* متوسط المدة */}
                    <div className="rounded-lg shadow-lg p-6 border-l-4 border-cyan-500 hover:shadow-xl transition bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    ⌛ متوسط المدة
                                </p>
                                <p className="text-5xl font-bold mt-2 text-cyan-500">
                                    {stats.avgDuration}
                                </p>
                            </div>
                            <span className="text-4xl">⌛</span>
                        </div>
                        <p className="text-sm mt-4 text-cyan-600 dark:text-gray-500">
                            عدد الشهور
                        </p>
                    </div>
                </div>

                {/* إجراءات سريعة */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Link to="/new-client" className="p-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition flex flex-col items-center gap-2 text-center group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">➕</span>
                        <span className="font-bold">عميل جديد</span>
                    </Link>
                    <Link to="/training-plan" className="p-4 bg-orange-500 text-white rounded-xl shadow-lg hover:bg-orange-600 transition flex flex-col items-center gap-2 text-center group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">📄</span>
                        <span className="font-bold">إنشاء خطة</span>
                    </Link>
                    <Link to="/training-follow-up" className="p-4 bg-cyan-600 text-white rounded-xl shadow-lg hover:bg-cyan-700 transition flex flex-col items-center gap-2 text-center group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">📅</span>
                        <span className="font-bold">متابعة الخطط</span>
                    </Link>
                    <Link to="/sales" className="p-4 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition flex flex-col items-center gap-2 text-center group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">💰</span>
                        <span className="font-bold">إضافة مبيعة</span>
                    </Link>
                </div>

                {/* الأقسام الرئيسية */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* العملاء الأخيرين */}
                    <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition bg-white dark:bg-gray-800 flex flex-col h-[450px]">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h2 className="text-2xl font-bold">👥 العملاء الأخيرين</h2>
                            <Link
                                to="/clients"
                                className="text-blue-500 font-semibold hover:text-blue-700 transition"
                            >
                                عرض الكل →
                            </Link>
                        </div>

                        {clients.length === 0 ? (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                                لا يوجد عملاء حتى الآن
                            </p>
                        ) : (
                            <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                {clients.slice(0, 10).map(client => (
                                    <div
                                        key={client.id}
                                        onClick={() => setActionClient(client)}
                                        className="p-4 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg group-hover:text-blue-500 transition-colors">{client.fullName || client.FullName}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    📧 {client.email || client.Email}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    🔢 {client.phone || client.Phone}
                                                </p>
                                            </div>
                                            <span className="text-xs px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                🆔 {client.code || client.ClientCode}
                                            </span>
                                        </div>
                                        <p className="text-xs mt-2 text-gray-500 dark:text-gray-500">
                                            📅 {new Date(client.createdAt).toLocaleString('ar-EG')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                            <Link
                                to="/clients"
                                className="w-full inline-block text-center bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                            >
                                👁️ عرض جميع العملاء
                            </Link>
                        </div>
                    </div>

                    {/* الاشتراكات الحديثة */}
                    <div className="rounded-lg shadow-lg p-6 hover:shadow-xl transition bg-white dark:bg-gray-800 flex flex-col h-[450px]">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h2 className="text-2xl font-bold">📋 الاشتراكات الحديثة</h2>
                            <Link
                                to="/subscriptions"
                                className="text-green-500 font-semibold hover:text-green-700 transition"
                            >
                                عرض الكل →
                            </Link>
                        </div>

                        {sales.filter(s => (new Date() - new Date(s.get('timestamp'))) / 86400000 <= 15).length === 0 ? (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                                لا توجد اشتراكات في آخر 15 يوم
                            </p>
                        ) : (
                            <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                {sales.filter(s => (new Date() - new Date(s.get('timestamp'))) / 86400000 <= 15).map(sale => (
                                    <div
                                        key={sale.id}
                                        className="p-4 rounded-lg border-l-4 border-green-500 hover:shadow-md transition bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg">{sale.get('clientName')}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    💵 {sale.get('amountPaid')} {sale.get('currency')}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    📦 {sale.get('package')}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${sale.get('subscriptionType') === 'new'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                }`}>
                                                {sale.get('subscriptionType') === 'new' ? '✨ جديد' : '🔄 تجديد'}
                                            </span>
                                        </div>
                                        <p className="text-xs mt-2 text-gray-500 dark:text-gray-500">
                                            ⏰ {new Date(sale.get('timestamp')).toLocaleString('ar-EG')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                            <Link
                                to="/subscriptions"
                                className="w-full inline-block text-center bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
                            >
                                📊 عرض جميع الاشتراكات
                            </Link>
                        </div>
                    </div>
                </div>

                {/* أزرار الإجراءات السريعة */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                        to="/new-client"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition text-center"
                    >
                        <span className="text-4xl block mb-4">➕</span>
                        <h3 className="text-xl font-bold">إضافة عميل جديد</h3>
                        <p className="text-blue-100 text-sm mt-2">انقر لإضافة عميل جديد</p>
                    </Link>

                    <Link
                        to="/sales"
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition text-center"
                    >
                        <span className="text-4xl block mb-4">📊</span>
                        <h3 className="text-xl font-bold">تسجيل مبيعة جديدة</h3>
                        <p className="text-green-100 text-sm mt-2">انقر لإضافة اشتراك جديد</p>
                    </Link>

                    <Link
                        to="/settings"
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition text-center"
                    >
                        <span className="text-4xl block mb-4">⚙️</span>
                        <h3 className="text-xl font-bold">الإعدادات</h3>
                        <p className="text-purple-100 text-sm mt-2">انقر لتخصيص النظام</p>
                    </Link>
                </div>
            </div>
            {/* Client Details Modal (View Only) */}
            <ClientDetailsModal
                client={viewingClient}
                isOpen={!!viewingClient}
                onClose={() => setViewingClient(null)}
            />

            {/* Action Selection Modal (View or Edit) */}
            {actionClient && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl w-full max-w-sm border dark:border-gray-700 transform transition-all scale-100">
                        <h3 className="text-xl font-bold mb-6 text-center dark:text-white">
                            ماذا تريد أن تفعل مع <span className="text-blue-500">{actionClient.fullName || actionClient.FullName}</span>؟
                        </h3>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setViewingClient(actionClient)
                                    setActionClient(null)
                                }}
                                className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">👁️</span> عرض التفاصيل
                            </button>
                            <button
                                onClick={() => {
                                    setEditingClient(actionClient)
                                    setActionClient(null)
                                }}
                                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">✏️</span> تعديل البيانات
                            </button>
                            <button
                                onClick={() => setActionClient(null)}
                                className="w-full py-2 px-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition mt-2"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Client Modal */}
            <EditClientModal
                client={editingClient}
                isOpen={!!editingClient}
                onClose={() => setEditingClient(null)}
                onUpdate={(updatedClient) => {
                    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c))
                }}
            />
        </div>
    )
}
