// ============================================
// src/App.jsx
// Main Application Component
// ============================================

import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthChange } from './services/authService'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ClientForm from './pages/ClientForm'
import DashboardLayout from './components/Layout/DashboardLayout'
import DashboardOverview from './pages/DashboardOverview'
import FormsPage from './pages/FormsPage'
import ClientsPage from './pages/ClientsPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import ReportsPage from './pages/ReportsPage'
import NewClientPage from './pages/NewClientPage'
import SalesPage from './pages/SalesPage'
import TrainingPlanPage from './pages/TrainingPlanPage'
import ClientUpdatePage from './pages/ClientUpdatePage'
import PublicFormsPage from './pages/PublicFormsPage' // Import new page
import Settings from './pages/Settings' // Import Settings Page
import NotFound from './components/Common/NotFound'
import Loading from './components/Common/Loading'

function App() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser) => {
            setUser(currentUser)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    if (loading) {
        return <Loading />
    }

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

                {/* Public Client Form Route */}
                <Route path="/client-form" element={<ClientForm />} />

                {/* Protected Dashboard Routes */}
                <Route element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
                    <Route path="/dashboard" element={<DashboardOverview />} />

                    {/* Main Sections */}
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/subscriptions" element={<SubscriptionsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />

                    {/* Form Pages */}
                    <Route path="/new-client" element={<NewClientPage />} />
                    <Route path="/sales" element={<SalesPage />} />
                    <Route path="/training-plan" element={<TrainingPlanPage />} />
                    <Route path="/client-update" element={<ClientUpdatePage />} />
                    <Route path="/public-forms" element={<PublicFormsPage />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* Legacy/Other */}
                    <Route path="/forms" element={<FormsPage />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    )
}

export default App
