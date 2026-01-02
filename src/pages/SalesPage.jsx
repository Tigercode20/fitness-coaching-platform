// ============================================
// src/pages/SalesPage.jsx
// صفحة تسجيل مبيعات/اشتراكات جديدة
// ============================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SalesForm from '../components/Forms/SalesForm'
import { addSubscription } from '../services/subscriptionService'
import { FaArrowRight } from 'react-icons/fa'

export default function SalesPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData) => {
        try {
            setLoading(true)

            const response = await addSubscription({
                ...formData,
                createdAt: new Date(),
                status: 'active'
            })

            console.log('تم تسجيل المبيعة:', response)
            alert('✅ تم تسجيل المبيعة بنجاح!')
            navigate('/subscriptions')
        } catch (error) {
            console.error('خطأ:', error)
            alert('❌ فشل التسجيل: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 p-4 sm:p-6 md:p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/subscriptions')}
                        className="flex items-center gap-2 text-primary hover:text-primary-dark 
              dark:text-primary dark:hover:text-primary-light mb-4 transition-colors duration-200"
                    >
                        <FaArrowRight /> رجوع
                    </button>

                    <h1 className="text-3xl sm:text-4xl font-bold text-dark dark:text-white mb-2">
                        💰 تسجيل مبيعة جديدة
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        سجل اشتراك جديد أو تجديد اشتراك قائم
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 sm:p-8
          transition-colors duration-300">
                    <SalesForm
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                </div>

                {/* Info Box */}
                <div className="mt-8 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 
          dark:border-green-800 rounded-lg transition-colors duration-300">
                    <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                        ✅ معلومات هامة:
                    </h3>
                    <ul className="text-sm text-green-800 dark:text-green-400 space-y-1">
                        <li>• أدخل رمز العميل بشكل صحيح</li>
                        <li>• اختر الباقة المناسبة (ذهبي/واري/VIP)</li>
                        <li>• أرفق لقطة الدفع والدردشة للتوثيق</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
