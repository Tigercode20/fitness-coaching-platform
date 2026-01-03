
// ============================================
// src/components/Layout/Sidebar.jsx
// Updated: Fix Stats Logic
// ============================================

import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
    FaHome,
    FaUsers,
    FaPlus,
    FaDollarSign,
    FaFileAlt,
    FaClipboardList,
    FaChartBar,
    FaCog,
    FaLink,
    FaSignInAlt // Corrected Logout Icon if needed
} from 'react-icons/fa'
import { addFakeData, clearAllData } from '../../services/fakeDataUtils'

// Services are imported dynamically to avoid circular dependencies if any, 
// but standard import is better if no circular dependency exists.
import { getAllClients } from '../../services/clientService'
import { getPendingFormsCount } from '../../services/pendingFormService'
import { getSalesBy } from '../../services/salesService' // Import Sales Service

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation()

    // Stats State
    const [stats, setStats] = useState({
        clientsCount: 0,
        subscriptionsCount: 0,
        thisMonthCount: 0,
        pendingCount: 0
    })

    useEffect(() => {
        // دالة تحديث الإحصائيات
        const updateStats = async () => {
            try {
                // 1. Clients Count
                const clients = await getAllClients()
                const clientsCount = clients.length

                // 2. Pending Forms Count
                const pendingCount = await getPendingFormsCount()

                // 3. Subscriptions (Sales) Count
                // Note: getSalesBy returns Parse Objects.
                const sales = await getSalesBy()
                const subscriptionsCount = sales.length

                // 4. This Month Sales
                const now = new Date()
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

                const thisMonthSales = sales.filter(sale => {
                    const saleDate = new Date(sale.createdAt)
                    return saleDate >= startOfMonth
                })
                const thisMonthCount = thisMonthSales.length

                setStats({
                    clientsCount,
                    subscriptionsCount,
                    thisMonthCount,
                    pendingCount
                })
            } catch (e) {
                console.error('Error loading stats', e)
            }
        }

        updateStats()

        // Listen for events
        const handleUpdates = () => updateStats()
        window.addEventListener('clients-updated', handleUpdates)

        return () => {
            window.removeEventListener('clients-updated', handleUpdates)
        }
    }, [])

    const isActive = (path) => location.pathname === path

    const menuItems = [
        {
            icon: <FaHome />,
            label: 'الرئيسية',
            path: '/dashboard',
            color: 'text-blue-500'
        },
        {
            icon: <FaUsers />,
            label: 'العملاء',
            path: '/clients',
            color: 'text-green-500'
        },
        {
            icon: <FaPlus />,
            label: '➕ عميل جديد',
            path: '/new-client',
            color: 'text-emerald-500',
            badge: 'جديد'
        },
        {
            icon: <FaChartBar />,
            label: 'الاشتراكات',
            path: '/subscriptions',
            color: 'text-purple-500'
        },
        {
            icon: <FaDollarSign />,
            label: '💰 مبيعة جديدة',
            path: '/sales',
            color: 'text-yellow-500'
        },
        {
            icon: <FaFileAlt />,
            label: '📄 إنشاء خطط التدريب',
            path: '/training-plan',
            color: 'text-orange-500'
        },
        {
            icon: <FaClipboardList />,
            label: '📊 متابعة العميل',
            path: '/client-update',
            color: 'text-red-500'
        },
        {
            icon: <FaLink />,
            label: '🔗 روابط الفورمات',
            path: '/public-forms',
            color: 'text-indigo-500'
        },
        {
            icon: <FaCog />,
            label: 'الإعدادات',
            path: '/settings',
            color: 'text-gray-500'
        },
        {
            icon: <FaClipboardList />,
            label: '📋 الفورمات المعلقة',
            path: '/pending-forms',
            color: 'text-amber-500',
            badge: stats.pendingCount > 0 ? stats.pendingCount : null
        },
    ]

    return (
        <>
            {/* Overlay للموبايل */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 md:hidden z-30"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed md:relative top-0 right-0 h-screen w-64
          bg-white dark:bg-gray-900
          border-l border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0 z-40
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          overflow-y-auto
        `}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                        💪 المدرب
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        إدارة العملاء والبرامج
                    </p>
                </div>

                {/* Menu Items */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            onClick={onClose}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 group
                ${isActive(item.path)
                                    ? 'bg-primary/10 dark:bg-primary/20 text-primary border-r-4 border-primary'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }
              `}
                        >
                            {/* Icon */}
                            <div className={`text-xl ${item.color}`}>
                                {item.icon}
                            </div>

                            {/* Label */}
                            <div className="flex-1">
                                <span className="font-medium text-sm">
                                    {item.label}
                                </span>
                            </div>

                            {/* Badge */}
                            {item.badge && (
                                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Stats Section */}
                <div className="p-4 m-4 bg-gradient-to-br from-primary/10 to-primary/5
          dark:from-primary/20 dark:to-primary/10 rounded-lg border border-primary/20
          transition-colors duration-300">
                    <h3 className="font-semibold text-sm text-dark dark:text-white mb-3">
                        📊 إحصائيات سريعة
                    </h3>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">العملاء</span>
                            <span className="font-bold text-primary">{stats.clientsCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">الاشتراكات</span>
                            <span className="font-bold text-green-500">{stats.subscriptionsCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">هذا الشهر</span>
                            <span className="font-bold text-yellow-500">{stats.thisMonthCount}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
                    <Link
                        to="/logout"
                        className="flex items-center gap-2 text-red-500 hover:text-red-600
              px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30
              transition-colors duration-200"
                    >
                        <span>🚪</span>
                        <span className="text-sm font-medium">تسجيل الخروج</span>
                    </Link>

                    {/* Developer Tools */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={async () => {
                                    const success = await addFakeData(5);
                                    if (success) {
                                        window.dispatchEvent(new Event('clients-updated'));
                                        alert('✅ Added 5 Fake Clients & Subscriptions!');
                                    }
                                }}
                                className="px-2 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold rounded flex flex-col items-center justify-center transition"
                            >
                                ➕ بيانات
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm('Delete All Data?')) {
                                        const success = await clearAllData();
                                        if (success) {
                                            window.dispatchEvent(new Event('clients-updated'));
                                        }
                                    }
                                }}
                                className="px-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] rounded flex flex-col items-center justify-center transition"
                            >
                                🗑️ حذف
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
