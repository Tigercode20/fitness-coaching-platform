// ============================================
// src/pages/ClientForm.jsx
// فورم استقبال عميل جديد (شامل - 50 حقل)
// ============================================

import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../services/firebase'
import { savePendingForm } from '../services/pendingFormService'

export default function ClientForm() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        // معلومات شخصية
        fullName: '',
        email: '',
        phone: '',
        country: '',
        religion: '',
        gender: '',
        dob: '',
        job: '',

        // البيانات الجسدية
        weight: '',
        height: '',

        // الأهداف والاشتراك
        goal: '',
        subscriptionReason: '',

        // الصور
        frontImageUrl: '',
        sideImageUrl: '',
        backImageUrl: '',

        // الصحة
        healthIssues: '',
        labTest: '',
        medications: '',
        injuries: '',
        smoker: '',

        // الملفات الطبية
        labFileUrl: '',
        xrayFileUrl: '',

        // النظام الغذائي السابق
        previousDiet: '',
        dayNature: '',
        nonAdherenceReasons: '',
        stimulants: '',
        previousDietFileUrl: '',

        // التفضيلات الغذائية
        foodAllergies: '',
        dislikedFood: '',
        vitamins: '',
        mealsCount: '',
        dietType: '',
        budget: '',
        favoriteProtein: '',
        favoriteCarbs: '',
        favoriteFats: '',

        // التمرين
        exerciseExperience: '',
        weightTrainingDuration: '',
        otherSports: '',
        gymLocation: '',
        availableTools: '',
        trainingDays: '',
        availableDays: '',
        painExercises: '',
        cardioType: '',
        dailySteps: '',

        // تجربة أونلاين
        onlineExperience: '',
        additionalNotes: ''
    })

    // ✅ حل مشكلة الصور - تحميل الصور بشكل آمن
    const handleImageUpload = async (e, imageType) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            console.log(`🖼️ بدء رفع صورة ${imageType}...`)

            // التحقق من نوع الملف
            if (!file.type.startsWith('image/')) {
                alert('❌ الرجاء اختيار صورة فقط!')
                return
            }

            // التحقق من حجم الملف (أقل من 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('❌ حجم الصورة كبير جداً (يجب أن يكون أقل من 5MB)')
                return
            }

            // رفع الصورة إلى Firebase Storage
            const timestamp = Date.now()
            const storagePath = `client-images/${timestamp}-${imageType}-${file.name}`
            const storageRef = ref(storage, storagePath)

            console.log(`📤 رفع الملف إلى: ${storagePath}`)

            const uploadResult = await uploadBytes(storageRef, file)
            console.log(`✅ تم رفع الملف:`, uploadResult)

            // الحصول على رابط التحميل
            const downloadURL = await getDownloadURL(storageRef)
            console.log(`🔗 رابط التحميل: ${downloadURL}`)

            // تحديث الـ state
            const fieldName = `${imageType}ImageUrl`
            setFormData(prev => ({
                ...prev,
                [fieldName]: downloadURL
            }))

            alert(`✅ تم رفع صورة ${imageType} بنجاح!`)
        } catch (error) {
            console.error(`❌ خطأ في رفع ${imageType}:`, error)
            alert(`❌ خطأ في رفع الصورة: ${error.message}`)
        }
    }

    // معالجة الملفات الأخرى (PDF, Excel)
    const handleFileUpload = async (e, fileType) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            console.log(`📄 بدء رفع ملف ${fileType}...`)

            if (file.size > 10 * 1024 * 1024) {
                alert('❌ حجم الملف كبير جداً (يجب أن يكون أقل من 10MB)')
                return
            }

            const timestamp = Date.now()
            const storagePath = `client-files/${timestamp}-${fileType}-${file.name}`
            const storageRef = ref(storage, storagePath)

            const uploadResult = await uploadBytes(storageRef, file)
            const downloadURL = await getDownloadURL(storageRef)

            const fieldName = `${fileType}FileUrl`
            setFormData(prev => ({
                ...prev,
                [fieldName]: downloadURL
            }))

            alert(`✅ تم رفع الملف بنجاح!`)
        } catch (error) {
            console.error(`❌ خطأ في رفع ملف ${fileType}:`, error)
            alert(`❌ خطأ: ${error.message}`)
        }
    }

    // معالجة تغيير الـ inputs العادية
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // معالجة الـ select و checkbox
    const handleSelectChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // حفظ الفورم
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            console.log('📋 بدء حفظ الفورم...', formData)

            // تنظيف البيانات
            const formDataToSave = Object.entries(formData).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = value
                }
                return acc
            }, {})

            console.log('🧹 البيانات بعد التنظيف:', formDataToSave)

            // إضافة البيانات الإضافية
            const finalData = {
                ...formDataToSave,
                createdAt: new Date().toISOString(),
                status: 'pending',
                language: 'ar'
            }

            console.log('📦 البيانات النهائية للحفظ:', finalData)

            // Use the service directly
            await savePendingForm(finalData, 'client')

            alert('✅ تم حفظ الفورم بنجاح! سيتم مراجعته قريباً')

            // إعادة تعيين الفورم (Reset all fields)
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                country: '',
                religion: '',
                gender: '',
                dob: '',
                job: '',
                weight: '',
                height: '',
                goal: '',
                subscriptionReason: '',
                frontImageUrl: '',
                sideImageUrl: '',
                backImageUrl: '',
                healthIssues: '',
                labTest: '',
                medications: '',
                injuries: '',
                smoker: '',
                labFileUrl: '',
                xrayFileUrl: '',
                previousDiet: '',
                dayNature: '',
                nonAdherenceReasons: '',
                stimulants: '',
                previousDietFileUrl: '',
                foodAllergies: '',
                dislikedFood: '',
                vitamins: '',
                mealsCount: '',
                dietType: '',
                budget: '',
                favoriteProtein: '',
                favoriteCarbs: '',
                favoriteFats: '',
                exerciseExperience: '',
                weightTrainingDuration: '',
                otherSports: '',
                gymLocation: '',
                availableTools: '',
                trainingDays: '',
                availableDays: '',
                painExercises: '',
                cardioType: '',
                dailySteps: '',
                onlineExperience: '',
                additionalNotes: ''
            })
            window.scrollTo(0, 0)
        } catch (error) {
            console.error('❌ خطأ:', error)
            alert(`❌ خطأ: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-6 max-w-4xl mx-auto mb-20">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">نموذج تسجيل عميل جديد</h1>

            {/* ========== المعلومات الشخصية ========== */}
            <section className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-blue-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-blue-400">📋 المعلومات الشخصية</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    {/* الاسم */}
                    <div>
                        <label className="block font-bold mb-2">الاسم الكامل *</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>

                    {/* البريد */}
                    <div>
                        <label className="block font-bold mb-2">البريد الإلكتروني *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>

                    {/* التليفون */}
                    <div>
                        <label className="block font-bold mb-2">رقم التليفون *</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>

                    {/* الدولة */}
                    <div>
                        <label className="block font-bold mb-2">الدولة</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    {/* الديانة */}
                    <div>
                        <label className="block font-bold mb-2">الديانة</label>
                        <input
                            type="text"
                            name="religion"
                            value={formData.religion}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    {/* النوع */}
                    <div>
                        <label className="block font-bold mb-2">النوع</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleSelectChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">اختر...</option>
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                        </select>
                    </div>

                    {/* تاريخ الميلاد */}
                    <div>
                        <label className="block font-bold mb-2">تاريخ الميلاد</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    {/* الوظيفة */}
                    <div>
                        <label className="block font-bold mb-2">الوظيفة</label>
                        <input
                            type="text"
                            name="job"
                            value={formData.job}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>
            </section>

            {/* ========== البيانات الجسدية ========== */}
            <section className="bg-green-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-green-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-green-400">📏 البيانات الجسدية</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <div>
                        <label className="block font-bold mb-2">الوزن (كجم) *</label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-2">الطول (سم) *</label>
                        <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>
                </div>
            </section>

            {/* ========== الأهداف ========== */}
            <section className="bg-indigo-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-indigo-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-indigo-400">🎯 الأهداف</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                        <label className="block font-bold mb-2">هدفك من الاشتراك</label>
                        <textarea
                            name="goal"
                            value={formData.goal}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded h-20 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">سبب الاشتراك (لماذا الآن؟)</label>
                        <textarea
                            name="subscriptionReason"
                            value={formData.subscriptionReason}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded h-20 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>
            </section>

            {/* ========== الصور ========== */}
            <section className="bg-purple-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-purple-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-purple-400">📸 الصور (أمامية - جانبية - خلفية)</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700 dark:text-gray-300">
                    {/* صورة أمامية */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                        <label className="block font-bold mb-2">صورة أمامية *</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'front')}
                            className="w-full"
                            required
                        />
                        {formData.frontImageUrl && (
                            <div className="mt-3">
                                <img
                                    src={formData.frontImageUrl}
                                    alt="Front"
                                    className="w-full h-48 object-cover rounded border-2 border-green-500"
                                />
                                <p className="text-green-600 text-sm mt-2">✅ صورة مرفوعة</p>
                            </div>
                        )}
                    </div>

                    {/* صورة جانبية */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                        <label className="block font-bold mb-2">صورة جانبية *</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'side')}
                            className="w-full"
                            required
                        />
                        {formData.sideImageUrl && (
                            <div className="mt-3">
                                <img
                                    src={formData.sideImageUrl}
                                    alt="Side"
                                    className="w-full h-48 object-cover rounded border-2 border-green-500"
                                />
                                <p className="text-green-600 text-sm mt-2">✅ صورة مرفوعة</p>
                            </div>
                        )}
                    </div>

                    {/* صورة خلفية */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                        <label className="block font-bold mb-2">صورة خلفية *</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'back')}
                            className="w-full"
                            required
                        />
                        {formData.backImageUrl && (
                            <div className="mt-3">
                                <img
                                    src={formData.backImageUrl}
                                    alt="Back"
                                    className="w-full h-48 object-cover rounded border-2 border-green-500"
                                />
                                <p className="text-green-600 text-sm mt-2">✅ صورة مرفوعة</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ========== الصحة الطبية ========== */}
            <section className="bg-red-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-red-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-red-400">⚕️ الصحة الطبية</h2>

                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                        <label className="block font-bold mb-2">هل تعاني من مشاكل صحية؟</label>
                        <textarea
                            name="healthIssues"
                            value={formData.healthIssues}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded h-20 dark:bg-gray-700 dark:border-gray-600"
                            placeholder="وصف المشاكل الصحية إن وجدت..."
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-2">هل قمت بعمل تحاليل مؤخراً؟</label>
                        <select
                            name="labTest"
                            value={formData.labTest}
                            onChange={handleSelectChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">اختر...</option>
                            <option value="yes">نعم</option>
                            <option value="no">لا</option>
                        </select>
                    </div>

                    {formData.labTest === 'yes' && (
                        <div>
                            <label className="block font-bold mb-2">ملف التحاليل</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileUpload(e, 'lab')}
                                className="w-full"
                            />
                            {formData.labFileUrl && <p className="text-green-600 mt-2">✅ ملف مرفوع</p>}
                        </div>
                    )}

                    <div>
                        <label className="block font-bold mb-2">هل تستخدم أدوية؟</label>
                        <select
                            name="medications"
                            value={formData.medications}
                            onChange={handleSelectChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">اختر...</option>
                            <option value="yes">نعم</option>
                            <option value="no">لا</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-bold mb-2">هل لديك إصابات؟</label>
                        <textarea
                            name="injuries"
                            value={formData.injuries}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded h-16 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    {formData.injuries && (
                        <div>
                            <label className="block font-bold mb-2">ملف الأشعة (إن وجد)</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileUpload(e, 'xray')}
                                className="w-full"
                            />
                            {formData.xrayFileUrl && <p className="text-green-600 mt-2">✅ ملف مرفوع</p>}
                        </div>
                    )}

                    <div>
                        <label className="block font-bold mb-2">هل أنت مدخن؟</label>
                        <select
                            name="smoker"
                            value={formData.smoker}
                            onChange={handleSelectChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">اختر...</option>
                            <option value="yes">نعم</option>
                            <option value="no">لا</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* ========== النظام الغذائي السابق ========== */}
            <section className="bg-orange-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-orange-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-orange-400">🥗 النظام الغذائي السابق</h2>

                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                        <label className="block font-bold mb-2">هل التزمت بنظام غذائي من قبل؟</label>
                        <select
                            name="previousDiet"
                            value={formData.previousDiet}
                            onChange={handleSelectChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">اختر...</option>
                            <option value="yes">نعم</option>
                            <option value="no">لا</option>
                        </select>
                    </div>

                    {formData.previousDiet === 'yes' && (
                        <>
                            <div>
                                <label className="block font-bold mb-2">طبيعة يومك ومجهودك</label>
                                <textarea
                                    name="dayNature"
                                    value={formData.dayNature}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded h-16 dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="صف طبيعة عملك والمجهود البدني..."
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2">أسباب عدم الالتزام</label>
                                <textarea
                                    name="nonAdherenceReasons"
                                    value={formData.nonAdherenceReasons}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded h-16 dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="ما سبب عدم التزامك بالنظام؟"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2">ملف النظام الغذائي السابق</label>
                                <input
                                    type="file"
                                    onChange={(e) => handleFileUpload(e, 'previousDiet')}
                                    className="w-full"
                                />
                                {formData.previousDietFileUrl && <p className="text-green-600 mt-2">✅ ملف مرفوع</p>}
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block font-bold mb-2">هل تشرب منبهات (شاي/قهوة)؟</label>
                        <select
                            name="stimulants"
                            value={formData.stimulants}
                            onChange={handleSelectChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">اختر...</option>
                            <option value="yes">نعم</option>
                            <option value="no">لا</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* ========== التفضيلات الغذائية ========== */}
            <section className="bg-yellow-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-yellow-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-yellow-400">🍽️ التفضيلات الغذائية</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4 md:space-y-0 text-gray-700 dark:text-gray-300">
                    <div>
                        <label className="block font-bold mb-2">هل لديك حساسية طعام؟</label>
                        <textarea
                            name="foodAllergies"
                            value={formData.foodAllergies}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded h-16 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-2">طعام لا تحبه إطلاقاً</label>
                        <textarea
                            name="dislikedFood"
                            value={formData.dislikedFood}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded h-16 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-2">هل تريد فيتامينات؟</label>
                        <select
                            name="vitamins"
                            value={formData.vitamins}
                            onChange={handleSelectChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">اختر...</option>
                            <option value="yes">نعم</option>
                            <option value="no">لا</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-bold mb-2">عدد الوجبات اليومية</label>
                        <input
                            type="number"
                            name="mealsCount"
                            value={formData.mealsCount}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-2">نوع النظام</label>
                        <select
                            name="dietType"
                            value={formData.dietType}
                            onChange={handleSelectChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">اختر...</option>
                            <option value="flexible">مرن</option>
                            <option value="strict">قاسي</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-bold mb-2">الميزانية المتوفرة</label>
                        <input
                            type="text"
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <h3 className="font-bold mb-2">الأطعمة المفضلة</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                name="favoriteProtein"
                                placeholder="البروتين المفضل"
                                value={formData.favoriteProtein}
                                onChange={handleInputChange}
                                className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                            <input
                                type="text"
                                name="favoriteFats"
                                placeholder="الدهون المفضلة"
                                value={formData.favoriteFats}
                                onChange={handleInputChange}
                                className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                            <input
                                type="text"
                                name="favoriteCarbs"
                                placeholder="الكربوهيدرات المفضلة"
                                value={formData.favoriteCarbs}
                                onChange={handleInputChange}
                                className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== التمرين ========== */}
            <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-400">🏋️ التمرين</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <div>
                        <label className="block font-bold mb-2">خبرتك في التمرين</label>
                        <input
                            type="text"
                            name="exerciseExperience"
                            value={formData.exerciseExperience}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">مدة ممارسة الحديد</label>
                        <input
                            type="text"
                            name="weightTrainingDuration"
                            value={formData.weightTrainingDuration}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">هل تمارس رياضة أخرى؟</label>
                        <input
                            type="text"
                            name="otherSports"
                            value={formData.otherSports}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">مكان التمرين (الجيم)</label>
                        <input
                            type="text"
                            name="gymLocation"
                            value={formData.gymLocation}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">الأدوات المتاحة</label>
                        <input
                            type="text"
                            name="availableTools"
                            value={formData.availableTools}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">عدد أيام التمرين</label>
                        <input
                            type="number"
                            name="trainingDays"
                            value={formData.trainingDays}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">الأيام المتاحة</label>
                        <input
                            type="text"
                            name="availableDays"
                            value={formData.availableDays}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">تمارين تسبب ألم</label>
                        <input
                            type="text"
                            name="painExercises"
                            value={formData.painExercises}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">نوع الكارديو المفضل</label>
                        <input
                            type="text"
                            name="cardioType"
                            value={formData.cardioType}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">عدد الخطوات اليومية</label>
                        <input
                            type="number"
                            name="dailySteps"
                            value={formData.dailySteps}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>
            </section>

            {/* ========== إضافي ========== */}
            <section className="bg-teal-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-teal-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-teal-400">📝 معلومات إضافية</h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div>
                        <label className="block font-bold mb-2">تجربتك مع الأونلاين كوتشينج</label>
                        <textarea
                            name="onlineExperience"
                            value={formData.onlineExperience}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded h-20 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">ملاحظات إضافية</label>
                        <textarea
                            name="additionalNotes"
                            value={formData.additionalNotes}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded h-20 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>
            </section>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold text-xl hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center"
            >
                {loading ? 'جاري الحفظ...' : '✅ حفظ وإرسال الفورم'}
            </button>
        </form>
    )
}
