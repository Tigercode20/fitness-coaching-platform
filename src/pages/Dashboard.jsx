// ============================================
// src/pages/Dashboard.jsx
// Main Dashboard Page
// ============================================

import { useState, useEffect } from 'react'
import { getCurrentUser } from '../services/authService'
import { getAllClients } from '../services/clientService'
import { getAllSubscriptions, getActiveSubscriptions } from '../services/subscriptionService'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import RecentActivity from '../components/Dashboard/RecentActivity'
import { FaUsers, FaCreditCard, FaClipboardList, FaChartLine } from 'react-icons/fa'

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        clients: 0,
        activeSubs: 0,
        revenue: 0,
        pendingForms: 0 // Placeholder until forms collection is standardized
    })
    const [recentClients, setRecentClients] = useState([])
    const [recentSubs, setRecentSubs] = useState([])

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const currentUser = getCurrentUser()
                if (currentUser) setUser(currentUser)

                // Fetch Data
                const clientsData = await getAllClients()
                const allSubsData = await getAllSubscriptions()
                const activeSubsData = await getActiveSubscriptions()

                // Calculate Stats
                const totalRevenue = allSubsData.reduce((sum, sub) => sum + (Number(sub.amountPaid) || Number(sub.PaymentAmount) || 0), 0)

                setStats({
                    clients: clientsData.length,
                    activeSubs: activeSubsData.length,
                    revenue: totalRevenue,
                    pendingForms: 0
                })

                // Set Recent Activity (First 5)
                setRecentClients(clientsData)
                setRecentSubs(allSubsData)

            } catch (error) {
                console.error("Error loading dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()
    }, [])

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>
    }

    const statCards = [
        {
            icon: FaUsers,
            label: 'العملاء',
            value: stats.clients,
            color: 'text-blue-500'
        },
        {
            icon: FaCreditCard,
            label: 'الاشتراكات النشطة',
            value: stats.activeSubs,
            color: 'text-green-500'
        },
        {
            icon: FaClipboardList,
            label: 'الفورمات المعلقة',
            value: stats.pendingForms,
            color: 'text-orange-500'
        },
        {
            icon: FaChartLine,
            label: 'الإيرادات',
            value: `${stats.revenue.toLocaleString()} EGP`,
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
                        <div className="mb-8 animate-fadeIn">
                            <h1 className="text-3xl font-bold text-dark mb-2">
                                أهلاً بك! 👋
                            </h1>
                            <p className="text-gray-600">
                                نظرة عامة على أداء عملك اليوم
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statCards.map((stat, index) => {
                                const Icon = stat.icon
                                return (
                                    <div key={index} className="card animate-slideUp" style={{ animationDelay: `${index * 100}ms` }}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-600 text-sm">{stat.label}</p>
                                                <p className="text-2xl font-bold text-dark mt-2">
                                                    {stat.value}
                                                </p>
                                            </div>
                                            <div className={`text-3xl ${stat.color} bg-opacity-10 p-3 rounded-full bg-current`}>
                                                <Icon />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Recent Activity */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <RecentActivity
                                title="العملاء الأخيرين"
                                data={recentClients}
                                type="client"
                            />
                            <RecentActivity
                                title="الاشتراكات الحديثة"
                                data={recentSubs}
                                type="subscription"
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
