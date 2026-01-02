// ============================================
// src/pages/DashboardOverview.jsx
// Dashboard Home (Stats & Overview)
// ============================================

import { FaUsers, FaCreditCard, FaClipboardList, FaChartLine } from 'react-icons/fa'

export default function DashboardOverview() {
    const stats = [
        {
            icon: FaUsers,
            label: 'العملاء',
            value: '24',
            color: 'text-blue-500'
        },
        {
            icon: FaCreditCard,
            label: 'الاشتراكات النشطة',
            value: '18',
            color: 'text-green-500'
        },
        {
            icon: FaClipboardList,
            label: 'الفورمات المعلقة',
            value: '5',
            color: 'text-orange-500'
        },
        {
            icon: FaChartLine,
            label: 'الإيرادات',
            value: '2,500 EGP',
            color: 'text-purple-500'
        },
    ]

    return (
        <>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">
                    أهلاً بك! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    هنا يمكنك إدارة عملاؤك واشتراكاتهم والخطط الخاصة بهم
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="card bg-white dark:bg-gray-800 shadow-sm dark:shadow-none border dark:border-gray-700 transition-colors duration-300">
                            <div className="flex items-center justify-between p-6">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
                                    <p className="text-2xl font-bold text-dark dark:text-white mt-2">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`text-3xl ${stat.color}`}>
                                    <Icon />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Clients */}
                <div className="card bg-white dark:bg-gray-800 shadow-sm dark:shadow-none border dark:border-gray-700 transition-colors duration-300 p-6">
                    <h3 className="text-xl font-semibold text-dark dark:text-white mb-4">
                        العملاء الأخيرين
                    </h3>
                    <div className="space-y-3">
                        <p className="text-gray-600 text-center py-8">
                            لا توجد بيانات بعد
                        </p>
                    </div>
                </div>

                {/* Recent Subscriptions */}
                <div className="card bg-white dark:bg-gray-800 shadow-sm dark:shadow-none border dark:border-gray-700 transition-colors duration-300 p-6">
                    <h3 className="text-xl font-semibold text-dark dark:text-white mb-4">
                        الاشتراكات الحديثة
                    </h3>
                    <div className="space-y-3">
                        <p className="text-gray-600 text-center py-8">
                            لا توجد بيانات بعد
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
