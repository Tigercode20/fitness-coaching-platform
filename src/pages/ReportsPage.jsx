// ============================================
// src/pages/ReportsPage.jsx
// Reports & Analytics Page
// ============================================

import { FaChartBar, FaDownload } from 'react-icons/fa'

export default function ReportsPage() {
    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">
                        التقارير والإحصائيات 📊
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        نظرة عامة على أداء عملك
                    </p>
                </div>
                <button className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium px-4 py-2 transition-colors">
                    <FaDownload />
                    <span>تصدير البيانات</span>
                </button>
            </div>

            {/* Placeholder Content */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 h-64 flex items-center justify-center">
                    <div className="text-center text-gray-400 dark:text-gray-500">
                        <FaChartBar className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>رسم بياني للإيرادات (قريباً)</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 h-64 flex items-center justify-center">
                    <div className="text-center text-gray-400 dark:text-gray-500">
                        <FaChartBar className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>رسم بياني للعملاء الجدد (قريباً)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
