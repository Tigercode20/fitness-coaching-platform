// ============================================
// src/pages/NewClientPage.jsx
// صفحة إضافة عميل جديد
// ============================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NewClientForm from '../components/Forms/NewClientForm'
import { addNewClient } from '../services/clientService'
import { FaArrowRight } from 'react-icons/fa'

export default function NewClientPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData) => {
        try {
            setLoading(true)

            // حفظ البيانات في Firebase
            const response = await addNewClient({
                ...formData,
                createdAt: new Date(),
                status: 'active'
            })

            console.log('تم إضافة العميل:', response)

            // إظهار رسالة نجاح
            alert('✅ تم إضافة العميل بنجاح!')

            // الرجوع لقائمة العملاء
            navigate('/clients')
        } catch (error) {
            console.error('خطأ:', error)
            alert('❌ فشل إضافة العميل: ' + error.message)
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
                        onClick={() => navigate('/clients')}
                        className="flex items-center gap-2 text-primary hover:text-primary-dark 
              dark:text-primary dark:hover:text-primary-light mb-4 transition-colors duration-200"
                    >
                        <FaArrowRight /> رجوع
                    </button>

                    <h1 className="text-3xl sm:text-4xl font-bold text-dark dark:text-white mb-2">
                        ➕ إضافة عميل جديد
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        ملء بيانات العميل الجديد بشكل شامل
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 sm:p-8
          transition-colors duration-300">
                    <NewClientForm
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                </div>

                {/* Info Box */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 
          dark:border-blue-800 rounded-lg transition-colors duration-300">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        💡 نصيحة:
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                        تأكد من ملء جميع الحقول المطلوبة بشكل صحيح. هذه البيانات ستُستخدم لإنشاء برنامج تدريبي مخصص.
                    </p>
                </div>
            </div>
        </div>
    )
}
