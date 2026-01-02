// ============================================
// src/hooks/useDarkMode.js
// Dark Mode Hook - إدارة الوضع الليلي
// ============================================

import { useState, useEffect } from 'react'

export default function useDarkMode() {
    const [isDark, setIsDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // تحقق من تفضيل المستخدم المحفوظ
        const saved = localStorage.getItem('darkMode')

        if (saved !== null) {
            setIsDark(saved === 'true')
        } else {
            // استخدم تفضيل النظام
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            setIsDark(prefersDark)
        }
    }, [])

    useEffect(() => {
        if (!mounted) return

        const html = document.documentElement

        if (isDark) {
            html.classList.add('dark')
            html.setAttribute('data-color-scheme', 'dark')
            localStorage.setItem('darkMode', 'true')
        } else {
            html.classList.remove('dark')
            html.setAttribute('data-color-scheme', 'light')
            localStorage.setItem('darkMode', 'false')
        }
    }, [isDark, mounted])

    const toggle = () => setIsDark(!isDark)

    return { isDark, toggle, mounted }
}
