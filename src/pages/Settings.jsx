import { useState, useEffect } from 'react'
import useDarkMode from '../hooks/useDarkMode'

export default function Settings() {
    const { isDark, toggleDarkMode } = useDarkMode()

    // Load settings from localStorage or defaults
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('appSettings')
        return saved ? JSON.parse(saved) : {
            companyName: 'منصة التدريب الرياضي',
            email: 'coach@fitness.com',
            phone: '+20123456789',
            address: 'القاهرة، مصر',
            notifications: true,
            emailNotifications: true,
            language: 'ar'
        }
    })

    const [saved, setSaved] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSave = () => {
        localStorage.setItem('appSettings', JSON.stringify(settings))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className={`min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-primary">⚙️ الإعدادات</h1>

                {/* Dark Mode Toggle */}
                <div className={`p-6 rounded-xl mb-6 shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">الوضع الليلي</h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                تبديل المظهر بين الفاتح والداكن
                            </p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${isDark ? 'bg-primary' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${isDark ? 'translate-x-1' : 'translate-x-7'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Company Info */}
                <div className={`p-6 rounded-xl mb-6 shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        🏢 معلومات الشركة
                    </h2>

                    <div className="space-y-4">
                        {/* Company Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                اسم المنصة / الشركة
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={settings.companyName}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                البريد الإلكتروني للدعم
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={settings.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                رقم الهاتف
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={settings.phone}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                العنوان
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={settings.address}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className={`p-6 rounded-xl mb-6 shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        🔔 الإشعارات
                    </h2>

                    <div className="space-y-4">
                        {/* Push Notifications */}
                        <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition">
                            <input
                                type="checkbox"
                                name="notifications"
                                checked={settings.notifications}
                                onChange={handleChange}
                                className="w-5 h-5 rounded text-primary focus:ring-primary"
                            />
                            <span className="mr-3 select-none">تفعيل الإشعارات المنبثقة</span>
                        </label>

                        {/* Email Notifications */}
                        <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition">
                            <input
                                type="checkbox"
                                name="emailNotifications"
                                checked={settings.emailNotifications}
                                onChange={handleChange}
                                className="w-5 h-5 rounded text-primary focus:ring-primary"
                            />
                            <span className="mr-3 select-none">استلام إشعارات عبر البريد الإلكتروني</span>
                        </label>
                    </div>
                </div>

                {/* Language */}
                <div className={`p-6 rounded-xl mb-6 shadow-sm border transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        🌐 اللغة
                    </h2>

                    <select
                        name="language"
                        value={settings.language}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                    >
                        <option value="ar">العربية (Arabic)</option>
                        <option value="en">English (الإنجليزية)</option>
                    </select>
                </div>

                {/* Save Button */}
                <div className="sticky bottom-4 z-10">
                    <button
                        onClick={handleSave}
                        className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                    >
                        💾 حفظ الإعدادات
                    </button>
                </div>

                {/* Success Message */}
                {saved && (
                    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce-in z-50">
                        ✅ تم حفظ الإعدادات بنجاح!
                    </div>
                )}
            </div>
        </div>
    )
}
