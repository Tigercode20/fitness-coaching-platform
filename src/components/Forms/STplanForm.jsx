// ============================================
// src/components/Forms/STplanForm.jsx
// الخطة الأولية (ST Plan) - تغذية + تدريب (محدث)
// ============================================

import { useState } from 'react'
import { FaAppleAlt, FaDumbbell, FaUser, FaCheck, FaArrowRight } from 'react-icons/fa'
import useDarkMode from '../../hooks/useDarkMode'

export default function STplanForm({ onSubmit }) {
    const { isDark } = useDarkMode()
    const [activeTab, setActiveTab] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        subscriptionId: '',
        clientCode: '',
        clientName: '',

        // التغذية
        nutritionPlanFile: null,
        nutritionPlanDays: 30,
        nutritionNotes: '',

        // التدريب
        workoutPlanFile: null,
        workoutPlanDays: 30,
        workoutNotes: ''
    })

    const [fileNames, setFileNames] = useState({
        nutritionPlanFile: '',
        workoutPlanFile: ''
    })

    const tabs = [
        { label: 'بيانات العميل', icon: <FaUser /> },
        { label: 'خطة التغذية', icon: <FaAppleAlt /> },
        { label: 'برنامج التدريب', icon: <FaDumbbell /> },
        { label: 'تأكيد', icon: <FaCheck /> },
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleFileChange = (name, file) => {
        setFormData(prev => ({
            ...prev,
            [name]: file
        }))
        setFileNames(prev => ({
            ...prev,
            [name]: file?.name || ''
        }))
    }

    const handleNext = () => {
        if (activeTab < tabs.length - 1) {
            setActiveTab(activeTab + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handlePrev = () => {
        if (activeTab > 0) {
            setActiveTab(activeTab - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (!formData.clientCode) {
                throw new Error('يرجى ملء رمز العميل')
            }

            if (onSubmit) {
                await onSubmit(formData)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 0: // Client Info
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>رمز العميل *</label>
                                <input type="text" name="clientCode" value={formData.clientCode} onChange={handleChange} placeholder="1001" required
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>اسم العميل</label>
                                <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} placeholder="أحمد محمد"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>رقم الاشتراك</label>
                            <input type="text" name="subscriptionId" value={formData.subscriptionId} onChange={handleChange} placeholder="SUB001"
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                        </div>
                    </div>
                )

            case 1: // Nutrition
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-dark'}`}>خطة التغذية</h3>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ملف الخطة (PDF/IMG)</label>
                            <input type="file" onChange={(e) => handleFileChange('nutritionPlanFile', e.target.files?.[0])} accept=".pdf,image/*"
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white' : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'}`} />
                            {fileNames.nutritionPlanFile && <p className="text-xs text-green-500 mt-1">✓ {fileNames.nutritionPlanFile}</p>}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>عدد الأيام</label>
                                <input type="number" name="nutritionPlanDays" value={formData.nutritionPlanDays} onChange={handleChange} min="1" max="365"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ملاحظات</label>
                            <textarea name="nutritionNotes" value={formData.nutritionNotes} onChange={handleChange} rows="3" placeholder="ملاحظات هامة..."
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                        </div>
                    </div>
                )

            case 2: // Training
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-dark'}`}>برنامج التدريب</h3>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ملف البرنامج (PDF/IMG)</label>
                            <input type="file" onChange={(e) => handleFileChange('workoutPlanFile', e.target.files?.[0])} accept=".pdf,image/*"
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white' : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'}`} />
                            {fileNames.workoutPlanFile && <p className="text-xs text-green-500 mt-1">✓ {fileNames.workoutPlanFile}</p>}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>عدد الأيام</label>
                                <input type="number" name="workoutPlanDays" value={formData.workoutPlanDays} onChange={handleChange} min="1" max="365"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ملاحظات</label>
                            <textarea name="workoutNotes" value={formData.workoutNotes} onChange={handleChange} rows="3" placeholder="ملاحظات هامة..."
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                        </div>
                    </div>
                )

            case 3: // Review
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-dark'}`}>تأكيد البيانات</h3>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <ul className={`text-sm space-y-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                                <li>👤 العميل: {formData.clientName || formData.clientCode}</li>
                                <li>🍽️ خطة التغذية: {fileNames.nutritionPlanFile || 'لا يوجد'} ({formData.nutritionPlanDays} يوم)</li>
                                <li>💪 برنامج التدريب: {fileNames.workoutPlanFile || 'لا يوجد'} ({formData.workoutPlanDays} يوم)</li>
                            </ul>
                        </div>
                    </div>
                )

            default: return null
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

            <div className="flex overflow-x-auto gap-2 mb-8 sm:mb-10 pb-2">
                {tabs.map((tab, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveTab(idx)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all border 
                            ${activeTab === idx
                                ? 'bg-teal-600 text-white border-teal-600'
                                : `${isDark ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-white text-gray-600 border-gray-200'}`}`}
                    >
                        <span className="text-xl">{tab.icon}</span>
                        <span className="text-sm font-medium mt-1">{tab.label}</span>
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className={`rounded-xl p-6 sm:p-8 shadow-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                {renderTabContent()}

                <div className="flex flex-col-reverse sm:flex-row gap-4 mt-8 pt-4 border-t border-gray-100">
                    {activeTab > 0 && (
                        <button type="button" onClick={handlePrev} className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>
                            ← السابق
                        </button>
                    )}

                    {activeTab < tabs.length - 1 ? (
                        <button type="button" onClick={handleNext} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-all">
                            استمرار <FaArrowRight />
                        </button>
                    ) : (
                        <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all">
                            {loading ? 'جاري الحفظ...' : 'حفظ الخطة الأولية ✅'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
