// ============================================
// src/components/Forms/UpdateForm.jsx
// فورم المتابعة - تحديث العميل (محدث)
// ============================================

import { useState } from 'react'
import { FaImage, FaQuestionCircle, FaPencilAlt, FaRuler, FaAppleAlt, FaDumbbell, FaHeartbeat, FaCommentDots, FaArrowRight, FaCheck } from 'react-icons/fa'
import useDarkMode from '../../hooks/useDarkMode'

export default function UpdateForm({ onSubmit }) {
    const { isDark } = useDarkMode()
    const [activeTab, setActiveTab] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        // معلومات أساسية
        subscriptionId: '',
        clientCode: '',
        fullName: '',
        email: '',

        // قياسات الجسم
        currentWeightKg: '',

        // الصور الجديدة
        newFrontPhoto: null,
        newSidePhoto: null,
        newBackPhoto: null,

        // الالتزام بالتغذية
        dietAdherenceLevel: 5,
        dietDifficultyFeedback: '',
        hungerLevel: '',
        energyLevel: '',
        cravingsDescription: '',

        // الالتزام بالتدريب
        trainingAdherenceLevel: 5,
        trainingDifficultyFeedback: '',
        painOrNewInjury: '',
        cardioAdherence: '',
        dailyStepsAverage: '',

        // الصحة العامة
        sleepQuality: '',
        stressLevel: 5,
        supplementsUsage: '',

        // التواصل
        clientQuestions: '',
        coachNotes: '',

        // الملفات المحدثة
        newNutritionPlanFile: null,
        newWorkoutPlanFile: null
    })

    const [fileNames, setFileNames] = useState({
        newFrontPhoto: '',
        newSidePhoto: '',
        newBackPhoto: '',
        newNutritionPlanFile: '',
        newWorkoutPlanFile: ''
    })

    const tabs = [
        { label: 'نظرة عامة', icon: <FaPencilAlt /> },
        { label: 'القياسات', icon: <FaRuler /> },
        { label: 'التغذية', icon: <FaAppleAlt /> },
        { label: 'التدريب', icon: <FaDumbbell /> },
        { label: 'الصحة', icon: <FaHeartbeat /> },
        { label: 'التواصل', icon: <FaCommentDots /> },
    ]

    const handleChange = (e) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'range' ? parseInt(value) : value
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
            // Reset logic can be handled by parent or here
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 0: // Overview
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>رمز العميل *</label>
                                <input type="text" name="clientCode" value={formData.clientCode} onChange={handleChange} placeholder="1001" required
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>رقم الاشتراك</label>
                                <input type="text" name="subscriptionId" value={formData.subscriptionId} onChange={handleChange} placeholder="SUB001"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>الاسم الكامل</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="أحمد محمد"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>البريد الإلكتروني</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                        </div>
                    </div>
                )

            case 1: // Measurements
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>الوزن الحالي (كيلو)</label>
                            <input type="number" name="currentWeightKg" value={formData.currentWeightKg} onChange={handleChange} step="0.1" placeholder="85.5"
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                        </div>
                        <div className="space-y-4">
                            <h4 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}><FaImage /> الصور الجديدة</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                {['newFrontPhoto', 'newSidePhoto', 'newBackPhoto'].map((field) => (
                                    <div key={field}>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {field === 'newFrontPhoto' ? 'أمام' : field === 'newSidePhoto' ? 'جانب' : 'خلف'}
                                        </label>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(field, e.target.files?.[0])}
                                            className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white' : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'}`} />
                                        {fileNames[field] && <p className="text-xs text-green-500 mt-1">✓ {fileNames[field]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )

            case 2: // Nutrition
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>درجة الالتزام (1-10): {formData.dietAdherenceLevel}</label>
                            <input type="range" name="dietAdherenceLevel" value={formData.dietAdherenceLevel} onChange={handleChange} min="1" max="10"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>صعوبة النظام</label>
                            <textarea name="dietDifficultyFeedback" value={formData.dietDifficultyFeedback} onChange={handleChange} rows="2" placeholder="ما التحديات؟"
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>مستوى الجوع</label>
                                <select name="hungerLevel" value={formData.hungerLevel} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                                    <option value="">اختر...</option><option value="منخفض جداً">منخفض جداً</option><option value="منخفض">منخفض</option><option value="متوسط">متوسط</option><option value="عالي">عالي</option><option value="عالي جداً">عالي جداً</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>مستوى الطاقة</label>
                                <select name="energyLevel" value={formData.energyLevel} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                                    <option value="">اختر...</option><option value="منخفض جداً">منخفض جداً</option><option value="منخفض">منخفض</option><option value="متوسط">متوسط</option><option value="عالي">عالي</option><option value="عالي جداً">عالي جداً</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )

            case 3: // Training
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>درجة الالتزام (1-10): {formData.trainingAdherenceLevel}</label>
                            <input type="range" name="trainingAdherenceLevel" value={formData.trainingAdherenceLevel} onChange={handleChange} min="1" max="10"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>صعوبة البرنامج</label>
                            <textarea name="trainingDifficultyFeedback" value={formData.trainingDifficultyFeedback} onChange={handleChange} rows="2" placeholder="ما الأمور الصعبة؟"
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ألم أو إصابة جديدة</label>
                            <textarea name="painOrNewInjury" value={formData.painOrNewInjury} onChange={handleChange} rows="2"
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                        </div>
                    </div>
                )

            case 4: // Health
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>جودة النوم</label>
                            <select name="sleepQuality" value={formData.sleepQuality} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                                <option value="">اختر...</option><option value="سيئة">سيئة</option><option value="متوسطة">متوسطة</option><option value="جيدة">جيدة</option><option value="ممتازة">ممتازة</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>مستوى الإجهاد (1-10): {formData.stressLevel}</label>
                            <input type="range" name="stressLevel" value={formData.stressLevel} onChange={handleChange} min="1" max="10"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                        </div>
                    </div>
                )

            case 5: // Communication
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>أسئلة العميل</label>
                            <textarea name="clientQuestions" value={formData.clientQuestions} onChange={handleChange} rows="3" placeholder="استفساراتك..."
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>خطة تغذية محدثة (اختياري)</label>
                                <input type="file" onChange={(e) => handleFileChange('newNutritionPlanFile', e.target.files?.[0])} accept=".pdf,image/*"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white' : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'}`} />
                                {fileNames.newNutritionPlanFile && <p className="text-xs text-green-500 mt-1">✓ {fileNames.newNutritionPlanFile}</p>}
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>برنامج تدريب محدث (اختياري)</label>
                                <input type="file" onChange={(e) => handleFileChange('newWorkoutPlanFile', e.target.files?.[0])} accept=".pdf,image/*"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white' : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'}`} />
                                {fileNames.newWorkoutPlanFile && <p className="text-xs text-green-500 mt-1">✓ {fileNames.newWorkoutPlanFile}</p>}
                            </div>
                        </div>
                    </div>
                )

            default: return null
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
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
                            {loading ? 'جاري الحفظ...' : 'حفظ المتابعة ✅'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
