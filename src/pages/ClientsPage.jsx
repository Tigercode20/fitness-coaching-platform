// ============================================
// src/pages/ClientsPage.jsx
// صفحة إدارة العملاء مع استيراد ذكي للبيانات
// ============================================

import { useState, useEffect } from 'react'
import { FaUserPlus, FaSearch, FaFileExcel, FaDownload, FaUpload, FaEye, FaTrash, FaEdit, FaExternalLinkAlt, FaSync, FaTimes, FaCloudUploadAlt } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import { getAllClients, deleteClient, updateClient, addNewClient } from '../services/clientService'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function ClientsPage() {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedClient, setSelectedClient] = useState(null)
    const [editingClient, setEditingClient] = useState(null)
    const [filesToUpload, setFilesToUpload] = useState({}) // Store files locally before upload

    // Load Clients from Firestore
    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            setLoading(true)
            const data = await getAllClients()
            setClients(data)
        } catch (error) {
            console.error("Error fetching clients:", error)
            alert("خطأ في تحميل العملاء")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAll = async () => {
        if (window.confirm('WARNING: This will delete ALL clients from the database. Are you sure?')) {
            // Safety mechanism: Maybe don't implement bulk delete yet or loop delete
            alert('Bulk delete is disabled for safety.')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
            try {
                await deleteClient(id)
                setClients(prev => prev.filter(c => c.id !== id))
            } catch (error) {
                console.error("Error deleting client:", error)
                alert("فشل الحذف")
            }
        }
    }

    const saveEditedClient = async () => {
        if (!editingClient) return
        try {
            // Show simple loading indicator if needed (or rely on UI blocking)
            const confirmSave = window.confirm('هل أنت متأكد من حفظ التعديلات؟')
            if (!confirmSave) return

            let updatedClient = { ...editingClient }

            // Upload files if any
            if (Object.keys(filesToUpload).length > 0) {
                const storage = getStorage()
                for (const [key, file] of Object.entries(filesToUpload)) {
                    try {
                        const fileRef = ref(storage, `clients/${updatedClient.id}/${key}_${Date.now()}_${file.name}`)
                        await uploadBytes(fileRef, file)
                        const url = await getDownloadURL(fileRef)
                        updatedClient[key] = url
                    } catch (uploadError) {
                        console.error(`Error uploading ${key}:`, uploadError)
                        alert(`فشل رفع الملف: ${key}`)
                        return // Stop save if upload fails
                    }
                }
            }

            await updateClient(editingClient.id, updatedClient)
            setClients(prev => prev.map(c => c.id === editingClient.id ? updatedClient : c))
            setEditingClient(null)
            setFilesToUpload({})
            alert('تم حفظ التعديلات بنجاح!')
        } catch (error) {
            console.error("Error updating client:", error)
            alert("فشل الحفظ")
        }
    }

    const handleFileChange = (e, key) => {
        if (e.target.files && e.target.files[0]) {
            setFilesToUpload(prev => ({ ...prev, [key]: e.target.files[0] }))
        }
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
        ClientCode: ['الكود', 'Code', 'Client Code'],
        FullName: ['الاسم', 'Name', 'Full Name', 'اسم العميل'],
        Email: ['Email', 'البريد', 'الإلكتروني'],
        PhoneNumber: ['التليفون', 'Phone', 'Mobile', 'الهاتف', 'رقم'],
        Country: ['الدولة', 'Country'],
        Age: ['السن', 'Age'],
        DOB: ['تاريخ الميلاد', 'Birth', 'DOB'],
        Gender: ['النوع', 'Gender', 'Sex'],
        Job: ['الوظيفة', 'Job', 'Occupation', 'المهنة', 'عملك'],
        Religion: ['الديانة', 'Religion'],

        // == Health & Stats ==
        Weight: ['الوزن', 'Weight'],
        Height: ['الطول', 'Height'],
        Goal: ['هدفك', 'Goal', 'Target', 'الاشتراك'],
        HealthIssues: ['مشاكل صحية', 'Health Issues', 'Medical', 'تعاني'],
        Medications: ['أدوية', 'Medications', 'Drugs', 'تستخدم'],
        Injuries: ['إصابات', 'Injuries'],
        Smoker: ['مدخن', 'Smoker', 'Smoking', 'تدخين'],
        Surgeries: ['عمليات', 'Surgeries'],
        DidTests: ['تحاليل', 'Tests', 'Blood Tests'],

        // == Nutrition ==
        DietHistory: ['نظام غذائي من قبل', 'Diet History', 'تجارب سابقة', 'التزمت'],
        DailyActivity: ['طبيعة يومك', 'Activity', 'Effort', 'مجهود'],
        ComplianceIssues: ['أسباب', 'Commitment', 'obstacles', 'الالتزام'],
        Caffeine: ['منبهات', 'Caffeine', 'Coffee', 'Tea', 'مشروبات'],
        FoodAllergies: ['حساسية', 'Allergies', 'Allergy'],
        DislikedFood: ['لا تحبه', 'Disliked', 'Hated', 'يحب'],
        WantVitamins: ['فيتامينات', 'Vitamins', 'Supplements'],
        MealsCount: ['عدد الوجبات', 'Meals', 'Count'],
        DietType: ['مرن', 'Flexibility', 'Flexible', 'قاسي'],
        Budget: ['الميزانية', 'Budget'],
        FavProtein: ['البروتين', 'Protein'],
        FavCarbs: ['الكربوهيدرات', 'Carb'],
        FavFats: ['الدهون', 'Fat'],
        LastDietFile: ['آخر نظام', 'Last Diet', 'Previous Diet'],

        // == Training ==
        TrainingExp: ['تجربتك', 'Training Experience', 'History', 'خبرة'],
        LiftingDuration: ['مدة ممارسة', 'Duration', 'How long'],
        OtherSports: ['رياضة أخرى', 'Other Sports'],
        GymLocation: ['مكان التمرين', 'Location', 'Gym'],
        AvailableTools: ['الأدوات', 'Tools', 'Equipment'],
        TrainingDays: ['عدد الأيام', 'Days Count'],
        AvailableDays: ['الأيام المتاحة', 'Available Days'],
        PainfulExercises: ['تمارين تسبب', 'Painful', 'Injurious'],
        FavCardio: ['الكارديو', 'Cardio'],
        StepsCount: ['خطوات', 'Steps'],

        // == Files & Images ==
        PhotoFront: ['أمام', 'Front', 'صورة 1', 'Image 1', 'Photo 1'],
        PhotoSide: ['جانب', 'Side', 'صورة 2', 'Image 2', 'Photo 2'],
        PhotoBack: ['خلف', 'Back', 'صورة 3', 'Image 3', 'Photo 3'],
        TestsFile: ['صور التحاليل', 'Tests File', 'Lab Results', 'تحليل'],
        XrayFile: ['صور الأشعة', 'X-Ray', 'Scan', 'أشعة'],

        // == Other ==
        OnlineExp: ['الأونلاين', 'Online', 'Coaching'],
        JoinReason: ['سبب الاشتراك', 'Why subscribe'],
        Notes: ['ملاحظة', 'Notes', 'Additional'],
        Timestamp: ['Timestamp', 'Time', 'الوقت']
    }

    const convertDriveLink = (link) => {
        if (!link) return ''
        if (typeof link !== 'string') return link

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
            return `https://uw-media.googleusercontent.com/u/0/drive-viewer/${id}`
        }
        return link
    }

    const excelDateToJSDate = (serial) => {
        if (!serial) return ''
        if (typeof serial === 'string') return serial
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        return date_info.toLocaleDateString('ar-EG');
    }

    const getSmartValue = (rowObj, possibleKeys) => {
        if (!rowObj || !possibleKeys) return ''
        const rowKeys = Object.keys(rowObj)
        for (const key of possibleKeys) {
            const normalizedTarget = normalizeKey(key)
            if (rowObj[key] !== undefined && rowObj[key] !== '') return rowObj[key]
            const foundKey = rowKeys.find(k => normalizeKey(k) === normalizedTarget)
            if (foundKey && rowObj[foundKey] !== undefined && rowObj[foundKey] !== '') return rowObj[foundKey]
            const partialKey = rowKeys.find(k => k.includes(key) || normalizeKey(k).includes(normalizedTarget))
            if (partialKey && rowObj[partialKey] !== undefined && rowObj[partialKey] !== '') return rowObj[partialKey]
        }
        return ''
    }

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

            const workbook = XLSX.read(csvText, { type: 'string' })
            const sheetName = workbook.SheetNames[0]
            const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

            const processedData = rawData.map((row) => {
                const clientObj = {}

                Object.entries(DATA_MAPPING).forEach(([internalKey, possibleHeaders]) => {
                    let value = getSmartValue(row, possibleHeaders)
                    if (internalKey === 'DOB' || internalKey === 'Timestamp') {
                        value = excelDateToJSDate(value)
                    }
                    if (['PhotoFront', 'PhotoSide', 'PhotoBack', 'TestsFile', 'XrayFile'].includes(internalKey)) {
                        value = convertDriveLink(value)
                    }
                    clientObj[internalKey] = value
                })

                clientObj.files = {
                    front: clientObj.PhotoFront,
                    side: clientObj.PhotoSide,
                    back: clientObj.PhotoBack,
                    tests: clientObj.TestsFile,
                    xray: clientObj.XrayFile
                }

                return clientObj
            })

            let newCount = 0
            let updatedCount = 0

            // Batch Update/Add Logic (Simplified to Sequential for safety now)
            for (const newClient of processedData) {
                // Find existing by Code or Phone
                const existing = clients.find(c =>
                    (c.ClientCode && String(c.ClientCode).trim() === String(newClient.ClientCode).trim()) ||
                    (c.PhoneNumber && newClient.PhoneNumber && String(c.PhoneNumber).replace(/\D/g, '') === String(newClient.PhoneNumber).replace(/\D/g, ''))
                )

                if (existing) {
                    await updateClient(existing.id, newClient)
                    updatedCount++
                } else {
                    await addNewClient(newClient)
                    newCount++
                }
            }

            alert(`✅ تم اكتمال الاستيراد:\n- إضافة ${newCount} عميل جديد\n- تحديث ${updatedCount} عميل موجود`)
            fetchClients() // Refresh from Firestore

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
        c.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ClientCode?.toString().includes(searchTerm) ||
        c.PhoneNumber?.includes(searchTerm)
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
                                        {client.FullName ? client.FullName.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-dark dark:text-white line-clamp-1">{client.FullName || 'بدون اسم'}</h3>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                            {client.ClientCode || 'بدون كود'}
                                        </span>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${client.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} title="الحالة"></div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                                <div className="flex justify-between">
                                    <span>📞 الهاتف:</span>
                                    <span dir="ltr">{client.PhoneNumber || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>🎯 الهدف:</span>
                                    <span className="line-clamp-1 max-w-[150px]">{client.Goal || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>⚖️ الوزن:</span>
                                    <span>{client.Weight ? `${client.Weight} كجم` : '-'}</span>
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
                            {Object.entries(DATA_MAPPING).map(([key, headers]) => {
                                const FILE_KEYS = ['PhotoFront', 'PhotoSide', 'PhotoBack', 'TestsFile', 'XrayFile', 'LastDietFile']
                                const isFile = FILE_KEYS.includes(key)
                                return (
                                    <div key={key} className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {headers[headers.length - 1]}
                                        </label>
                                        {isFile ? (
                                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                                                {/* Logic for File: Preview Existing or Upload New */}
                                                {editingClient[key] && typeof editingClient[key] === 'string' ? (
                                                    <div className="relative group w-fit">
                                                        <a href={editingClient[key]} target="_blank" rel="noreferrer" className="block">
                                                            <img
                                                                src={editingClient[key]}
                                                                alt={key}
                                                                className="h-24 w-24 object-cover rounded shadow-sm"
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                                                            />
                                                            <div className="hidden h-24 w-24 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-xs text-center rounded p-1 text-gray-500">
                                                                ملف (اضغط للعرض)
                                                            </div>
                                                        </a>
                                                        <button
                                                            onClick={() => setEditingClient(prev => ({ ...prev, [key]: '' }))}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-600"
                                                            title="حذف الملف"
                                                        >
                                                            <FaTimes size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-2">
                                                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition">
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <FaCloudUploadAlt className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">اضغط للرفع</p>
                                                            </div>
                                                            <input type="file" className="hidden" onChange={(e) => handleFileChange(e, key)} />
                                                        </label>
                                                        {filesToUpload[key] && (
                                                            <span className="text-xs text-green-600 truncate max-w-[200px]">
                                                                جاهز للرفع: {filesToUpload[key].name}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={editingClient[key] || ''}
                                                onChange={(e) => setEditingClient(prev => ({ ...prev, [key]: e.target.value }))}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-gray-900 p-6 border-t dark:border-gray-800 flex justify-end gap-3 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
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
                                {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
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
                                <h2 className="text-2xl font-bold dark:text-white">{selectedClient.FullName}</h2>
                                <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                    <span>كود: {selectedClient.ClientCode}</span>
                                    <span>•</span>
                                    <span>{selectedClient.Timestamp || 'تاريخ التسجيل غير متوفر'}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedClient(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl">&times;</button>
                        </div>

                        <div className="p-6 grid md:grid-cols-2 gap-8">
                            {/* قسم البيانات الشخصية */}
                            <section>
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">👤 بيانات شخصية</h3>
                                <div className="space-y-3">
                                    <DetailRow label="البريد الإلكتروني" value={selectedClient.Email} />
                                    <DetailRow label="رقم الهاتف" value={selectedClient.PhoneNumber} />
                                    <DetailRow label="النوع" value={selectedClient.Gender} />
                                    <DetailRow label="تاريخ الميلاد" value={selectedClient.DOB} />
                                    <DetailRow label="الدولة" value={selectedClient.Country} />
                                    <DetailRow label="الوظيفة" value={selectedClient.Job} />
                                    <DetailRow label="الديانة" value={selectedClient.Religion} />
                                </div>
                            </section>

                            {/* قسم القياسات والصحة */}
                            <section>
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">🏥 الصحة والقياسات</h3>
                                <div className="space-y-3">
                                    <DetailRow label="الوزن الحالي" value={selectedClient.Weight} />
                                    <DetailRow label="الطول" value={selectedClient.Height} />
                                    <DetailRow label="هل تعاني من مشاكل صحية؟" value={selectedClient.HealthIssues} />
                                    <DetailRow label="هل تستخدم أدوية؟" value={selectedClient.Medications} />
                                    <DetailRow label="هل لديك إصابات؟" value={selectedClient.Injuries} />
                                    <DetailRow label="هل أنت مدخن؟" value={selectedClient.Smoker} />
                                    <DetailRow label="عمل تحاليل مؤخراً؟" value={selectedClient.DidTests} />
                                    <FileLink label="ملف التحاليل" url={selectedClient.TestsFile} />
                                    <FileLink label="ملف الأشعة" url={selectedClient.XrayFile} />
                                </div>
                            </section>

                            {/* قسم التغذية */}
                            <section>
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">🍎 التغذية</h3>
                                <div className="space-y-3">
                                    <DetailRow label="الهدف من الاشتراك" value={selectedClient.Goal} />
                                    <DetailRow label="تاريخ الدايت السابق" value={selectedClient.DietHistory} />
                                    <DetailRow label="طبيعة اليوم والمجهود" value={selectedClient.DailyActivity} />
                                    <DetailRow label="أسباب عدم الالتزام" value={selectedClient.ComplianceIssues} />
                                    <DetailRow label="هل تشرب منبهات؟" value={selectedClient.Caffeine} />
                                    <DetailRow label="حساسية من طعام" value={selectedClient.FoodAllergies} />
                                    <DetailRow label="طعام لا تحبه" value={selectedClient.DislikedFood} />
                                    <DetailRow label="هل تريد فيتامينات؟" value={selectedClient.WantVitamins} />
                                    <DetailRow label="عدد الوجبات المفضل" value={selectedClient.MealsCount} />
                                    <DetailRow label="نوع النظام (مرن/قاسي)" value={selectedClient.DietType} />
                                    <DetailRow label="الميزانية" value={selectedClient.Budget} />
                                    <DetailRow label="البروتين المفضل" value={selectedClient.FavProtein} />
                                    <DetailRow label="الكربوهيدرات المفضلة" value={selectedClient.FavCarbs} />
                                    <DetailRow label="الدهون المفضلة" value={selectedClient.FavFats} />
                                    <FileLink label="ملف آخر دايت" url={selectedClient.LastDietFile} />
                                </div>
                            </section>

                            {/* قسم التمرين */}
                            <section>
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">💪 التمرين</h3>
                                <div className="space-y-3">
                                    <DetailRow label="الخبرة في التمرين" value={selectedClient.TrainingExp} />
                                    <DetailRow label="مدة ممارسة الحديد" value={selectedClient.LiftingDuration} />
                                    <DetailRow label="هل تمارس رياضة أخرى؟" value={selectedClient.OtherSports} />
                                    <DetailRow label="مكان التمرين" value={selectedClient.GymLocation} />
                                    <DetailRow label="الأدوات المتاحة" value={selectedClient.AvailableTools} />
                                    <DetailRow label="عدد أيام التمرين" value={selectedClient.TrainingDays} />
                                    <DetailRow label="الأيام المتاحة" value={selectedClient.AvailableDays} />
                                    <DetailRow label="تمارين تسبب ألم" value={selectedClient.PainfulExercises} />
                                    <DetailRow label="الكارديو المفضل" value={selectedClient.FavCardio} />
                                    <DetailRow label="متوسط خطوات اليوم" value={selectedClient.StepsCount} />
                                </div>
                            </section>

                            {/* معلومات إضافية */}
                            <section className="md:col-span-2">
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">ℹ️ معلومات إضافية</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <DetailRow label="تجربة سابقة أونلاين؟" value={selectedClient.OnlineExp} />
                                    <DetailRow label="سبب الاشتراك معنا؟" value={selectedClient.JoinReason} />
                                </div>
                            </section>

                            {/* ملاحظات */}
                            <section className="md:col-span-2">
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">📝 ملاحظات إضافية</h3>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                                    <p className="dark:text-gray-300 whitespace-pre-wrap">{selectedClient.Notes || 'لا توجد ملاحظات إضافية'}</p>
                                </div>
                            </section>

                            {/* الصور */}
                            <section className="md:col-span-2">
                                <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">📸 صور الجسم والملفات</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <ImageCard label="أمامية" url={selectedClient.files?.front || selectedClient.PhotoFront} />
                                    <ImageCard label="جانبية" url={selectedClient.files?.side || selectedClient.PhotoSide} />
                                    <ImageCard label="خلفية" url={selectedClient.files?.back || selectedClient.PhotoBack} />
                                </div>
                                <div className="mt-4 flex gap-4">
                                    <FileLink label="ملف التحاليل" url={selectedClient.files?.tests || selectedClient.TestsFile} />
                                    <FileLink label="ملف الأشعة" url={selectedClient.files?.xray || selectedClient.XrayFile} />
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
