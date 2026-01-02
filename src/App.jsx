// ============================================
// src/App.jsx
// Main Application Component with Error Boundary
// ============================================

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentUser, isAuthenticated, onAuthChange } from './services/authService'
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
import PublicFormsPage from './pages/PublicFormsPage'
import Settings from './pages/Settings'
import PendingFormsPage from './pages/PendingFormsPage'
import NotFound from './components/Common/NotFound'
import Loading from './components/Common/Loading'
import Parse, { isParseReady } from './services/back4app'

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('❌ Error caught by boundary:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full border border-red-200">
                        <h2 className="text-red-800 font-bold text-2xl mb-4 text-center">حدث خطأ غير متوقع</h2>
                        <div className="bg-red-100 p-4 rounded mb-6 overflow-auto max-h-40">
                            <p className="text-red-700 font-mono text-sm">{this.state.error?.message}</p>
                        </div>
                        <p className="text-gray-600 mb-6 text-center">
                            يرجى محاولة تحديث الصفحة، أو التأكد من إعدادات الاتصال.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-medium"
                        >
                            إعادة تحميل الصفحة
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

function App() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [initError, setInitError] = useState(null)

    useEffect(() => {
        let unsubscribe = () => { };

        const initApp = async () => {
            try {
                // Wait a brief moment to ensure Parse.initialize has fired in back4app.js
                if (!isParseReady()) {
                    console.log("⏳ Waiting for Parse to initialize...");
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                if (isAuthenticated()) {
                    const currentUser = getCurrentUser()
                    setUser(currentUser)
                }
            } catch (err) {
                console.error("❌ App Initialization Error:", err);
                setInitError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initApp();

        // Subscribe to auth changes
        unsubscribe = onAuthChange((currentUser) => {
            console.log("🔄 Auth State Changed:", currentUser?.get('email'));
            setUser(currentUser);
            setLoading(false);
        });

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        }
    }, [])

    if (loading) {
        return <Loading />
    }

    if (initError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">خطأ في النظام</h2>
                    <p className="text-red-600 mb-4">{initError}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        حاول مرة أخرى
                    </button>
                </div>
            </div>
        )
    }

    return (
        <ErrorBoundary>
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
                        <Route path="/pending-forms" element={<PendingFormsPage />} />

                        {/* Legacy/Other */}
                        <Route path="/forms" element={<FormsPage />} />
                    </Route>

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </ErrorBoundary>
    )
}

export default App
