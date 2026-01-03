import { useState, useEffect } from 'react'
import { getAllClients } from '../services/clientService'
import { getSalesBy } from '../services/salesService'
import { getBusinessInfo } from '../services/settingsService'
import { Link } from 'react-router-dom'

export default function DashboardOverview() {
    const [clients, setClients] = useState([])
    const [sales, setSales] = useState([])
    const [stats, setStats] = useState({
        totalClients: 0,
        totalSubscriptions: 0,
        totalRevenue: 0,
        avgDuration: 0
    })
    const [businessInfo, setBusinessInfo] = useState({ name: 'لوحة التحكم الرئيسية', logo: '' })

    useEffect(() => {
        loadDashboardData()
        loadBusinessInfo()
    }, [])

    const loadBusinessInfo = async () => {
        try {
            const info = await getBusinessInfo()
            setBusinessInfo(info)
        } catch (error) {
            console.error('❌ خطأ في تحميل معلومات الشركة:', error)
        }
    }

    const loadDashboardData = async () => {
        try {
            // جلب العملاء
            const clientsList = await getAllClients()
            // clientsList contains objects: { id, FullName, Email, PhoneNumber, ClientCode, createdAt, ... }
            const recentClients = clientsList
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
            setClients(recentClients)

            // جلب المبيعات
            const salesList = await getSalesBy()
            // salesList contains Parse Objects: need .get()
            const recentSales = salesList.slice(0, 5)
            setSales(recentSales)

            // حساب الإحصائيات من البيانات الحقيقية
            const totalRevenue = salesList.reduce((sum, sale) => sum + (sale.get('amountPaid') || 0), 0)
            const totalDuration = salesList.reduce((sum, sale) => sum + (sale.get('duration') || 0), 0)
            const avgDur = salesList.length > 0 ? (totalDuration / salesList.length).toFixed(1) : 0

            setStats({
                totalClients: clientsList.length,
                totalSubscriptions: salesList.length,
                totalRevenue: totalRevenue.toFixed(2),
                avgDuration: avgDur
            })
        } catch (error) {
            console.error('❌ خطأ في تحميل البيانات:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* الرأس */}
                <div className="mb-8 flex items-center gap-4">
                    {businessInfo.logo && (
                        <img src={businessInfo.logo} alt="Logo" className="h-16 w-16 rounded-lg object-cover shadow-sm bg-white" />
                    )}
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            {businessInfo.name ? `🏠 ${businessInfo.name}` : '🏠 لوحة التحكم الرئيسية'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">إدارة شاملة لعملائك واشتراكاتك ومبيعاتك</p>
                    </div>
                </div>

                {/* البطاقات الإحصائية */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* إجمالي العملاء */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">👥 إجمالي العملاء</p>
                                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalClients}</p>
                            </div>
                            <span className="text-4xl">👥</span>
                        </div>
                        <p className="text-blue-600 dark:text-blue-400 text-sm mt-4">عدد العملاء المسجلين</p>
                    </div>

                    {/* إجمالي الاشتراكات */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">📋 إجمالي الاشتراكات</p>
                                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalSubscriptions}</p>
                            </div>
                            <span className="text-4xl">📋</span>
                        </div>
                        <p className="text-green-600 dark:text-green-400 text-sm mt-4">عدد الاشتراكات المنشأة</p>
                    </div>

                    {/* إجمالي الإيرادات */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">💰 إجمالي الإيرادات</p>
                                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalRevenue}</p>
                            </div>
                            <span className="text-4xl">💰</span>
                        </div>
                        <p className="text-purple-600 dark:text-purple-400 text-sm mt-4">من جميع الاشتراكات</p>
                    </div>

                    {/* متوسط المدة */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">⌛ متوسط المدة</p>
                                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.avgDuration}</p>
                            </div>
                            <span className="text-4xl">⌛</span>
                        </div>
                        <p className="text-orange-600 dark:text-orange-400 text-sm mt-4">عدد الشهور</p>
                    </div>
                </div>

                {/* الأقسام الرئيسية */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* العملاء الأخيرين */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">👥 العملاء الأخيرين</h2>
                            <Link
                                to="/clients"
                                className="text-blue-500 dark:text-blue-400 font-semibold hover:text-blue-700 transition"
                            >
                                عرض الكل →
                            </Link>
                        </div>

                        {clients.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا يوجد عملاء حتى الآن</p>
                        ) : (
                            <div className="space-y-4">
                                {clients.map(client => (
                                    <div key={client.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{client.FullName || 'بدون اسم'}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">📧 {client.Email}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">🔢 {client.PhoneNumber}</p>
                                            </div>
                                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full font-semibold">
                                                🆔 {client.ClientCode}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            📅 {new Date(client.createdAt).toLocaleString('ar-EG')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link
                            to="/clients"
                            className="mt-6 w-full inline-block text-center bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                        >
                            👁️ عرض جميع العملاء
                        </Link>
                    </div>

                    {/* الاشتراكات الحديثة */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📋 الاشتراكات الحديثة</h2>
                            <Link
                                to="/subscriptions"
                                className="text-green-500 dark:text-green-400 font-semibold hover:text-green-700 transition"
                            >
                                عرض الكل →
                            </Link>
                        </div>

                        {sales.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد اشتراكات حتى الآن</p>
                        ) : (
                            <div className="space-y-4">
                                {sales.map(sale => (
                                    <div key={sale.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{sale.get('clientName')}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">💵 {sale.get('amountPaid')} {sale.get('currency')}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">📦 {sale.get('package')}</p>
                                            </div>
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${sale.get('subscriptionType') === 'new'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                                }`}>
                                                {sale.get('subscriptionType') === 'new' ? '✨ جديد' : '🔄 تجديد'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            {/* Handle optional timestamp or fallback to createdAt */}
                                            ⏰ {sale.get('timestamp') ? new Date(sale.get('timestamp')).toLocaleString('ar-EG') : new Date(sale.createdAt).toLocaleString('ar-EG')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link
                            to="/subscriptions"
                            className="mt-6 w-full inline-block text-center bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
                        >
                            📊 عرض جميع الاشتراكات
                        </Link>
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
                        to="/subscriptions"
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition text-center"
                    >
                        <span className="text-4xl block mb-4">📋</span>
                        <h3 className="text-xl font-bold">عرض الاشتراكات</h3>
                        <p className="text-purple-100 text-sm mt-2">انقر لإدارة الاشتراكات</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
