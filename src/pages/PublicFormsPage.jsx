// ============================================
// src/pages/PublicFormsPage.jsx
// صفحة الفورمات العامة للعملاء
// لينكات معزولة وسهلة
// ============================================

import { useState } from 'react'
import { FaCopy, FaQrcode, FaWhatsapp, FaLink } from 'react-icons/fa'
import useDarkMode from '../hooks/useDarkMode'

export default function PublicFormsPage() {
    const { isDark } = useDarkMode()
    const [copied, setCopied] = useState(null)

    // القاعدة الأساسية (غيّرها بالـ domain الفعلي)
    const baseURL = window.location.origin // Use current origin automatically

    // الفورمات المتاحة
    const forms = [
        {
            id: 1,
            name: 'استقبال عميل جديد',
            description: 'فورم شامل لاستقبال بيانات العميل الجديد (5 أتاب)',
            path: '/client-form',
            icon: '🆕',
            color: 'from-green-500 to-emerald-500',
            use: 'للعملاء الجدد فقط'
        },
        {
            id: 2,
            name: 'متابعة العميل',
            description: 'تحديث بيانات ومقاييس العميل الحالي (6 أتاب)',
            path: '/client-form?type=update',
            icon: '📊',
            color: 'from-blue-500 to-cyan-500',
            use: 'للمتابعة الأسبوعية'
        },
        {
            id: 3,
            name: 'تقييم الصحة',
            description: 'استبيان صحي شامل قبل بدء البرنامج',
            path: '/client-form?type=health',
            icon: '🏥',
            color: 'from-red-500 to-pink-500',
            use: 'قبل الاشتراك'
        }
    ]

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    const generateWhatsAppLink = (formUrl) => {
        const message = `السلام عليكم 👋\n\nاملأ الفورم من هنا:\n${formUrl}`
        return `https://wa.me/?text=${encodeURIComponent(message)}`
    }

    return (
        <div className={`min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-300
      ${isDark ? 'bg-gray-950' : 'bg-white'}`}>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className={`text-4xl sm:text-5xl font-bold mb-4
            ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        🔗 الفورمات المعزولة
                    </h1>
                    <p className={`text-lg mb-2
            ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        روابط مباشرة وسهلة للعملاء
                    </p>
                    <p className={`text-sm
            ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        انسخ الرابط وأرسله للعميل عبر WhatsApp أو البريد
                    </p>
                </div>

                {/* Forms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {forms.map((form) => {
                        const fullUrl = `${baseURL}${form.path}`

                        return (
                            <div
                                key={form.id}
                                className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl
                  ${isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'}`}
                            >
                                {/* Card Header with Gradient */}
                                <div className={`bg-gradient-to-r ${form.color} p-6 text-white`}>
                                    <div className="text-5xl mb-2">{form.icon}</div>
                                    <h3 className="text-2xl font-bold">{form.name}</h3>
                                    <p className="text-sm opacity-90 mt-2">{form.use}</p>
                                </div>

                                {/* Card Body */}
                                <div className="p-6">
                                    <p className={`mb-6 text-sm leading-relaxed
                    ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {form.description}
                                    </p>

                                    {/* URL Display */}
                                    <div className={`p-3 rounded-lg mb-4 border
                    ${isDark
                                            ? 'bg-gray-800 border-gray-700'
                                            : 'bg-gray-50 border-gray-200'}`}>
                                        <p className={`text-xs font-mono break-all
                      ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {fullUrl}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        {/* Copy Button */}
                                        <button
                                            onClick={() => copyToClipboard(fullUrl, form.id)}
                                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                        font-medium transition-all duration-200
                        ${copied === form.id
                                                    ? 'bg-green-500 text-white'
                                                    : isDark
                                                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <FaCopy className="text-sm" />
                                            {copied === form.id ? '✓ تم النسخ' : 'نسخ الرابط'}
                                        </button>

                                        {/* WhatsApp Button */}
                                        <a
                                            href={generateWhatsAppLink(fullUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                        bg-green-500 hover:bg-green-600 text-white font-medium
                        transition-all duration-200"
                                        >
                                            <FaWhatsapp />
                                            أرسل عبر WhatsApp
                                        </a>

                                        {/* QR Code Button */}
                                        <button
                                            onClick={() => {
                                                alert('سيتم إضافة QR Code قريباً')
                                            }}
                                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                        font-medium transition-all duration-200
                        ${isDark
                                                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                                }`}
                                        >
                                            <FaQrcode className="text-sm" />
                                            QR Code
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Quick Links Section */}
                <div className={`rounded-xl p-8 mb-8
          ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <h2 className={`text-2xl font-bold mb-6
            ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ⚡ روابط سريعة مع معاملات
                    </h2>

                    <div className="space-y-4">
                        {/* مع رمز العميل */}
                        <div className={`p-4 rounded-lg border
              ${isDark
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200'}`}>
                            <p className={`font-semibold mb-2
                ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                🔢 مع رمز العميل:
                            </p>
                            <div className={`text-sm font-mono break-all p-2 rounded
                ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                {`${baseURL}/client-form?code=1001&coach=محمد`}
                            </div>
                        </div>

                        {/* مع الاسم واللون */}
                        <div className={`p-4 rounded-lg border
              ${isDark
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200'}`}>
                            <p className={`font-semibold mb-2
                ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                👤 مع اسم المدرب والرمز:
                            </p>
                            <div className={`text-sm font-mono break-all p-2 rounded
                ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                {`${baseURL}/client-form?code=1005&coach=أحمد_الفتاح`}
                            </div>
                        </div>

                        {/* مختصر */}
                        <div className={`p-4 rounded-lg border
              ${isDark
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200'}`}>
                            <p className={`font-semibold mb-2
                ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                🔗 رابط مختصر (استخدم Bit.ly):
                            </p>
                            <div className={`text-sm font-mono break-all p-2 rounded
                ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                https://bit.ly/fitness-coach-form
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className={`rounded-xl p-8
          ${isDark ? 'bg-blue-950/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                    <h2 className={`text-2xl font-bold mb-4
            ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                        📋 كيفية الاستخدام:
                    </h2>

                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <span className={`font-bold flex-shrink-0
                ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                                1️⃣
                            </span>
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                انسخ الرابط من الزر "نسخ الرابط"
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <span className={`font-bold flex-shrink-0
                ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                                2️⃣
                            </span>
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                أرسله للعميل عبر WhatsApp أو البريد
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <span className={`font-bold flex-shrink-0
                ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                                3️⃣
                            </span>
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                العميل يضغط الرابط ويملأ الفورم بدون تسجيل دخول
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <span className={`font-bold flex-shrink-0
                ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                                4️⃣
                            </span>
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                البيانات تُحفظ تلقائياً في Dashboard الخاص بك
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
