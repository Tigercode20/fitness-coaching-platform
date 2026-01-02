// ============================================
// src/pages/SubscriptionsPage.jsx
// صفحة إدارة الاشتراكات مع كل المميزات
// ============================================

import { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaDownload, FaUpload, FaSearch } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import { getAllSubscriptions, deleteSubscription } from '../services/subscriptionService'
import { getAllClients } from '../services/clientService'

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState([])
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [editingId, setEditingId] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    // تحميل البيانات
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)

            // تحميل البيانات من Back4App
            const [subs, clts] = await Promise.all([
                getAllSubscriptions(),
                getAllClients()
            ])

            setSubscriptions(subs)
            setClients(clts)
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error)
            alert('فشل تحميل البيانات')
        } finally {
            setLoading(false)
        }
    }

    // البحث والتصفية
    const filtered = subscriptions.filter(sub => {
        const matchSearch =
            sub.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.clientCode?.includes(searchTerm)

        const matchStatus = filterStatus === 'all' || sub.status === filterStatus

        return matchSearch && matchStatus
    })

    // حذف اشتراك (Back4App)
    const handleDelete = async (id) => {
        try {
            await deleteSubscription(id)
            setSubscriptions(subscriptions.filter(s => s.id !== id))
            setDeleteConfirm(null)
            alert('تم الحذف بنجاح')
        } catch (error) {
            console.error('خطأ في الحذف:', error)
            alert('فشل الحذف')
        }
    }

    // تصدير Excel
    const exportToExcel = () => {
        const data = filtered.map(sub => ({
            'رمز العميل': sub.clientCode,
            'اسم العميل': sub.clientName,
            'البريد الإلكتروني': sub.clientEmail,
            'الهاتف': sub.clientPhone,
            'نوع الاشتراك': sub.type,
            'الباقة': sub.package,
            'السعر': sub.price,
            'العملة': sub.currency,
            'الحالة': sub.status,
            'تاريخ البدء': sub.createdAt && sub.createdAt.toDate ? new Date(sub.createdAt.toDate()).toLocaleDateString('ar-EG') : '-',
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'الاشتراكات')
        XLSX.writeFile(wb, 'الاشتراكات.xlsx')
    }

    // استيراد Excel
    const handleImportExcel = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result)
                const workbook = XLSX.read(data, { type: 'array' })
                const worksheet = workbook.Sheets[workbook.SheetNames[0]]
                const rows = XLSX.utils.sheet_to_json(worksheet)

                console.log('البيانات المستوردة:', rows)
                alert(`تم استيراد ${rows.length} سجل. يرجى التأكيد قبل الحفظ.`)

                // هنا يمكنك إضافة منطق حفظ البيانات
            } catch (error) {
                console.error('خطأ في الاستيراد:', error)
                alert('فشل استيراد الملف')
            }
        }
        reader.readAsArrayBuffer(file)
    }

    // استيراد من Google Sheets
    const importFromGoogleSheets = async () => {
        const userInput = prompt('أدخل رابط Google Sheets:\n(يجب أن يكون الملف "عام" Public)', '')
        if (!userInput) return

        let sheetUrl = userInput.trim()

        // محاولة تحويل الرابط العادي إلى رابط تصدير CSV
        // تحويل /edit إلى /gviz/tq?tqx=out:csv وهو يدعم CORS بشكل أفضل للملفات العامة
        if (sheetUrl.includes('/edit')) {
            sheetUrl = sheetUrl.replace(/\/edit.*$/, '/gviz/tq?tqx=out:csv')
        } else if (sheetUrl.includes('/pub?')) {
            // روابط Publish to web عادة تعمل مباشرة
        } else if (!sheetUrl.includes('output=csv') && !sheetUrl.includes('out:csv')) {
            // محاولة إضافة تنسيق CSV إذا لم يكن موجوداً
            if (sheetUrl.includes('?')) {
                sheetUrl += '&output=csv'
            } else {
                sheetUrl += '?output=csv'
            }
        }

        try {
            const response = await fetch(sheetUrl)
            if (!response.ok) throw new Error('Network response was not ok')

            const csv = await response.text()

            // تحويل CSV إلى JSON
            const rows = csv.split('\n').filter(row => row.trim())
            // تنظيف العناوين من علامات التنصيص
            const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

            const data = rows.slice(1).map(row => {
                // تعامل بسيط مع CSV (هذا يفترض عدم وجود فواصل داخل الحقول)
                // لتحسين هذا يمكن استخدام مكتبة مثل papaparse لكن سنستخدم الطريقة البسيطة الآن
                const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
                const obj = {}
                headers.forEach((h, i) => obj[h] = values[i])
                return obj
            })

            console.log('البيانات من Google Sheets:', data)
            alert(`تم استيراد ${data.length} سجل بنجاح!`)

            // دالة مساعدة للبحث عن القيمة في عدة مفاتيح محتملة
            const getValue = (obj, keys) => {
                for (const key of keys) {
                    if (obj[key] !== undefined && obj[key] !== '') return obj[key]
                }
                return ''
            }

            // دمج البيانات مع الاشتراكات الحالية (للعرض فقط حالياً)
            const newSubs = data.map((d, index) => {
                // تحديد المفاتيح المحتملة لكل حقل بناءً على ما رأيناه في Google Forms
                return {
                    id: `imported_${Date.now()}_${index}`,
                    clientCode: getValue(d, ['الكود', 'Code', 'رمز العميل', 'Client Code']),
                    clientName: getValue(d, ['الاسم ثلاثي', 'الاسم', 'Name', 'Full Name', 'اسم العميل', 'الأسم']),
                    clientEmail: getValue(d, ['Email Address', 'البريد الإلكتروني', 'Email', 'البريد']),
                    clientPhone: getValue(d, ['رقم التليفون', 'Phone', 'Mobile', 'الهاتف', 'رقم الهاتف', 'Tel']),

                    // حقول قد لا تكون موجودة في Form الاستجابات
                    type: getValue(d, ['نوع الاشتراك', 'Type', 'Subscription Type']) || 'جديد',
                    package: getValue(d, ['الباقة', 'Package', 'Plan']) || '-',
                    price: getValue(d, ['السعر', 'Price', 'Amount']) || 0,
                    currency: getValue(d, ['العملة', 'Currency']) || 'EGP',
                    status: getValue(d, ['الحالة', 'Status']) || 'pending',

                    createdAt: new Date(),
                    isNew: true
                }
            })

            setSubscriptions(prev => [...newSubs, ...prev])

        } catch (error) {
            console.error('خطأ في الاستيراد من Google Sheets:', error)
            alert('فشل الاستيراد. تأكد من أن:\n1. الملف متاح للعامة (Anyone with the link can view)\n2. الرابط صحيح')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 p-4 sm:p-6 md:p-8 transition-colors duration-300">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-dark dark:text-white">
                            📊 الاشتراكات
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            إدارة الاشتراكات والعملاء النشطين
                        </p>
                    </div>

                    {/* إحصائيات سريعة */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {subscriptions.length}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">إجمالي</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {subscriptions.filter(s => s.status === 'active').length}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">نشط</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {subscriptions.filter(s => s.status === 'expired').length}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">منتهي</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* أدوات البحث والتصفية */}
            <div className="max-w-7xl mx-auto mb-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm transition-colors duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {/* بحث */}
                    <div className="relative">
                        <FaSearch className="absolute right-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو البريد أو الرمز..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-gray-700 
                bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 
                focus:ring-primary dark:text-white transition-colors duration-300"
                        />
                    </div>

                    {/* تصفية الحالة */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 
              bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 
              focus:ring-primary dark:text-white transition-colors duration-300"
                    >
                        <option value="all">كل الحالات</option>
                        <option value="active">نشط</option>
                        <option value="expired">منتهي</option>
                        <option value="pending">قيد الانتظار</option>
                    </select>

                    {/* أزرار الإجراءات */}
                    <div className="flex gap-2">
                        <button
                            onClick={exportToExcel}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 
                dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded-lg 
                transition-colors duration-200"
                            title="تصدير إلى Excel"
                        >
                            <FaDownload className="sm:hidden" />
                            <span className="hidden sm:inline">تصدير</span>
                        </button>

                        <button
                            onClick={() => document.getElementById('excelInput').click()}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 
                dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg 
                transition-colors duration-200"
                            title="استيراد من Excel"
                        >
                            <FaUpload className="sm:hidden" />
                            <span className="hidden sm:inline">Excel</span>
                        </button>

                        <button
                            onClick={importFromGoogleSheets}
                            className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 
                dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-lg 
                transition-colors duration-200"
                            title="استيراد من Google Sheets"
                        >
                            <FaUpload className="sm:hidden" />
                            <span className="hidden sm:inline">Sheets</span>
                        </button>
                    </div>
                </div>

                {/* نتائج البحث */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    تم العثور على <span className="font-bold text-primary">{filtered.length}</span> نتيجة
                </div>
            </div>

            {/* جدول الاشتراكات */}
            <div className="max-w-7xl mx-auto overflow-x-auto">
                {filtered.length > 0 ? (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <th className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                    رمز العميل
                                </th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                    اسم العميل
                                </th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-white hidden sm:table-cell">
                                    البريد
                                </th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                    الباقة
                                </th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-white hidden sm:table-cell">
                                    السعر
                                </th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                    الحالة
                                </th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((sub) => (
                                <tr
                                    key={sub.id}
                                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 
                    dark:hover:bg-gray-900/50 transition-colors duration-200"
                                >
                                    <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold">
                                        {sub.clientCode || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                                        {sub.clientName || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell text-sm">
                                        {sub.clientEmail || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-950/50 
                      text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                                            {sub.package || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white hidden sm:table-cell">
                                        {sub.price} {sub.currency}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                      ${sub.status === 'active'
                                                ? 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300'
                                                : sub.status === 'expired'
                                                    ? 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300'
                                                    : 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300'
                                            }`}>
                                            {sub.status === 'active' ? '✓ نشط' : sub.status === 'expired' ? '✗ منتهي' : '⏳ قيد الانتظار'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => setEditingId(sub.id)}
                                                className="p-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 
                          dark:hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                                                title="تعديل"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(sub.id)}
                                                className="p-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 
                          dark:hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                                                title="حذف"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            لا توجد اشتراكات حسب معايير البحث
                        </p>
                    </div>
                )}
            </div>

            {/* حقل استيراد Excel المخفي */}
            <input
                id="excelInput"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportExcel}
                className="hidden"
            />

            {/* تأكيد الحذف */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
                            هل أنت متأكد من الحذف؟
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            هذا الإجراء لا يمكن التراجع عنه
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 
                  dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                حذف
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 
                  dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg 
                  transition-colors duration-200"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
