// ============================================
// src/pages/ClientsPage.jsx
// صفحة إدارة العملاء مع استيراد ذكي للبيانات
// ============================================

import { useState, useEffect } from 'react'
import { FaUserPlus, FaSearch, FaFileExcel, FaDownload, FaUpload, FaEye, FaTrash, FaEdit, FaExternalLinkAlt } from 'react-icons/fa'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'
import * as XLSX from 'xlsx'

export default function ClientsPage() {
    // 1. التهيئة من LocalStorage لاستعادة البيانات عند التحديث
    const [clients, setClients] = useState(() => {
        const saved = localStorage.getItem('clients_data')
        return saved ? JSON.parse(saved) : []
    })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedClient, setSelectedClient] = useState(null)
    const [editingClient, setEditingClient] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    // حفظ البيانات في LocalStorage عند أي تغيير
    useEffect(() => {
        localStorage.setItem('clients_data', JSON.stringify(clients))
        // Dispatch custom event for Sidebar to update
        window.dispatchEvent(new Event('clients-updated'))
    }, [clients])

    const handleDeleteAll = () => {
        if (window.confirm('هل أنت متأكد من حذف جميع العملاء؟ لا يمكن التراجع عن هذا الإجراء.')) {
            setClients([])
            localStorage.removeItem('clients_data')
            alert('تم حذف جميع البيانات بنجاح.')
        }
    }

    const handleDelete = (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
            setClients(prev => prev.filter(c => c.id !== id))
        }
    }

    const saveEditedClient = () => {
        if (!editingClient) return
        setClients(prev => prev.map(c => c.id === editingClient.id ? editingClient : c))
        setEditingClient(null)
        alert('تم حفظ التعديلات بنجاح!')
    }

    // ... (rest of code)

    // =========================================================================
    // 1. تعريف خريطة الحقول (Field Mapping)
    // هذا الكائن يربط بين اسم العمود في ملف الإكسل واسم المتغير في الكود
    // =========================================================================
    // دالة تطبيع للنصوص (إزالة المسافات والرموز وتوحيد الأحرف العربية) للمقارنة الذكية
    const normalizeKey = (key) => {
        if (!key) return ''
        let normalized = key.toString().replace(/[^\w\u0600-\u06FF]/g, '').toLowerCase()
        // توحيد الألفات (أ، إ، آ -> ا)
        normalized = normalized.replace(/[أإآ]/g, 'ا')
        // توحيد التاء المربوطة والهاء (ة -> ه)
        normalized = normalized.replace(/ة/g, 'ه')
        // توحيد الياء والألف المقصورة (ى -> ي)
        normalized = normalized.replace(/ى/g, 'ي')
        return normalized
    }

    const DATA_MAPPING = {
        // == Basic Info ==
        code: ['الكود', 'Code', 'Client Code'],
        name: ['الاسم', 'Name', 'Full Name', 'اسم العميل'],
        email: ['Email', 'البريد', 'الإلكتروني'],
        phone: ['التليفون', 'Phone', 'Mobile', 'الهاتف', 'رقم'],
        country: ['الدولة', 'Country'],
        age: ['السن', 'Age'],
        dob: ['تاريخ الميلاد', 'Birth', 'DOB'],
        gender: ['النوع', 'Gender', 'Sex'],
        job: ['الوظيفة', 'Job', 'Occupation', 'المهنة', 'عملك'],
        religion: ['الديانة', 'Religion'],

        // == Health & Stats ==
        weight: ['الوزن', 'Weight'],
        height: ['الطول', 'Height'],
        goal: ['هدفك', 'Goal', 'Target', 'الاشتراك'],
        healthIssues: ['مشاكل صحية', 'Health Issues', 'Medical', 'تعاني'],
        meds: ['أدوية', 'Medications', 'Drugs', 'تستخدم'],
        injuries: ['إصابات', 'Injuries'],
        smoker: ['مدخن', 'Smoker', 'Smoking', 'تدخين'],
        surgeries: ['عمليات', 'Surgeries'],
        tests: ['تحاليل', 'Tests', 'Blood Tests'],

        // == Nutrition ==
        dietHistory: ['نظام غذائي من قبل', 'Diet History', 'تجارب سابقة', 'التزمت'],
        activityLevel: ['طبيعة يومك', 'Activity', 'Effort', 'مجهود'],
        commitmentIssues: ['أسباب', 'Commitment', 'obstacles', 'الالتزام'],
        caffeine: ['منبهات', 'Caffeine', 'Coffee', 'Tea', 'مشروبات'],
        foodAllergy: ['حساسية', 'Allergies', 'Allergy'],
        dislikedFood: ['لا تحبه', 'Disliked', 'Hated', 'يحب'],
        vitamins: ['فيتامينات', 'Vitamins', 'Supplements'],
        mealsCount: ['عدد الوجبات', 'Meals', 'Count'],
        dietFlexibility: ['مرن', 'Flexibility', 'Flexible', 'قاسي'],
        budget: ['الميزانية', 'Budget'],
        proteinPref: ['البروتين', 'Protein'],
        carbPref: ['الكربوهيدرات', 'Carb'],
        fatsPref: ['الدهون', 'Fat'],
        lastDietFile: ['آخر نظام', 'Last Diet', 'Previous Diet'],

        // == Training ==
        trainingExp: ['تجربتك', 'Training Experience', 'History', 'خبرة'],
        trainingDuration: ['مدة ممارسة', 'Duration', 'How long'],
        otherSports: ['رياضة أخرى', 'Other Sports'],
        trainingLocation: ['مكان التمرين', 'Location', 'Gym'],
        tools: ['الأدوات', 'Tools', 'Equipment'],
        daysCount: ['عدد الأيام', 'Days Count'],
        availableDays: ['الأيام المتاحة', 'Available Days'],
        painfulExercises: ['تمارين تسبب', 'Painful', 'Injurious'],
        cardioPref: ['الكارديو', 'Cardio'],
        steps: ['خطوات', 'Steps'],

        // == Files & Images ==
        photoFront: ['أمام', 'Front', 'صورة 1', 'Image 1', 'Photo 1'],
        photoSide: ['جانب', 'Side', 'صورة 2', 'Image 2', 'Photo 2'],
        photoBack: ['خلف', 'Back', 'صورة 3', 'Image 3', 'Photo 3'],
        testsFile: ['صور التحاليل', 'Tests File', 'Lab Results', 'تحليل'],
        xrayFile: ['صور الأشعة', 'X-Ray', 'Scan', 'أشعة'],

        // == Other ==
        onlineCoachingExp: ['الأونلاين', 'Online', 'Coaching'],
        subscriptionReason: ['سبب الاشتراك', 'Why subscribe'],
        notes: ['ملاحظة', 'Notes', 'Additional'],
        timestamp: ['Timestamp', 'Time', 'الوقت']
    }

    // دالة لتحويل روابط Google Drive إلى روابط مباشرة للصـور
    const convertDriveLink = (link) => {
        if (!link) return ''
        if (typeof link !== 'string') return link

        // استخراج ID من روابط Google Drive المختلفة
        let id = ''
        const patterns = [
            /id=([a-zA-Z0-9_-]{25,})/,
            /\/d\/([a-zA-Z0-9_-]{25,})/,
            /open\?id=([a-zA-Z0-9_-]{25,})/
        ]

        for (const pattern of patterns) {
            const match = link.match(pattern)
            if (match && match[1]) {
                id = match[1]
                break
            }
        }

        if (id) {
            // تحويل لرابط معاينة مباشر يعمل في <img>
            return `https://uw-media.googleusercontent.com/u/0/drive-viewer/${id}`
            // ملاحظة: روابط googleusercontent قد تحتاج توكيلات أحياناً، الأفضل استخدام رابط التصدير للعرض:
            // return `https://drive.google.com/uc?export=view&id=${id}`
            // لكن رابط `uc?export=view` أحياناً يواجه مشاكل CORS في <img> tags.
            // الحل البديل والأكثر استقراراً للصور المصغرة:
            return `https://lh3.googleusercontent.com/d/${id}=s800`
        }

        return link
    }

    // دالة لتحويل تاريخ Excel (رقم تسلسلي) إلى تاريخ مقروء
    const excelDateToJSDate = (serial) => {
        if (!serial) return ''
        if (typeof serial === 'string') {
            // محاولة إصلاح التواريخ النصية المعكوسة أو بتنسيقات مختلفة
            return serial
        }
        // إذا كان رقم (Excel Serial)
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        return date_info.toLocaleDateString('ar-EG'); // يوم/شهر/سنة
    }

    // دالة مساعدة لاستخراج القيمة بذكاء فائق
    const getSmartValue = (rowObj, possibleKeys) => {
        if (!rowObj || !possibleKeys) return ''

        const rowKeys = Object.keys(rowObj)

        for (const key of possibleKeys) {
            const normalizedTarget = normalizeKey(key)

            // 1. البحث المطابق - Exact Match
            if (rowObj[key] !== undefined && rowObj[key] !== '') return rowObj[key]

            // 2. البحث بالتطبيع - Normalized Match
            const foundKey = rowKeys.find(k => normalizeKey(k) === normalizedTarget)
            if (foundKey && rowObj[foundKey] !== undefined && rowObj[foundKey] !== '') {
                return rowObj[foundKey]
            }

            // 3. البحث الجزئي - Partial Match (للأسئلة الطويلة)
            // نبحث عن العمود الذي يحتوي الكلمة المفتاحية في عنوانه
            const partialKey = rowKeys.find(k => k.includes(key) || normalizeKey(k).includes(normalizedTarget))
            if (partialKey && rowObj[partialKey] !== undefined && rowObj[partialKey] !== '') {
                return rowObj[partialKey]
            }
        }
        return ''
    }

    // تحميل البيانات (وهمي + Firebase مستقبلاً)
    useEffect(() => {
        // هنا يمكن تحميل البيانات من Firebase
        setLoading(false)
    }, [])

    // استيراد من Google Sheets (CSV)
    const importFromGoogleSheets = async () => {
        const userInput = prompt('أدخل رابط Google Sheets:\n(تأكد أن الملف "عام" Public)', '')
        if (!userInput) return

        let sheetUrl = userInput.trim()
        if (sheetUrl.includes('/edit')) {
            sheetUrl = sheetUrl.replace(/\/edit.*$/, '/gviz/tq?tqx=out:csv')
        } else if (!sheetUrl.includes('output=csv') && !sheetUrl.includes('out:csv')) {
            if (sheetUrl.includes('?')) sheetUrl += '&output=csv'
            else sheetUrl += '?output=csv'
        }

        try {
            setLoading(true)
            const response = await fetch(sheetUrl)
            if (!response.ok) throw new Error('فشل التحميل من الرابط')
            const csvText = await response.text()

            // تحويل CSV إلى JSON
            const workbook = XLSX.read(csvText, { type: 'string' })
            const sheetName = workbook.SheetNames[0]
            const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

            console.log('عينة من البيانات الخام (أول صف):', rawData[0])
            console.log('مفاتيح البيانات الخام:', rawData[0] ? Object.keys(rawData[0]) : 'لا يوجد بيانات')

            // معالجة البيانات وتحويلها حسب الـ Mapping
            const processedData = rawData.map((row, index) => {
                const clientObj = { id: `imp_${Date.now()}_${index}`, isNew: true }

                // المرور على كل مفتاح في الـ Mapping واستخراج قيمته
                Object.entries(DATA_MAPPING).forEach(([internalKey, possibleHeaders]) => {
                    let value = getSmartValue(row, possibleHeaders)

                    // معالجة خاصة للتواريخ
                    if (internalKey === 'dob' || internalKey === 'timestamp') {
                        value = excelDateToJSDate(value)
                    }

                    // معالجة خاصة للروابط (صور وملفات)
                    if (['photoFront', 'photoSide', 'photoBack', 'testsFile', 'xrayFile'].includes(internalKey)) {
                        value = convertDriveLink(value)
                    }

                    clientObj[internalKey] = value
                })

                // == تجميع الملفات في كائن منفصل (كما طلب المستخدم) ==
                clientObj.files = {
                    front: clientObj.photoFront,
                    side: clientObj.photoSide,
                    back: clientObj.photoBack,
                    tests: clientObj.testsFile,
                    xray: clientObj.xrayFile
                }

                return clientObj
            })

            console.log('Processed Clients:', processedData)
            setClients(prev => {
                const merged = [...prev]
                let newCount = 0
                let updatedCount = 0

                processedData.forEach(newClient => {
                    // البحث عن عميل موجود بنفس الكود أو نفس (الاسم + الهاتف)
                    const index = merged.findIndex(c =>
                        (c.code && String(c.code).trim() === String(newClient.code).trim()) ||
                        (c.phone && newClient.phone && c.phone.replace(/\D/g, '') === newClient.phone.replace(/\D/g, ''))
                    )

                    if (index > -1) {
                        // تحديث بيانات العميل الموجود
                        merged[index] = { ...merged[index], ...newClient, id: merged[index].id }
                        updatedCount++
                    } else {
                        // إضافة عميل جديد
                        merged.unshift(newClient)
                        newCount++
                    }
                })

                alert(`✅ تم اكتمال الاستيراد:\n- إضافة ${newCount} عميل جديد\n- تحديث ${updatedCount} عميل موجود`)
                return merged
            })

        } catch (error) {
            console.error(error)
            alert('حدث خطأ أثناء الاستيراد. تأكد من الرابط وصلاحيات الملف.')
        } finally {
            setLoading(false)
        }
    }

    // تصدير إلى Excel
    const exportToExcel = () => {
        // تحويل البيانات الداخلية إلى صيغة مناسبة للعرض في Excel (بالعربي)
        const exportData = clients.map(c => {
            const row = {}
            Object.entries(DATA_MAPPING).forEach(([key, headers]) => {
                // نستخدم أول اسم عربي كعنوان للعمود
                const headerName = headers[0]
                row[headerName] = c[key]
            })
            return row
        })

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'العملاء')
        XLSX.writeFile(wb, 'العملاء.xlsx')
    }

    // البحث
    const filteredClients = clients.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code?.toString().includes(searchTerm) ||
        c.phone?.includes(searchTerm)
    )

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">👥 العملاء</h1>
                    <p className="text-gray-600 dark:text-gray-400">قاعدة بيانات العملاء الشاملة</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={importFromGoogleSheets} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                        <FaUpload /> استيراد Sheets
                    </button>
                    <button onClick={exportToExcel} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                        <FaFileExcel /> تصدير Excel
                    </button>
                    {clients.length > 0 && (
                        <button onClick={handleDeleteAll} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                            <FaTrash /> حذف الكل
                        </button>
                    )}
                    <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition shadow-lg shadow-primary/20">
                        <FaUserPlus /> إضافة عميل
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm mb-6 border dark:border-gray-800">
                <div className="relative">
                    <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="بحث بالاسم، الكود، أو الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white transition"
                    />
                </div>
            </div>

            {/* Clients Grid/Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                    <div key={client.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold">
                                        {client.name ? client.name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-dark dark:text-white line-clamp-1">{client.name || 'بدون اسم'}</h3>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                            {client.code || 'بدون كود'}
                                        </span>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${client.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} title="الحالة"></div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                                <div className="flex justify-between">
                                    <span>📞 الهاتف:</span>
                                    <span dir="ltr">{client.phone || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>🎯 الهدف:</span>
                                    <span className="line-clamp-1 max-w-[150px]">{client.goal || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>⚖️ الوزن:</span>
                                    <span>{client.weight ? `${client.weight} كجم` : '-'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => setSelectedClient(client)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                                >
                                    <FaEye /> التفاصيل
                                </button>
                                <button
                                    onClick={() => setEditingClient(client)}
                                    className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition"
                                    title="تعديل"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(client.id)}
                                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                                    title="حذف"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Client Modal */}
            {editingClient && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-gray-700">
                        <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b dark:border-gray-800 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold dark:text-white">تعديل بيانات العميل</h2>
                            <button onClick={() => setEditingClient(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl">&times;</button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(DATA_MAPPING).map(([key, headers]) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {headers[headers.length - 1]} {/* Use the last Arabic label as descriptive label */}
                                    </label>
                                    <input
                                        type="text"
                                        value={editingClient[key] || ''}
                                        onChange={(e) => setEditingClient(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t dark:border-gray-800 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingClient(null)}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={saveEditedClient}
                                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow-lg shadow-primary/20"
                            >
                                حفظ التعديلات
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {filteredClients.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-xl">لا يوجد عملاء مطابقين للبحث</p>
                </div>
            )}

            {/* Modal: Client Details */}
            {selectedClient && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-gray-700">
                        <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b dark:border-gray-800 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-bold dark:text-white">{selectedClient.name}</h2>
                                <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                    <span>كود: {selectedClient.code}</span>
                                    <span>•</span>
                                    <span>{selectedClient.timestamp || 'تاريخ التسجيل غير متوفر'}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedClient(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl">&times;</button>
                        </div>

                        <div className="p-6 grid md:grid-cols-2 gap-8">
                            {/* قسم البيانات الشخصية */}
                            <section>
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">👤 بيانات شخصية</h3>
                                <div className="space-y-3">
                                    <DetailRow label="البريد الإلكتروني" value={selectedClient.email} />
                                    <DetailRow label="رقم الهاتف" value={selectedClient.phone} />
                                    <DetailRow label="النوع" value={selectedClient.gender} />
                                    <DetailRow label="تاريخ الميلاد" value={selectedClient.dob} />
                                    <DetailRow label="الدولة" value={selectedClient.country} />
                                    <DetailRow label="الوظيفة" value={selectedClient.job} />
                                    <DetailRow label="الديانة" value={selectedClient.religion} />
                                </div>
                            </section>

                            {/* قسم القياسات والصحة */}
                            <section>
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">🏥 الصحة والقياسات</h3>
                                <div className="space-y-3">
                                    <DetailRow label="الوزن الحالي" value={selectedClient.weight} />
                                    <DetailRow label="الطول" value={selectedClient.height} />
                                    <DetailRow label="هل تعاني من مشاكل صحية؟" value={selectedClient.healthIssues} />
                                    <DetailRow label="هل تستخدم أدوية؟" value={selectedClient.medications} />
                                    <DetailRow label="هل لديك إصابات؟" value={selectedClient.injuries} />
                                    <DetailRow label="هل أنت مدخن؟" value={selectedClient.smoker} />
                                    <DetailRow label="عمل تحاليل مؤخراً؟" value={selectedClient.didTests} />
                                    <FileLink label="ملف التحاليل" url={selectedClient.testsFile} />
                                    <FileLink label="ملف الأشعة" url={selectedClient.xrayFile} />
                                </div>
                            </section>

                            {/* قسم التغذية */}
                            <section>
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">🍎 التغذية</h3>
                                <div className="space-y-3">
                                    <DetailRow label="الهدف من الاشتراك" value={selectedClient.goal} />
                                    <DetailRow label="تاريخ الدايت السابق" value={selectedClient.dietHistory} />
                                    <DetailRow label="طبيعة اليوم والمجهود" value={selectedClient.dailyActivity} />
                                    <DetailRow label="أسباب عدم الالتزام" value={selectedClient.complianceIssues} />
                                    <DetailRow label="هل تشرب منبهات؟" value={selectedClient.caffeine} />
                                    <DetailRow label="حساسية من طعام" value={selectedClient.foodAllergies} />
                                    <DetailRow label="طعام لا تحبه" value={selectedClient.dislikedFood} />
                                    <DetailRow label="هل تريد فيتامينات؟" value={selectedClient.wantVitamins} />
                                    <DetailRow label="عدد الوجبات المفضل" value={selectedClient.mealsCount} />
                                    <DetailRow label="نوع النظام (مرن/قاسي)" value={selectedClient.dietType} />
                                    <DetailRow label="الميزانية" value={selectedClient.budget} />
                                    <DetailRow label="البروتين المفضل" value={selectedClient.favProtein} />
                                    <DetailRow label="الكربوهيدرات المفضلة" value={selectedClient.favCarbs} />
                                    <DetailRow label="الدهون المفضلة" value={selectedClient.favFats} />
                                    <FileLink label="ملف آخر دايت" url={selectedClient.lastDietFile} />
                                </div>
                            </section>

                            {/* قسم التمرين */}
                            <section>
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">💪 التمرين</h3>
                                <div className="space-y-3">
                                    <DetailRow label="الخبرة في التمرين" value={selectedClient.trainingExp} />
                                    <DetailRow label="مدة ممارسة الحديد" value={selectedClient.liftingDuration} />
                                    <DetailRow label="هل تمارس رياضة أخرى؟" value={selectedClient.otherSports} />
                                    <DetailRow label="مكان التمرين" value={selectedClient.gymLocation} />
                                    <DetailRow label="الأدوات المتاحة" value={selectedClient.availableTools} />
                                    <DetailRow label="عدد أيام التمرين" value={selectedClient.trainingDays} />
                                    <DetailRow label="الأيام المتاحة" value={selectedClient.availableDays} />
                                    <DetailRow label="تمارين تسبب ألم" value={selectedClient.painfulExercises} />
                                    <DetailRow label="الكارديو المفضل" value={selectedClient.favCardio} />
                                    <DetailRow label="متوسط خطوات اليوم" value={selectedClient.stepsCount} />
                                </div>
                            </section>

                            {/* معلومات إضافية */}
                            <section className="md:col-span-2">
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">ℹ️ معلومات إضافية</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <DetailRow label="تجربة سابقة أونلاين؟" value={selectedClient.onlineExp} />
                                    <DetailRow label="سبب الاشتراك معنا؟" value={selectedClient.joinReason} />
                                </div>
                            </section>

                            {/* ملاحظات */}
                            <section className="md:col-span-2">
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">📝 ملاحظات إضافية</h3>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                                    <p className="dark:text-gray-300 whitespace-pre-wrap">{selectedClient.notes || 'لا توجد ملاحظات إضافية'}</p>
                                </div>
                            </section>

                            {/* الصور */}
                            <section className="md:col-span-2">
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">📸 صور الجسم والملفات</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <ImageCard label="أمامية" url={selectedClient.files?.front || selectedClient.photoFront} />
                                    <ImageCard label="جانبية" url={selectedClient.files?.side || selectedClient.photoSide} />
                                    <ImageCard label="خلفية" url={selectedClient.files?.back || selectedClient.photoBack} />
                                </div>
                                <div className="mt-4 flex gap-4">
                                    <FileLink label="ملف التحاليل" url={selectedClient.files?.tests || selectedClient.testsFile} />
                                    <FileLink label="ملف الأشعة" url={selectedClient.files?.xray || selectedClient.xrayFile} />
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t dark:border-gray-800 flex justify-end">
                            <button
                                onClick={() => setSelectedClient(null)}
                                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function DetailRow({ label, value }) {
    // إزالة الشرط if (!value) return null لضمان ظهور الحقل دائماً
    return (
        <div className="flex gap-2 py-1 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition px-2 rounded">
            <span className="font-semibold text-gray-700 dark:text-gray-400 min-w-[140px] text-sm">{label}:</span>
            <span className="text-gray-900 dark:text-gray-200 break-words flex-1 text-sm">{value || <span className="text-gray-400 text-xs italic">غير محدد</span>}</span>
        </div>
    )
}

function FileLink({ label, url }) {
    if (!url) return <DetailRow label={label} value="لا يوجد ملف" />
    return (
        <div className="flex gap-2 py-1 border-b border-gray-100 dark:border-gray-800 px-2">
            <span className="font-semibold text-gray-700 dark:text-gray-400 min-w-[140px] text-sm">{label}:</span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-sm">
                <FaExternalLinkAlt className="text-xs" /> عرض الملف
            </a>
        </div>
    )
}

function ImageCard({ label, url }) {
    if (!url) return null

    // Handling image load error
    const handleError = (e) => {
        e.target.style.display = 'none'
        e.target.nextSibling.style.display = 'flex'
    }

    return (
        <div className="text-center group">
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700 mb-2 relative">
                <img
                    src={url}
                    alt={label}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={handleError}
                />

                {/* Fallback link if image fails or for easy access */}
                <div
                    className="absolute inset-0 bg-black/60 flex-col items-center justify-center hidden hover:flex"
                    style={{ display: 'none' }} // Initially hidden, logic handles via display manipulation or pure CSS
                >
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-white text-xs underline">
                        عرض الرابط
                    </a>
                </div>

                {/* Fallback to show if img fails */}
                <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400 p-2">
                    <span className="text-2xl mb-1">⚠️</span>
                    <span className="text-xs text-center">تعذر تحميل الصورة</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs mt-2 underline z-10">
                        فتح الرابط
                    </a>
                </div>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
        </div>
    )
}
