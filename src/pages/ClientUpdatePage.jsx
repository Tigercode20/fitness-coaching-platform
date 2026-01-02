// ============================================
// src/pages/ClientUpdatePage.jsx
// صفحة متابعة ال client - تحديث البيانات
// ============================================

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import UpdateForm from '../components/Forms/UpdateForm'
import { FaArrowRight } from 'react-icons/fa'

export default function ClientUpdatePage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const clientId = searchParams.get('clientId')
    const clientName = searchParams.get('name')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData) => {
        try {
            setLoading(true)

            // حفظ التحديث في Firebase
            console.log('تم تحديث العميل:', formData)

            alert('✅ تم حفظ التحديث بنجاح!')
            navigate('/dashboard')
        } catch (error) {
            console.error('خطأ:', error)
            alert('❌ فشل الحفظ: ' + error.message)
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
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-primary hover:text-primary-dark 
              dark:text-primary dark:hover:text-primary-light mb-4 transition-colors duration-200"
                    >
                        <FaArrowRight /> رجوع
                    </button>

                    <h1 className="text-3xl sm:text-4xl font-bold text-dark dark:text-white mb-2">
                        📊 متابعة العميل
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        تحديث بيانات ومقاييس العميل {clientName && `(${clientName})`}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 sm:p-8
          transition-colors duration-300">
                    <UpdateForm
                        onSubmit={handleSubmit}
                        loading={loading}
                        clientId={clientId}
                    />
                </div>

                {/* Info Boxes */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 
            dark:border-blue-800 rounded-lg transition-colors duration-300">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                            📸 الصور:
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                            أرفق 3 صور (أمام - جانب - خلف) للمقارنة
                        </p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 
            dark:border-green-800 rounded-lg transition-colors duration-300">
                        <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                            📋 الملاحظات:
                        </h3>
                        <p className="text-sm text-green-800 dark:text-green-400">
                            اكتب ملاحظاتك عن تقدم العميل والنقاط المهمة
                        </p>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 
            dark:border-yellow-800 rounded-lg transition-colors duration-300">
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                            ⏱️ التكرار:
                        </h3>
                        <p className="text-sm text-yellow-800 dark:text-yellow-400">
                            يفضل التحديث أسبوعياً لتتبع التقدم
                        </p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 
            dark:border-purple-800 rounded-lg transition-colors duration-300">
                        <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                            💬 التواصل:
                        </h3>
                        <p className="text-sm text-purple-800 dark:text-purple-400">
                            اكتب أسئلة العميل وردودك على كل سؤال
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
