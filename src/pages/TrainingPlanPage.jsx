// ============================================
// src/pages/TrainingPlanPage.jsx
// صفحة إضافة خطة التدريب والتغذية
// ============================================

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import STplanForm from '../components/Forms/STplanForm'
import { FaArrowRight } from 'react-icons/fa'

export default function TrainingPlanPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const clientId = searchParams.get('clientId')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData) => {
        try {
            setLoading(true)

            // حفظ الخطة في Firebase
            console.log('تم إرسال الخطة:', formData)

            alert('✅ تم رفع الخطة بنجاح!')
            navigate('/dashboard')
        } catch (error) {
            console.error('خطأ:', error)
            alert('❌ فشل رفع الخطة: ' + error.message)
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
                        📄 إضافة الخطة الأولية
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        رفع خطة التدريب والتغذية للعميل {clientId && `(${clientId})`}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 sm:p-8
          transition-colors duration-300">
                    <STplanForm
                        onSubmit={handleSubmit}
                        loading={loading}
                        clientId={clientId}
                    />
                </div>

                {/* Info Box */}
                <div className="mt-8 space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 
            dark:border-blue-800 rounded-lg transition-colors duration-300">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                            📋 الملفات المقبولة:
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                            PDF, JPG, PNG - بحد أقصى 10MB لكل ملف
                        </p>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 
            dark:border-yellow-800 rounded-lg transition-colors duration-300">
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                            ⚠️ هام:
                        </h3>
                        <p className="text-sm text-yellow-800 dark:text-yellow-400">
                            تأكد من وضوح الخطة والملفات قبل الرفع. سيتم إرسالها للعميل مباشرة.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
