import { useState } from 'react'
import Parse from '../services/back4app'
import { savePendingForm } from '../services/pendingFormService'

import ThemeToggle from '../components/Common/ThemeToggle'

export default function ClientUpdateForm() {
    const [step, setStep] = useState(1) // 1: Code, 2: Selection, 3: Questions
    const [loading, setLoading] = useState(false)
    const [clientCode, setClientCode] = useState('')
    const [clientData, setClientData] = useState(null)
    const [renewals, setRenewals] = useState({ training: false, nutrition: false })
    const [formData, setFormData] = useState({
        // Common
        currentWeight: '',

        // Training
        workoutDays: '4',
        workoutLocation: 'gym',
        weakPoints: '',
        injuries: '',
        activityLevel: '',
        // Images (Common)
        frontImage: '',
        sideImage: '',
        backImage: '',

        // Nutrition
        dietAdherence: '',
        isHungry: '',
        dietNotes: '',
        changeFoodTypes: '',
        scalePhoto: ''
    })

    const handleVerifyCode = async () => {
        setLoading(true)
        try {
            // Normalization Logic:
            // 1. Remove all spaces
            // 2. Convert to uppercase
            // 3. Add 'C-' prefix if missing
            let normalizedCode = clientCode.replace(/\s+/g, '').toUpperCase();
            if (!normalizedCode.startsWith('C-') && /^\d+$/.test(normalizedCode)) {
                normalizedCode = 'C-' + normalizedCode;
            }

            console.log('Normalized Code:', normalizedCode); // Debugging

            const Client = Parse.Object.extend('Client')
            const query = new Parse.Query(Client)
            query.equalTo('ClientCode', normalizedCode)
            const client = await query.first()

            if (client) {
                setClientData({
                    id: client.id,
                    fullName: client.get('FullName'),
                    firstName: client.get('FirstName') || client.get('FullName').split(' ')[0], // Fallback
                    otherNames: client.get('FullName').split(' ').slice(1)
                })
                setStep(2)
            } else {
                alert('🚫 كود العميل غير صحيح')
            }
        } catch (error) {
            console.error(error)
            alert('حدث خطأ في التحقق')
        } finally {
            setLoading(false)
        }
    }

    const maskName = () => {
        if (!clientData) return ''
        const parts = clientData.fullName.trim().split(/\s+/)
        const first = parts[0]
        const second = parts[1] ? (parts[1].charAt(0) + '****') : ''
        const third = parts[2] ? (parts[2].charAt(1) || parts[2].charAt(0)) + '****' : ''

        return `${first} ${second} ${third}`
    }

    const handleImageUpload = async (e, fieldName) => {
        const file = e.target.files[0]
        if (!file) return

        setLoading(true)
        try {
            const name = `${Date.now()}_${fieldName}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
            const parseFile = new Parse.File(name, file)
            const savedFile = await parseFile.save()
            setFormData(prev => ({ ...prev, [fieldName]: savedFile.url() }))
            alert('✅ تم رفع الصورة بنجاح')
        } catch (error) {
            console.error(error)
            alert('فشل رفع الصورة')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!renewals.training && !renewals.nutrition) {
            alert('يرجى اختيار نوع المتابعة (تدريب أو تغذية)')
            return
        }

        setLoading(true)
        try {
            const dataToSave = {
                clientPointer: { __type: 'Pointer', className: 'Client', objectId: clientData.id },
                clientCode: clientCode,
                clientName: clientData.fullName,
                type: 'update',
                renewTraining: renewals.training,
                renewNutrition: renewals.nutrition,
                ...formData,
                status: 'pending',
                createdAt: new Date().toISOString()
            }

            await savePendingForm(dataToSave, 'update')
            alert('✅ تم إرسال تحديث البيانات بنجاح!')
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert('حدث خطأ في الإرسال')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center font-sans transition-colors duration-300" dir="rtl">
            <div className="fixed top-4 left-4 z-50">
                <ThemeToggle />
            </div>
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-blue-600 p-6 text-white text-center">
                    <h1 className="text-2xl font-bold">نموذج متابعة العميل 📊</h1>
                    <p className="opacity-90 text-sm mt-2">تحديث بيانات التدريب والتغذية</p>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                                كود العميل (Client Code)
                            </label>
                            <input
                                type="text"
                                value={clientCode}
                                onChange={(e) => setClientCode(e.target.value)}
                                className="w-full p-4 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-0 uppercase placeholder-gray-300"
                                placeholder="C-XXXX"
                            />
                            <button
                                onClick={handleVerifyCode}
                                disabled={loading || !clientCode}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? 'جاري التحقق...' : 'التحقق من الكود'}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="text-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">أهلاً بك يا بطل 🏆</p>
                                <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                                    {maskName()}
                                </h2>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg mb-4 dark:text-white">ماذا تريد أن تجدد؟</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${renewals.training ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={renewals.training}
                                            onChange={(e) => setRenewals(prev => ({ ...prev, training: e.target.checked }))}
                                        />
                                        <span className="text-3xl">🏋️</span>
                                        <span className="font-bold dark:text-gray-200">نظام التدريب</span>
                                    </label>

                                    <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${renewals.nutrition ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={renewals.nutrition}
                                            onChange={(e) => setRenewals(prev => ({ ...prev, nutrition: e.target.checked }))}
                                        />
                                        <span className="text-3xl">🍎</span>
                                        <span className="font-bold dark:text-gray-200">نظام التغذية</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                >
                                    ⬅️ رجوع
                                </button>
                                <button
                                    onClick={() => {
                                        if (renewals.training || renewals.nutrition) setStep(3)
                                        else alert('يرجى اختيار نوع واحد على الأقل')
                                    }}
                                    className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition"
                                >
                                    التالي ⬅️
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                            {/* Common */}
                            <div>
                                <label className="block font-bold mb-2 dark:text-white">الوزن الحالي (كجم)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.currentWeight}
                                    onChange={(e) => setFormData(prev => ({ ...prev, currentWeight: e.target.value }))}
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            {/* Training Section */}
                            {renewals.training && (
                                <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">🏋️ تحديث التدريب</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block font-bold mb-2 dark:text-white">عدد أيام التمرين في الأسبوع؟</label>
                                            <div className="flex gap-4 overflow-x-auto pb-2">
                                                {[3, 4, 5, 6].map(num => (
                                                    <label key={num} className={`flex-1 min-w-[60px] cursor-pointer text-center p-3 rounded-lg border transition ${formData.workoutDays == num ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}>
                                                        <input
                                                            type="radio"
                                                            name="workoutDays"
                                                            value={num}
                                                            checked={formData.workoutDays == num}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, workoutDays: e.target.value }))}
                                                            className="hidden"
                                                        />
                                                        {num} أيام
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block font-bold mb-2 dark:text-white">مكان التمرين؟</label>
                                            <select
                                                className="w-full p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                value={formData.workoutLocation}
                                                onChange={(e) => setFormData(prev => ({ ...prev, workoutLocation: e.target.value }))}
                                            >
                                                <option value="gym">الجيم (Gym)</option>
                                                <option value="home">المنزل (Home)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block font-bold mb-2 dark:text-white">نقاط ضعف تريد التركيز عليها؟</label>
                                            <textarea
                                                className="w-full p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                value={formData.weakPoints}
                                                onChange={(e) => setFormData(prev => ({ ...prev, weakPoints: e.target.value }))}
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-bold mb-2 dark:text-white">هل لديك أي إصابات؟</label>
                                            <textarea
                                                className="w-full p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="اكتب 'لا يوجد' إذا كنت سليماً"
                                                value={formData.injuries}
                                                onChange={(e) => setFormData(prev => ({ ...prev, injuries: e.target.value }))}
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-bold mb-2 dark:text-white">صورة للجسم (Physique Update)</label>
                                            <p className="text-sm text-gray-500 mb-2">يرجى رفع الصور في القسم المخصص بالأسفل 👇</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Nutrition Section */}
                            {renewals.nutrition && (
                                <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">🍎 تحديث التغذية</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block font-bold mb-2 dark:text-white">هل التزمت بالدايت السابق؟ (نسبة مئوية)</label>
                                            <input
                                                type="text"
                                                placeholder="مثلاً: 80%"
                                                className="w-full p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                value={formData.dietAdherence}
                                                onChange={(e) => setFormData(prev => ({ ...prev, dietAdherence: e.target.value }))}
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-bold mb-2 dark:text-white">هل تشعر بالجوع؟</label>
                                            <select
                                                className="w-full p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                value={formData.isHungry}
                                                onChange={(e) => setFormData(prev => ({ ...prev, isHungry: e.target.value }))}
                                            >
                                                <option value="">اختر...</option>
                                                <option value="yes">نعم، كثيراً</option>
                                                <option value="sometimes">أحياناً</option>
                                                <option value="no">لا، شبعان تماماً</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block font-bold mb-2 dark:text-white">تريد تغيير أنواع الأكل؟</label>
                                            <textarea
                                                className="w-full p-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="اكتب التغييرات التي تريدها..."
                                                value={formData.changeFoodTypes}
                                                onChange={(e) => setFormData(prev => ({ ...prev, changeFoodTypes: e.target.value }))}
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-bold mb-2 dark:text-white">صورة الميزان (اختياري)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'scalePhoto')}
                                                className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-green-50 file:text-green-700
                                                    hover:file:bg-green-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Common: Physique Photos */}
                            <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">📷 صور الجسم (Front, Side, Back)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { key: 'frontImage', label: 'صورة أمامية' },
                                        { key: 'sideImage', label: 'صورة جانبية' },
                                        { key: 'backImage', label: 'صورة خلفية' }
                                    ].map(img => (
                                        <div key={img.key} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                            <label className="block font-bold mb-2 dark:text-white">{img.label}</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, img.key)}
                                                className="hidden"
                                                id={`upload-${img.key}`}
                                            />
                                            <label htmlFor={`upload-${img.key}`} className="cursor-pointer block">
                                                {formData[img.key] ? (
                                                    <div className="text-green-600 font-bold">
                                                        ✅ تم الرفع
                                                        <img src={formData[img.key]} alt={img.label} className="h-20 w-auto mx-auto mt-2 rounded" />
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-400 hover:text-blue-500 transition">
                                                        📤 اضغط للرفع
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                    >
                                        ⬅️ رجوع
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition transform hover:-translate-y-1 disabled:opacity-50"
                                    >
                                        {loading ? 'جاري الإرسال...' : 'إرسال التحديث ✅'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
