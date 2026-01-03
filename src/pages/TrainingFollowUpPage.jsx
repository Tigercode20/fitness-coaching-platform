import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaCircle, FaUserClock, FaEdit, FaTrash, FaCopy, FaSave, FaTimes } from 'react-icons/fa'
import { getAllClients } from '../services/clientService'
import Parse from '../services/back4app'
import { toast } from 'react-toastify'
import { formatDate } from '../utils/dateFormatter'


// Helper to determine plan status
const getPlanStatus = (planDate, duration) => {
    if (!planDate) return { status: 'missing', label: 'لم يستلم', color: 'bg-red-100 text-red-800' }

    const start = new Date(planDate)
    const end = new Date(start)
    end.setDate(start.getDate() + duration)
    const today = new Date()

    // Calculate remaining days
    const diffTime = end - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: 'expired', label: 'منتهي', color: 'bg-gray-100 text-gray-600', days: diffDays }
    if (diffDays <= 5) return { status: 'ending', label: `ينتهي قريباً (${diffDays} يوم)`, color: 'bg-yellow-100 text-yellow-800', days: diffDays }

    return { status: 'active', label: `نشط (${diffDays} يوم)`, color: 'bg-green-100 text-green-800', days: diffDays }
}

export default function TrainingFollowUpPage() {
    const [selectedClient, setSelectedClient] = useState(null)
    const [activeClients, setActiveClients] = useState([])
    const [otherClients, setOtherClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            // 1. Parallel Fetching for performance
            const Sale = Parse.Object.extend('Sale')
            const saleQuery = new Parse.Query(Sale)
            saleQuery.descending('createdAt')
            saleQuery.limit(1000) // Limit to reasonably recent sales

            const Plan = Parse.Object.extend('TrainingPlan')
            const planQuery = new Parse.Query(Plan)
            planQuery.descending('createdAt')
            planQuery.limit(1000)
            // Optimize plan query to include pointer if possible, but standard fetch has it.

            const [clients, sales, plans] = await Promise.all([
                getAllClients(),
                saleQuery.find(),
                planQuery.find()
            ])

            // 2. Build HashMaps for O(1) Lookup

            // Map Sales by Code and Name
            const salesByCode = {}
            const salesByName = {}
            sales.forEach(s => {
                const code = s.get('clientCode')
                const name = s.get('clientName')
                if (code) {
                    if (!salesByCode[code]) salesByCode[code] = []
                    salesByCode[code].push(s)
                }
                if (name) {
                    if (!salesByName[name]) salesByName[name] = []
                    salesByName[name].push(s)
                }
            })

            // Map Plans by ClientId
            const plansByClient = {}
            plans.forEach(p => {
                const clientPtr = p.get('client')
                if (clientPtr && clientPtr.id) {
                    if (!plansByClient[clientPtr.id]) plansByClient[clientPtr.id] = []
                    plansByClient[clientPtr.id].push(p)
                }
            })

            // 3. Process Data efficiently
            const activeList = []
            const otherList = []

            clients.forEach(client => {
                // Get relevant sales from maps
                const relatedSales = [
                    ...(salesByCode[client.ClientCode] || []),
                    ...(salesByName[client.FullName] || [])
                ]
                // Deduplicate sales based on ID
                const uniqueSales = Array.from(new Map(relatedSales.map(s => [s.id, s])).values())

                // Find active sale
                const activeSale = uniqueSales.find(s => {
                    const start = new Date(s.get('startDate'))
                    const duration = s.get('duration') || 30 // Days
                    const end = new Date(start)
                    end.setDate(start.getDate() + duration) // Add days
                    return end > new Date()
                })

                // Get plans from map
                const clientPlans = (plansByClient[client.id] || [])
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

                const latestTraining = clientPlans.find(p => p.get('type') === 'training')
                const latestNutrition = clientPlans.find(p => p.get('type') === 'nutrition')

                const processedClient = {
                    ...client,
                    sale: activeSale,
                    allPlans: clientPlans,
                    trainingPlan: latestTraining,
                    nutritionPlan: latestNutrition
                }

                if (activeSale) {
                    activeList.push(processedClient)
                } else {
                    otherList.push(processedClient)
                }
            })

            setActiveClients(activeList)
            setOtherClients(otherList)

        } catch (error) {
            console.error(error)
            toast.error('حدث خطأ أثناء تحميل البيانات')
        } finally {
            setLoading(false)
        }
    }

    const filteredActive = activeClients.filter(c => c.FullName.toLowerCase().includes(searchTerm.toLowerCase()) || c.ClientCode.toLowerCase().includes(searchTerm.toLowerCase()))
    const filteredOther = otherClients.filter(c => c.FullName.toLowerCase().includes(searchTerm.toLowerCase()) || c.ClientCode.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📅 متابعة خطط التدريب</h1>
                        <p className="text-gray-600 dark:text-gray-400">مراقبة تسليم الخطط وحالة الاشتراكات النشطة</p>
                    </div>
                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="بحث باسم العميل أو الكود..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                        />
                        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">جاري التحميل...</div>
                ) : (
                    <>
                        {/* Section 1: Active Clients */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                                <FaCircle className="text-xs" /> عملاء باشتراكات نشطة ({filteredActive.length})
                            </h2>

                            <div className="grid lg:grid-cols-2 gap-6">
                                {filteredActive.map(client => (
                                    <ClientFollowUpCard
                                        key={client.id}
                                        client={client}
                                        isActive={true}
                                        onClick={() => setSelectedClient(client)}
                                    />
                                ))}
                            </div>
                            {filteredActive.length === 0 && <p className="text-gray-500 text-center py-4">لا يوجد عملاء نشطين حالياً</p>}
                        </div>

                        <hr className="border-gray-200 dark:border-gray-700 my-8" />

                        {/* Section 2: Other Clients */}
                        <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                            <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <FaUserClock /> باقي العملاء ({filteredOther.length})
                            </h2>

                            <div className="grid lg:grid-cols-2 gap-6">
                                {filteredOther.map(client => (
                                    <ClientFollowUpCard
                                        key={client.id}
                                        client={client}
                                        isActive={false}
                                        onClick={() => setSelectedClient(client)}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* History Modal */}
            {selectedClient && (
                <ClientHistoryModal
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                    onRefresh={loadData}
                />
            )}
        </div>
    )
}


function ClientFollowUpCard({ client, onClick }) {
    // Process statuses
    const trainingStatus = client.trainingPlan
        ? getPlanStatus(client.trainingPlan.get('startDate'), client.trainingPlan.get('duration'))
        : { status: 'missing', label: 'لم يستلم', color: 'bg-red-100 text-red-800' }

    const nutritionStatus = client.nutritionPlan
        ? getPlanStatus(client.nutritionPlan.get('startDate'), client.nutritionPlan.get('duration'))
        : { status: 'missing', label: 'لم يستلم', color: 'bg-red-100 text-red-800' }

    // Subscription progress
    const subStart = client.sale ? new Date(client.sale.get('startDate')) : null
    const subDuration = client.sale ? (client.sale.get('duration') + (client.sale.get('bonusDuration') || 0)) : 0

    let subProgress = 0
    let elapsedDays = 0
    let remainingDays = 0
    let subLabel = 'غير مشترك'

    if (client.sale && subStart) {
        const today = new Date()
        const end = new Date(subStart)
        end.setDate(subStart.getDate() + subDuration)

        const totalTime = end - subStart
        const elapsedTime = today - subStart
        subProgress = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100))

        remainingDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
        elapsedDays = Math.floor(elapsedTime / (1000 * 60 * 60 * 24))
        subLabel = remainingDays > 0 ? `متبقي ${remainingDays} يوم` : 'منتهي'
    }

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
        >
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <img
                        src={client.personalImageUrl || client.PhotoFront || 'https://via.placeholder.com/150'}
                        alt={client.FullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
                    />
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">{client.FullName}</h3>
                        <span className="text-gray-500 text-xs font-mono">{client.ClientCode}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                        to={`/client-update?clientId=${client.id}&name=${encodeURIComponent(client.FullName)}`}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition"
                        title="إجراء متابعة للعميل"
                    >
                        <FaEdit /> متابعة
                    </Link>
                </div>
            </div>

            {/* Subscription Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs mb-1 font-bold">
                    <span className="text-gray-500">
                        مضى: {elapsedDays > 0 ? elapsedDays : 0} يوم
                    </span>
                    <span className={`${remainingDays > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        متبقي: {remainingDays > 0 ? remainingDays : 0} يوم
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex dir-ltr">
                    <div
                        className={`h-full transition-all duration-1000 ${remainingDays > 0 ? 'bg-green-500' : 'bg-gray-400'}`}
                        style={{ width: `${subProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Plans Status Pills */}
            <div className="grid grid-cols-2 gap-4">
                {/* Training Status */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                    <div>
                        <div className="text-xs text-gray-500">🏋️ التدريب</div>
                        <div className={`text-xs font-bold px-2 py-1 rounded inline-block mt-1 ${trainingStatus.color}`}>
                            {trainingStatus.label}
                        </div>
                    </div>
                    {client.trainingPlan && (
                        <div className="text-[10px] text-gray-400 mt-2 block w-full text-left">
                            {formatDate(client.trainingPlan.get('startDate'))}
                        </div>
                    )}
                </div>

                {/* Nutrition Status */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                    <div>
                        <div className="text-xs text-gray-500">🍎 التغذية</div>
                        <div className={`text-xs font-bold px-2 py-1 rounded inline-block mt-1 ${nutritionStatus.color}`}>
                            {nutritionStatus.label}
                        </div>
                    </div>
                    {client.nutritionPlan && (
                        <div className="text-[10px] text-gray-400 mt-2 block w-full text-left">
                            {formatDate(client.nutritionPlan.get('startDate'))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ClientHistoryModal({ client, onClose, onRefresh }) {
    const [editingPlanId, setEditingPlanId] = useState(null)
    const [editContent, setEditContent] = useState('')

    const handleCopy = (content) => {
        navigator.clipboard.writeText(content)
        toast.success('تم نسخ النص!')
    }

    const handleDelete = async (plan) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء.')) {
            try {
                await plan.destroy()
                toast.success('تم حذف الخطة')
                onRefresh()
            } catch (error) {
                console.error(error)
                toast.error('فشل الحذف')
            }
        }
    }

    const startEdit = (plan) => {
        setEditingPlanId(plan.id)
        setEditContent(plan.get('content'))
    }

    const saveEdit = async (plan) => {
        try {
            plan.set('content', editContent)
            await plan.save()
            toast.success('تم تحديث الخطة')
            setEditingPlanId(null)
            onRefresh()
        } catch (error) {
            console.error(error)
            toast.error('فشل التحديث')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <img
                            src={client.personalImageUrl || client.PhotoFront || 'https://via.placeholder.com/150'}
                            alt={client.FullName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{client.FullName}</h2>
                            <p className="text-gray-500 text-sm">سجل الخطط والبرامج</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950/50 space-y-6">
                    {client.allPlans && client.allPlans.length > 0 ? (
                        client.allPlans.map(plan => {
                            const isEditing = editingPlanId === plan.id
                            const isTraining = plan.get('type') === 'training'

                            return (
                                <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
                                    {/* Plan Header */}
                                    <div className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-3 ${isTraining ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-green-50/50 dark:bg-green-900/10'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xl p-2 rounded-lg ${isTraining ? 'bg-white text-blue-500' : 'bg-white text-green-500'} shadow-sm`}>
                                                {isTraining ? '🏋️' : '🍎'}
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-gray-200">
                                                    {isTraining ? 'برنامج تدريبي' : 'خطة تغذية'}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-1">
                                                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                                                        {formatDate(plan.get('createdAt'))}
                                                    </span>
                                                    <span>
                                                        {new Date(plan.get('createdAt')).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <>
                                                    <button onClick={() => saveEdit(plan)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition">
                                                        <FaSave /> حفظ
                                                    </button>
                                                    <button onClick={() => setEditingPlanId(null)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition">
                                                        <FaTimes /> إلغاء
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(plan)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition" title="تعديل">
                                                        <FaEdit />
                                                    </button>
                                                    <button onClick={() => handleCopy(plan.get('content'))} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="نسخ">
                                                        <FaCopy />
                                                    </button>
                                                    <button onClick={() => handleDelete(plan)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="حذف">
                                                        <FaTrash />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Plan Content */}
                                    <div className="p-4">
                                        {isEditing ? (
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full h-64 p-4 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white font-mono text-sm leading-relaxed"
                                            />
                                        ) : (
                                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800 max-h-60 overflow-y-auto">
                                                {plan.get('content')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Info */}
                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 flex justify-between">
                                        <span>المدة: {plan.get('duration')} يوم</span>
                                        <span>ID: {plan.id}</span>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <div className="text-4xl mb-4">📭</div>
                            <p>لا يوجد سجل خطط لهذا العميل</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
