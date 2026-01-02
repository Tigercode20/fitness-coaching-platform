// ============================================
// src/components/Common/ThemeToggle.jsx
// زر تبديل الوضع الليلي/النهاري
// ============================================

import { FaMoon, FaSun } from 'react-icons/fa'
import useDarkMode from '../../hooks/useDarkMode'

export default function ThemeToggle() {
    const { isDark, toggle, mounted } = useDarkMode()

    if (!mounted) {
        return <div className="w-12 h-12" /> // placeholder
    }

    return (
        <button
            onClick={toggle}
            aria-label="تبديل الوضع الليلي"
            className="
        relative inline-flex items-center justify-center
        w-12 h-12 rounded-full
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900
      "
        >
            {/* Light Mode Icon */}
            <FaSun
                className={`
          absolute w-5 h-5 text-yellow-500
          transition-all duration-300 transform
          ${isDark ? 'opacity-0 scale-0 rotate-90' : 'opacity-100 scale-100 rotate-0'}
        `}
            />

            {/* Dark Mode Icon */}
            <FaMoon
                className={`
          absolute w-5 h-5 text-blue-400
          transition-all duration-300 transform
          ${isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90'}
        `}
            />
        </button>
    )
}
