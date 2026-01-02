// ============================================
// src/components/Layout/Header.jsx
// Header Component with Dark Mode Support
// ============================================

import { Link, useNavigate } from 'react-router-dom'
import { FaSignOutAlt, FaUser, FaBars, FaTimes } from 'react-icons/fa'
import { logOut } from '../../services/authService'
import { useState } from 'react'
import ThemeToggle from '../Common/ThemeToggle'

export default function Header({ user, onMenuClick }) {
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await logOut()
            navigate('/')
        } catch (err) {
            console.error('Logout error:', err)
        }
    }

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-2xl">💪</span>
                        <span className="text-xl font-bold text-primary hidden sm:inline">المدرب</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg 
                  hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                <FaUser className="text-primary" />
                                <span className="font-semibold text-dark dark:text-gray-200 hidden sm:inline">
                                    {user?.email?.split('@')[0]}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            {menuOpen && (
                                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 
                  rounded-lg shadow-lg z-50 transition-colors duration-300">
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 
                      dark:hover:bg-gray-700 w-full text-right transition-colors duration-200"
                                    >
                                        <span className="dark:text-gray-200">لوحة التحكم</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 
                      dark:hover:bg-gray-700 w-full text-right text-danger 
                      dark:text-red-400 transition-colors duration-200"
                                    >
                                        <FaSignOutAlt />
                                        <span>تسجيل الخروج</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-2">
                        <ThemeToggle />
                        <button
                            onClick={() => {
                                if (onMenuClick) onMenuClick() // Open sidebar
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                transition-colors duration-200"
                        >
                            <FaBars className="text-dark dark:text-gray-200" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 
            transition-colors duration-300">
                        <div className="space-y-2">
                            <Link
                                to="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 
                  rounded-lg dark:text-gray-200 transition-colors duration-200"
                            >
                                لوحة التحكم
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout()
                                    setMobileMenuOpen(false)
                                }}
                                className="block w-full text-right px-4 py-2 hover:bg-gray-100 
                  dark:hover:bg-gray-800 rounded-lg text-danger dark:text-red-400 
                  transition-colors duration-200"
                            >
                                تسجيل الخروج
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
