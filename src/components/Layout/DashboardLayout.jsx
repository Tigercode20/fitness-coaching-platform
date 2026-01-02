// ============================================
// src/components/Layout/DashboardLayout.jsx
// Dashboard Layout Wrapper (Sidebar + Header + Content)
// ============================================

import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { getCurrentUser } from '../../services/authService'
import Header from './Header'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
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

    return (
        <div className="flex h-screen bg-light dark:bg-gray-900 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
