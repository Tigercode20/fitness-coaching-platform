// ============================================
// src/components/Forms/SalesForm.jsx
// فورم المبيعات/الاشتراكات (محدث)
// ============================================

import { useState } from 'react'
import { FaCreditCard, FaCalendarAlt, FaTag, FaUser, FaCheck, FaArrowRight } from 'react-icons/fa'
import useDarkMode from '../../hooks/useDarkMode'

export default function SalesForm({ onSubmit }) {
    const { isDark } = useDarkMode()
    const [activeTab, setActiveTab] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        clientCode: '',
        clientName: '',
        email: '',
        phoneNumber: '',
        subscriptionType: 'New',
        amountPaid: '',
        currency: 'EGP',
        receiveAccount: '',
        package: 'Gold',
        startDate: '',
        durationMonths: 3,
        bonusFreeMonths: 0,
        paymentScreenshot: null,
        chatScreenshot: null,
        receiveTrainingPlan: false,
        notes: ''
    })

    const [fileNames, setFileNames] = useState({
        paymentScreenshot: '',
        chatScreenshot: ''
    })

    const tabs = [
        { label: 'بيانات العميل', icon: <FaUser /> },
        { label: 'تفاصيل الاشتراك', icon: <FaTag /> },
        { label: 'الدفع', icon: <FaCreditCard /> },
        { label: 'تأكيد', icon: <FaCheck /> },
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
            if (!formData.clientCode || !formData.amountPaid || !formData.startDate) {
                throw new Error('يرجى ملء البيانات المطلوبة (رمز العميل، المبلغ، تاريخ البداية)')
            }

            if (onSubmit) {
                await onSubmit(formData)
            }
            // Reset logic handled by parent or here if needed
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
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>البريد الإلكتروني</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>رقم الهاتف</label>
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+201001234567"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                        </div>
                    </div>
                )

            case 1: // Subscription Info
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>نوع الاشتراك</label>
                                <select name="subscriptionType" value={formData.subscriptionType} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                                    <option value="New">جديد</option>
                                    <option value="Renew">تجديد</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>الباقة</label>
                                <select name="package" value={formData.package} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                                    <option value="Gold">ذهبي</option>
                                    <option value="Wafry">wafarly</option>
                                    <option value="VIP">VIP</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>تاريخ البداية *</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>عدد الأشهر</label>
                                <input type="number" name="durationMonths" value={formData.durationMonths} onChange={handleChange} min="1" max="12"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>أشهر مكافأة مجانية</label>
                            <input type="number" name="bonusFreeMonths" value={formData.bonusFreeMonths} onChange={handleChange} min="0" max="12"
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                        </div>
                    </div>
                )

            case 2: // Payment Info
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>المبلغ المدفوع *</label>
                                <input type="number" name="amountPaid" value={formData.amountPaid} onChange={handleChange} placeholder="2000" step="50" required
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>العملة</label>
                                <select name="currency" value={formData.currency} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                                    <option value="EGP">جنيه مصري (EGP)</option>
                                    <option value="USD">دولار أمريكي (USD)</option>
                                    <option value="AED">درهم إماراتي (AED)</option>
                                    <option value="SAR">ريال سعودي (SAR)</option>
                                    <option value="KWD">دينار كويتي (KWD)</option>
                                    <option value="EUR">يورو (EUR)</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>حساب الاستقبال</label>
                            <input type="text" name="receiveAccount" value={formData.receiveAccount} onChange={handleChange} placeholder="PayPal, بنك..."
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                        </div>
                        <div className="space-y-4">
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>لقطة الدفع</label>
                                <input type="file" onChange={(e) => handleFileChange('paymentScreenshot', e.target.files?.[0])} accept="image/*"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white' : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'}`} />
                                {fileNames.paymentScreenshot && <p className="text-xs text-green-500 mt-1">✓ {fileNames.paymentScreenshot}</p>}
                            </div>
                            <div className="form-group">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>لقطة الدردشة</label>
                                <input type="file" onChange={(e) => handleFileChange('chatScreenshot', e.target.files?.[0])} accept="image/*"
                                    className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 file:bg-teal-600 file:text-white' : 'bg-white border-gray-300 text-gray-900 file:bg-teal-500 file:text-white'}`} />
                                {fileNames.chatScreenshot && <p className="text-xs text-green-500 mt-1">✓ {fileNames.chatScreenshot}</p>}
                            </div>
                        </div>
                    </div>
                )

            case 3: // Confirmation
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="form-group">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="receiveTrainingPlan" checked={formData.receiveTrainingPlan} onChange={handleChange} className="w-4 h-4 text-teal-600 form-checkbox" />
                                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>تم استقبال الخطة التدريبية؟</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ملاحظات</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="ملاحظات إضافية..."
                                className={`w-full px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-teal-500 focus:outline-none`} />
                        </div>
                    </div>
                )

            default: return null
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

            {/* Steps */}
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
                            {loading ? 'جاري الحفظ...' : 'تسجيل الاشتراك ✅'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
