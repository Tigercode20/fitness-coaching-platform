// ============================================
// src/pages/DashboardOverview.jsx
// Dashboard Home (Stats & Overview) - Live Data
// ============================================

import { useState, useEffect } from 'react'
import { FaUsers, FaCreditCard, FaClipboardList, FaChartLine } from 'react-icons/fa'
import { getAllClients } from '../services/clientService'
import { getAllSubscriptions } from '../services/subscriptionService'
import { getPendingForms } from '../services/pendingFormService'

export default function DashboardOverview() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        clientsCount: 0,
        activeSubsCount: 0,
        pendingFormsCount: 0,
        revenue: 0
    })
    const [recentClients, setRecentClients] = useState([])
    const [recentSubs, setRecentSubs] = useState([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [clients, subs, pending] = await Promise.all([
                getAllClients(),
                getAllSubscriptions(),
                getPendingForms()
            ])

            // Calculate Stats
            const clientsCount = clients.length
            const activeSubsCount = subs.filter(s => s.status === 'active' || s.Status === 'Active').length
            const pendingFormsCount = pending.filter(p => p.status === 'pending').length

            // Calculate Revenue (Simple sum of price field)
            const revenue = subs.reduce((total, sub) => {
                const price = parseFloat(sub.price || sub.Price || 0)
                return total + (isNaN(price) ? 0 : price)
            }, 0)

            setStats({
                clientsCount,
                activeSubsCount,
                pendingFormsCount,
                revenue
            })

            // Recent Activity (Top 5)
            setRecentClients(clients.slice(0, 5))
            setRecentSubs(subs.slice(0, 5))

        } catch (error) {
            console.error("Error loading dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            icon: FaUsers,
            label: 'العملاء',
            value: stats.clientsCount,
            color: 'text-blue-500'
        },
        {
            icon: FaCreditCard,
            label: 'الاشتراكات النشطة',
            value: stats.activeSubsCount,
            color: 'text-green-500'
        },
        {
            icon: FaClipboardList,
            label: 'الفورمات المعلقة',
            value: stats.pendingFormsCount,
            color: 'text-orange-500'
        },
        {
            icon: FaChartLine,
            label: 'الإيرادات',
            value: `${stats.revenue.toLocaleString()} EGP`,
            color: 'text-purple-500'
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin text-4xl text-primary">⏳</div>
            </div>
        )
    }

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
                {statCards.map((stat, index) => {
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
                    <h3 className="text-xl font-semibold text-dark dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
                        العملاء الأخيرين
                    </h3>
                    <div className="space-y-3">
                        {recentClients.length > 0 ? (
                            recentClients.map(client => (
                                <div key={client.id} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-0">
                                    <span className="text-gray-800 dark:text-gray-200">{client.FullName || client.fullName || 'بدون اسم'}</span>
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">{client.ClientCode || '-'}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">لا توجد بيانات</p>
                        )}
                    </div>
                </div>

                {/* Recent Subscriptions */}
                <div className="card bg-white dark:bg-gray-800 shadow-sm dark:shadow-none border dark:border-gray-700 transition-colors duration-300 p-6">
                    <h3 className="text-xl font-semibold text-dark dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
                        الاشتراكات الحديثة
                    </h3>
                    <div className="space-y-3">
                        {recentSubs.length > 0 ? (
                            recentSubs.map(sub => (
                                <div key={sub.id} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-0">
                                    <div>
                                        <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">{sub.clientName || 'مشترك'}</p>
                                        <p className="text-xs text-gray-400">{sub.package || 'باقة'}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {sub.status || '-'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">لا توجد بيانات</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
