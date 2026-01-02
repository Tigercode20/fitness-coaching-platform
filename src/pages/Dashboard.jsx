// ============================================
// src/pages/Dashboard.jsx
// Main Dashboard Page
// ============================================

import { useState, useEffect } from 'react'
import { getCurrentUser } from '../services/authService'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import { FaUsers, FaCreditCard, FaClipboardList, FaChartLine } from 'react-icons/fa'

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (currentUser) {
            setUser(currentUser)
        }
        setLoading(false)
    }, [])

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>
    }

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
        <div className="flex h-screen bg-light">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header user={user} />

                {/* Content */}
                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Welcome Section */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-dark mb-2">
                                أهلاً بك! 👋
                            </h1>
                            <p className="text-gray-600">
                                هنا يمكنك إدارة عملاؤك واشتراكاتهم والخطط الخاصة بهم
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, index) => {
                                const Icon = stat.icon
                                return (
                                    <div key={index} className="card">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-600 text-sm">{stat.label}</p>
                                                <p className="text-2xl font-bold text-dark mt-2">
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
                            <div className="card">
                                <h3 className="text-xl font-semibold text-dark mb-4">
                                    العملاء الأخيرين
                                </h3>
                                <div className="space-y-3">
                                    <p className="text-gray-600 text-center py-8">
                                        لا توجد بيانات بعد
                                    </p>
                                </div>
                            </div>

                            {/* Recent Subscriptions */}
                            <div className="card">
                                <h3 className="text-xl font-semibold text-dark mb-4">
                                    الاشتراكات الحديثة
                                </h3>
                                <div className="space-y-3">
                                    <p className="text-gray-600 text-center py-8">
                                        لا توجد بيانات بعد
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
