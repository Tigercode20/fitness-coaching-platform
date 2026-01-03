import { useState, useEffect } from 'react'
import { FaUserPlus, FaSearch, FaFileExcel, FaDownload, FaUpload, FaEye, FaTrash, FaEdit, FaExternalLinkAlt, FaSync, FaTimes, FaCloudUploadAlt } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import { getAllClients, deleteClient, updateClient, addNewClient } from '../services/clientService'
import { getSalesBy } from '../services/salesService'
import Parse from '../services/back4app'
import EditClientModal from '../components/Modals/EditClientModal'
import ClientDetailsModal from '../components/Modals/ClientDetailsModal'
import { DATA_MAPPING } from '../utils/clientFields'
import { formatDate } from '../utils/dateFormatter'

export default function ClientsPage() {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedClient, setSelectedClient] = useState(null)
    const [editingClient, setEditingClient] = useState(null)

    // Load Clients from Back4App
    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            setLoading(true)
            const [clientsData, salesData] = await Promise.all([
                getAllClients(),
                getSalesBy()
            ])

            // دمج تاريخ آخر اشتراك مع بيانات العميل
            const enhancedClients = clientsData.map(client => {
                // البحث عن مبيعات هذا العميل (باستخدام الكود أو الاسم أو الهاتف)
                const clientSales = salesData.filter(sale => {
                    const sCode = sale.get ? sale.get('clientCode') : sale.clientCode;
                    const cCode = client.ClientCode;
                    return String(sCode) === String(cCode);
                });

                // الحصول على أحدث تاريخ مبيعة
                let latestSaleDate = null;
                if (clientSales.length > 0) {
                    clientSales.sort((a, b) => b.createdAt - a.createdAt);
                    latestSaleDate = clientSales[0].createdAt;
                }

                return { ...client, latestSaleDate };
            });

            setClients(enhancedClients)
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
                                <div className={`w-3 h-3 rounded-full ${(() => {
                                    if (client.status !== 'active') return 'bg-gray-300';
                                    if (!client.subscriptionEnd) return 'bg-green-500';

                                    const end = new Date(client.subscriptionEnd);
                                    const now = new Date();
                                    const diffTime = end - now;
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    if (diffDays <= 0) return 'bg-red-500';
                                    if (diffDays <= 10) return 'bg-yellow-500';
                                    return 'bg-green-500';
                                })()
                                    }`} title="الحالة"></div>
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
                            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 text-center flex justify-between px-2 text-xs text-gray-400 dark:text-gray-500">
                                <span>📅 تسجيل: {formatDate(client.createdAt)}</span>
                                {client.latestSaleDate && (
                                    <span className="text-blue-500">🛒 اشتراك: {formatDate(client.latestSaleDate)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Client Modal */}
            <EditClientModal
                client={editingClient}
                isOpen={!!editingClient}
                onClose={() => setEditingClient(null)}
                onUpdate={(updated) => setClients(prev => prev.map(c => c.id === updated.id ? updated : c))}
            />

            {
                filteredClients.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p className="text-xl">لا يوجد عملاء مطابقين للبحث</p>
                    </div>
                )
            }

            {/* Modal: Client Details */}
            <ClientDetailsModal
                client={selectedClient}
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
            />
        </div>
    )
}
