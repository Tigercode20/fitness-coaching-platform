/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class', // استخدام class mode للتحكم اليدوي
    theme: {
        extend: {
            colors: {
                // Colors اللي كنا نستخدمها
                primary: {
                    DEFAULT: '#208d9d', // تيل
                    light: '#2ba8b7',
                    dark: '#1a6d7a',
                    50: '#f0f9fb',
                    500: '#208d9d',
                    600: '#1a7a8a',
                },
                secondary: {
                    DEFAULT: '#f4e5d3',
                    light: '#f9f3eb',
                    dark: '#d4c5b3',
                },
                dark: {
                    DEFAULT: '#1a1a1a',
                    light: '#2a2a2a',
                    lighter: '#3a3a3a',
                },
                danger: '#c02f2f',
                success: '#22c55e',
                warning: '#f59e0b',
                info: '#0ea5e9',
            },
            backgroundColor: {
                light: '#faf8f3',
                surface: '#ffffff',
            },
            textColor: {
                light: '#f5f5f5',
                dark: '#1a1a1a',
            },
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
                'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #208d9d 0%, #2ba8b7 100%)',
                'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            },
            animation: {
                'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin': 'spin 1s linear infinite',
                'bounce': 'bounce 1s infinite',
                'slideIn': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                slideIn: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
            screens: {
                'xs': '320px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            },
        },
    },
    plugins: [
        // Plugin لتحسين Dark Mode
        function ({ addBase, theme }) {
            addBase({
                'html': {
                    '@apply bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300': {},
                },
                'body': {
                    '@apply bg-white dark:bg-gray-950': {},
                },
            })
        },
    ],
}
