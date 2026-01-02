// ============================================
// src/components/Forms/NewClientForm.jsx
// استقبال عميل جديد - فورم شامل (محدث)
// ============================================

import { useState } from 'react'
import { FaArrowRight, FaCheck, FaUser, FaDumbbell, FaHeartbeat, FaAppleAlt, FaRunning, FaRuler } from 'react-icons/fa'
import useDarkMode from '../../hooks/useDarkMode'

export default function NewClientForm({ onSubmit }) {
    const { isDark } = useDarkMode()
    const [activeTab, setActiveTab] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        // معلومات أساسية
        clientCode: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        country: '',
        language: 'ar',

        // البيانات الشخصية
        gender: '',
        birthDate: '',
        occupation: '',
        religion: '',

        // المقاييس
        weightKg: '',
        heightCm: '',

        // الأهداف
        subscriptionGoal: '',
        subscriptionReason: '',

        // الصور (ملفات)
        frontPhoto: null,
        sidePhoto: null,
        backPhoto: null,

        // السجل الصحي
        hasHealthProblems: false,
        healthProblemDetails: '',
        hasRecentTests: false,
        testsFile: null,
        usesMedications: false,
        medicationDetails: '',
        hasInjuries: false,
        injuryDetails: '',
        isSmoker: false,

        // التاريخ الغذائي
        followedDietBefore: false,
        dietHistory: '',
        dayActivityDescription: '',
        nonAdherenceReasons: '',
        drinksCaffeine: false,

        // الحساسيات
        hasFoodAllergy: false,
        foodAllergyDetails: '',
        dislikedFoods: '',
        wantsSupplements: false,
        mealCount: 3,
        dietType: 'مرن',
        budget: '',
        favoriteProtein: '',
        favoriteCarbs: '',
        favoriteFats: '',

        // السجل الرياضي
        trainingExperienceLevel: 'مبتدئ',
        trainingDuration: '',
        practicesOtherSports: false,
        otherSports: '',
        trainingPlace: '',
        availableEquipment: '',
        trainingDaysPerWeek: 3,
        availableDays: '',
        painfulExercises: '',
        preferredCardioType: '',
        dailySteps: 0,
        onlineCoachingExperience: '',

        // ملاحظات
        extraNotes: ''
    })

    const [fileNames, setFileNames] = useState({
        frontPhoto: '',
        sidePhoto: '',
        backPhoto: '',
        testsFile: ''
    })

    const tabs = [
        { label: 'بيانات أساسية', icon: <FaUser /> },
        { label: 'بيانات جسدية', icon: <FaRuler /> },
        { label: 'السجل الصحي', icon: <FaHeartbeat /> },
        { label: 'التاريخ الغذائي', icon: <FaAppleAlt /> },
        { label: 'السجل الرياضي', icon: <FaDumbbell /> },
    ]

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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
            if (!formData.clientCode || !formData.fullName || !formData.email) {
                throw new Error('يرجى ملء البيانات الأساسية (رمز العميل، الاسم، البريد)')
            }

            if (onSubmit) {
                await onSubmit(formData)
            }
            // Reset logic could be here if needed, or handled by parent
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 0: // Basic Info
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>رمز العميل *</label>
                                <input type="text" name="clientCode" value={formData.clientCode} onChange={handleChange} placeholder="مثال: 1001" required
                                    className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>الاسم الكامل *</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="أدخل الاسم الكامل" required
                                    className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>البريد الإلكتروني *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" required
                                    className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>رقم الهاتف</label>
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+201001234567"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>الدولة</label>
                                <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="مصر"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>اللغة</label>
                                <select name="language" value={formData.language} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`}>
                                    <option value="ar">العربية</option>
                                    <option value="en">الإنجليزية</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>النوع</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`}>
                                    <option value="">اختر...</option>
                                    <option value="Male">ذكر</option>
                                    <option value="Female">أنثى</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>تاريخ الميلاد</label>
                                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>المهنة</label>
                                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                        </div>
                    </div>
                )
            case 1: // Physical
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>الوزن (كيلو)</label>
                                <input type="number" name="weightKg" value={formData.weightKg} onChange={handleChange} step="0.1" className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>الطول (سم)</label>
                                <input type="number" name="heightCm" value={formData.heightCm} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>الهدف من الاشتراك</label>
                            <textarea name="subscriptionGoal" value={formData.subscriptionGoal} onChange={handleChange} rows="3" className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`}></textarea>
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>سبب الاشتراك</label>
                            <textarea name="subscriptionReason" value={formData.subscriptionReason} onChange={handleChange} rows="3" className={`w-full px-4 py-2 rounded-lg border transition-all 
                                        ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`}></textarea>
                        </div>
                        <div className="space-y-4">
                            <p className="font-bold text-gray-500">📸 الصور (رفع ملفات)</p>
                            <div className="grid md:grid-cols-3 gap-4">
                                {['frontPhoto', 'sidePhoto', 'backPhoto'].map((field) => (
                                    <div key={field}>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {field === 'frontPhoto' ? 'أمام' : field === 'sidePhoto' ? 'جانب' : 'خلف'}
                                        </label>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(field, e.target.files?.[0])}
                                            className={`w-full px-4 py-2 rounded-lg border transition-all 
                                            ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white' : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'} 
                                            focus:border-teal-500 focus:outline-none`} />
                                        {fileNames[field] && <p className="text-xs text-green-500 mt-1">✓ {fileNames[field]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )

            case 2: // Health
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="hasHealthProblems" checked={formData.hasHealthProblems} onChange={handleChange} className="w-4 h-4 text-teal-600 form-checkbox" />
                                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>هل لديك مشاكل صحية؟</span>
                            </label>
                            {formData.hasHealthProblems && (
                                <textarea name="healthProblemDetails" value={formData.healthProblemDetails} onChange={handleChange} placeholder="التفاصيل..." rows="2"
                                    className={`w-full mt-2 px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                            )}
                        </div>
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="hasRecentTests" checked={formData.hasRecentTests} onChange={handleChange} className="w-4 h-4 text-teal-600 form-checkbox" />
                                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>هل لديك تحاليل حديثة؟</span>
                            </label>
                            {formData.hasRecentTests && (
                                <div className="mt-2">
                                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange('testsFile', e.target.files?.[0])}
                                        className={`w-full px-4 py-2 rounded-lg border transition-all 
                                            ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white' : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'}`} />
                                    {fileNames.testsFile && <p className="text-xs text-green-500 mt-1">✓ {fileNames.testsFile}</p>}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="hasInjuries" checked={formData.hasInjuries} onChange={handleChange} className="w-4 h-4 text-teal-600 form-checkbox" />
                                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>هل لديك إصابات؟</span>
                            </label>
                            {formData.hasInjuries && (
                                <textarea name="injuryDetails" value={formData.injuryDetails} onChange={handleChange} placeholder="التفاصيل..." rows="2"
                                    className={`w-full mt-2 px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                            )}
                        </div>
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="isSmoker" checked={formData.isSmoker} onChange={handleChange} className="w-4 h-4 text-teal-600 form-checkbox" />
                                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>هل أنت مدخن؟</span>
                            </label>
                        </div>
                    </div>
                )

            case 3: // Diet
                return (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Simplified for brevity, similar structure */}
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="followedDietBefore" checked={formData.followedDietBefore} onChange={handleChange} className="w-4 h-4 text-teal-600 form-checkbox" />
                                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>نظام غذائي سابق؟</span>
                            </label>
                            {formData.followedDietBefore && <textarea name="dietHistory" value={formData.dietHistory} onChange={handleChange} placeholder="التفاصيل..." className={`w-full mt-2 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>عدد الوجبات</label>
                                <input type="number" name="mealCount" value={formData.mealCount} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>الميزانية</label>
                                <input type="number" name="budget" value={formData.budget} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="hasFoodAllergy" checked={formData.hasFoodAllergy} onChange={handleChange} className="w-4 h-4 text-teal-600 form-checkbox" />
                                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>حساسية طعام؟</span>
                            </label>
                            {formData.hasFoodAllergy && <textarea name="foodAllergyDetails" value={formData.foodAllergyDetails} onChange={handleChange} placeholder="التفاصيل..." className={`w-full mt-2 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />}
                        </div>
                    </div>
                )

            case 4: // Training
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>المستوى</label>
                                <select name="trainingExperienceLevel" value={formData.trainingExperienceLevel} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                                    <option value="مبتدئ">مبتدئ</option>
                                    <option value="متوسط">متوسط</option>
                                    <option value="متقدم">متقدم</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>أيام التدريب</label>
                                <input type="number" name="trainingDaysPerWeek" value={formData.trainingDaysPerWeek} onChange={handleChange} min="1" max="7" className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ملاحظات إضافية</label>
                            <textarea name="extraNotes" value={formData.extraNotes} onChange={handleChange} rows="3" className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                        </div>
                    </div>
                )

            default: return null
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

            {/* Steps / Tabs */}
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

                {/* Navigation */}
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
                            {loading ? 'جاري الحفظ...' : 'حفظ وإرسال ✅'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
