// ============================================
// src/pages/ClientForm.jsx
// فورم استقبال عميل جديد (متجاوب + محسّن)
// ============================================

import { useState } from 'react'
import { FaArrowRight, FaCheck } from 'react-icons/fa'
import useDarkMode from '../hooks/useDarkMode'
import { savePendingForm } from '../services/pendingFormService'

export default function ClientForm() {
    const { isDark } = useDarkMode()
    const [currentTab, setCurrentTab] = useState(0)
    const [loading, setLoading] = useState(false)

    // البيانات
    const [formData, setFormData] = useState({
        // Tab 1: البيانات الأساسية
        fullName: '',
        email: '',
        phone: '',
        age: '',
        gender: '',

        // Tab 2: الأهداف
        mainGoal: '',
        goalDetails: '',
        reason: '',

        // Tab 3: الصور
        frontPhoto: null,
        sidePhoto: null,
        backPhoto: null,

        // Tab 4: الصحة
        healthConditions: '',
        injuries: '',
        medications: '',

        // Tab 5: التفاصيل الإضافية
        experienceLevel: '',
        trainingFrequency: '',
        notes: ''
    })

    const [fileNames, setFileNames] = useState({
        frontPhoto: '',
        sidePhoto: '',
        backPhoto: ''
    })

    // الـ Tabs
    const tabs = [
        { label: 'البيانات الأساسية', icon: '👤' },
        { label: 'الأهداف', icon: '🎯' },
        { label: 'الصور', icon: '📸' },
        { label: 'الصحة', icon: '🏥' },
        { label: 'إضافي', icon: '📝' }
    ]

    // معالجة الـ Input
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // معالجة الملفات
    const handleFileChange = (field, file) => {
        setFormData(prev => ({
            ...prev,
            [field]: file
        }))
        setFileNames(prev => ({
            ...prev,
            [field]: file?.name || ''
        }))
    }

    // الخطوة التالية
    const handleNext = () => {
        if (currentTab < tabs.length - 1) {
            setCurrentTab(currentTab + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    // الخطوة السابقة
    const handlePrev = () => {
        if (currentTab > 0) {
            setCurrentTab(currentTab - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    // الحفظ
    const handleSave = async () => {
        setLoading(true)
        try {
            // Prepare data for pending form (excluding File objects for now)
            const dataToSave = { ...formData }
            // Convert File objects to null or handle file upload separately
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] instanceof File) {
                    dataToSave[key] = `[ملف: ${dataToSave[key].name}]` // Placeholder text
                }
            })

            // Save to pending_forms collection for admin review
            await savePendingForm(dataToSave, 'client')

            alert('✅ شكراً! تم استقبال البيانات وهي تحت المراجعة الآن.')

            // إعادة تعيين الفورم
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                age: '',
                gender: '',
                mainGoal: '',
                goalDetails: '',
                reason: '',
                frontPhoto: null,
                sidePhoto: null,
                backPhoto: null,
                healthConditions: '',
                injuries: '',
                medications: '',
                experienceLevel: '',
                trainingFrequency: '',
                notes: ''
            })
            setFileNames({ frontPhoto: '', sidePhoto: '', backPhoto: '' })
            setCurrentTab(0)
        } catch (error) {
            console.error('Error saving form:', error)
            alert('❌ حدث خطأ: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    // محتوى التابات
    const renderTabContent = () => {
        switch (currentTab) {
            case 0: // البيانات الأساسية
                return (
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                الاسم الكامل *
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                placeholder="أدخل الاسم الكامل"
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2
                  ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    البريد الإلكتروني *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="example@email.com"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all
                    ${isDark
                                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                    focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2
                  ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    رقم الهاتف *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="0123456789"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all
                    ${isDark
                                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                    focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2
                  ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    العمر *
                                </label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => handleInputChange('age', e.target.value)}
                                    placeholder="السن"
                                    min="15"
                                    max="100"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all
                    ${isDark
                                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                    focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2
                  ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    الجنس *
                                </label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border transition-all
                    ${isDark
                                            ? 'bg-gray-800 border-gray-700 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'}
                    focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                                >
                                    <option value="">اختر...</option>
                                    <option value="male">ذكر</option>
                                    <option value="female">أنثى</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )

            case 1: // الأهداف
                return (
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                الهدف الرئيسي *
                            </label>
                            <select
                                value={formData.mainGoal}
                                onChange={(e) => handleInputChange('mainGoal', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            >
                                <option value="">اختر...</option>
                                <option value="weight_loss">فقدان الوزن</option>
                                <option value="muscle_gain">بناء العضلات</option>
                                <option value="fitness">اللياقة البدنية</option>
                                <option value="health">الصحة والعافية</option>
                            </select>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                تفاصيل الهدف
                            </label>
                            <textarea
                                value={formData.goalDetails}
                                onChange={(e) => handleInputChange('goalDetails', e.target.value)}
                                placeholder="اكتب التفاصيل..."
                                rows="3"
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                لماذا اخترت هذا الهدف؟
                            </label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => handleInputChange('reason', e.target.value)}
                                placeholder="السبب..."
                                rows="3"
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            />
                        </div>
                    </div>
                )

            case 2: // الصور
                return (
                    <div className="space-y-6">
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            📸 الرجاء إرسال 3 صور واضحة من (الأمام، الجنب، الخلف)
                        </p>

                        {/* الصورة الأمامية */}
                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                صورة من الأمام (رابط) *
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange('frontPhoto', e.target.files?.[0])}
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white'
                                        : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            />
                            {fileNames.frontPhoto && (
                                <p className="text-sm text-green-500 mt-2">✓ {fileNames.frontPhoto}</p>
                            )}
                        </div>

                        {/* الصورة الجانبية */}
                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                صورة من الجانب (رابط) *
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange('sidePhoto', e.target.files?.[0])}
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white'
                                        : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            />
                            {fileNames.sidePhoto && (
                                <p className="text-sm text-green-500 mt-2">✓ {fileNames.sidePhoto}</p>
                            )}
                        </div>

                        {/* الصورة الخلفية */}
                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                صورة من الخلف (رابط) *
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange('backPhoto', e.target.files?.[0])}
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white'
                                        : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            />
                            {fileNames.backPhoto && (
                                <p className="text-sm text-green-500 mt-2">✓ {fileNames.backPhoto}</p>
                            )}
                        </div>
                    </div>
                )

            case 3: // الصحة
                return (
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                هل لديك أي حالات صحية؟
                            </label>
                            <textarea
                                value={formData.healthConditions}
                                onChange={(e) => handleInputChange('healthConditions', e.target.value)}
                                placeholder="مثل: السكري، الضغط، إلخ..."
                                rows="3"
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                هل لديك إصابات سابقة؟
                            </label>
                            <textarea
                                value={formData.injuries}
                                onChange={(e) => handleInputChange('injuries', e.target.value)}
                                placeholder="الإصابات أو المشاكل..."
                                rows="3"
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                هل تتناول أي أدوية؟
                            </label>
                            <textarea
                                value={formData.medications}
                                onChange={(e) => handleInputChange('medications', e.target.value)}
                                placeholder="الأدوية المستخدمة..."
                                rows="3"
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            />
                        </div>
                    </div>
                )

            case 4: // إضافي
                return (
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                مستوى الخبرة *
                            </label>
                            <select
                                value={formData.experienceLevel}
                                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            >
                                <option value="">اختر...</option>
                                <option value="beginner">مبتدئ</option>
                                <option value="intermediate">متوسط</option>
                                <option value="advanced">متقدم</option>
                            </select>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                عدد أيام التمرين في الأسبوع *
                            </label>
                            <select
                                value={formData.trainingFrequency}
                                onChange={(e) => handleInputChange('trainingFrequency', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            >
                                <option value="">اختر...</option>
                                <option value="2-3">2-3 أيام</option>
                                <option value="3-4">3-4 أيام</option>
                                <option value="4-5">4-5 أيام</option>
                                <option value="5+">5+ أيام</option>
                            </select>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                ملاحظات إضافية
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="أي معلومات إضافية..."
                                rows="3"
                                className={`w-full px-4 py-2 rounded-lg border transition-all
                  ${isDark
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                  focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                            />
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className={`min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-300
      ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className={`text-3xl sm:text-4xl font-bold mb-2
            ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        🆕 استقبال عميل جديد
                    </h1>
                    <p className={`text-sm sm:text-base
            ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        يرجى ملء البيانات بشكل دقيق
                    </p>
                </div>

                {/* Progress Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-8 sm:mb-10">
                    {tabs.map((tab, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentTab(idx)}
                            className={`flex-shrink-0 flex flex-col items-center justify-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all
                ${currentTab === idx
                                    ? `${isDark ? 'bg-teal-600 text-white' : 'bg-teal-500 text-white'} shadow-lg`
                                    : `${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`
                                }`}
                        >
                            <span className="text-lg sm:text-xl">{tab.icon}</span>
                            <span className="text-xs sm:text-sm font-medium mt-1 text-center line-clamp-2">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <div className={`rounded-xl p-6 sm:p-8 shadow-lg
          ${isDark ? 'bg-gray-900' : 'bg-white'}`}>

                    {renderTabContent()}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10">
                        {currentTab > 0 && (
                            <button
                                onClick={handlePrev}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all
                  ${isDark
                                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                            >
                                ← السابق
                            </button>
                        )}

                        {currentTab < tabs.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                  ${isDark
                                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                        : 'bg-teal-500 hover:bg-teal-600 text-white'}`}
                            >
                                استمرار
                                <FaArrowRight />
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                  ${isDark
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-green-500 hover:bg-green-600 text-white'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? '⏳ جاري الحفظ...' : (
                                    <>
                                        حفظ البيانات
                                        <FaCheck />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Note */}
                <p className={`text-center text-xs sm:text-sm mt-6 sm:mt-8
          ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    ✓ لا تحتاج إلى تسجيل دخول - جميع البيانات محمية وآمنة
                </p>
            </div>
        </div>
    )
}
