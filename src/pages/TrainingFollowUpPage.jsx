import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaCircle, FaUserClock, FaEdit, FaTrash } from 'react-icons/fa'
import { getAllClients } from '../services/clientService'
import Parse from '../services/back4app'
import { toast } from 'react-toastify'

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
            // 1. Fetch Clients
            const clients = await getAllClients()

            // 2. Fetch Active Sales (Subscriptions)
            const Sale = Parse.Object.extend('Sale')
            const saleQuery = new Parse.Query(Sale)
            saleQuery.descending('createdAt')
            const sales = await saleQuery.find()

            // 3. Fetch Recent Plans
            const Plan = Parse.Object.extend('TrainingPlan')
            const planQuery = new Parse.Query(Plan)
            planQuery.descending('createdAt')
            planQuery.limit(1000)
            const plans = await planQuery.find()

            // Process Data
            const activeList = []
            const otherList = []



            clients.forEach(client => {
                // Find active subscription for this client (fuzzy match by name or strict by code pointer if existed)
                // Assuming sales have clientName or we match roughly. 
                // Better approach: Match by ClientCode if available in Sale, or Name.
                // In SubscriptionPage we see 'Sale' has 'clientName' usually.

                // Let's try to match Sale to Client
                // This might be tricky if Sale doesn't point to Client class.
                // Checking previous code: Sales seem to just have names.
                // We will try to match by Name or Code.

                const clientSales = sales.filter(s =>
                    (s.get('clientCode') && s.get('clientCode') === client.ClientCode) ||
                    (s.get('clientName') === client.FullName)
                )

                // Sort sales by date to find latest? Assuming query order.
                const activeSale = clientSales.find(s => {
                    const start = new Date(s.get('startDate'))
                    const duration = s.get('duration') || 30
                    const end = new Date(start)
                    end.setDate(start.getDate() + duration)
                    return end > new Date() // Is still active
                })

                const clientPlans = plans.filter(p => {
                    const clientPtr = p.get('client')
                    return clientPtr && clientPtr.id === client.id
                }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

                // Latest active plans for status pills
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
                                    <ClientFollowUpCard key={client.id} client={client} isActive={true} />
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
                                    <ClientFollowUpCard key={client.id} client={client} isActive={false} />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function ClientFollowUpCard({ client, isActive }) {
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
    let subLabel = 'غير مشترك'

    if (client.sale && subStart) {
        const today = new Date()
        const end = new Date(subStart)
        end.setDate(subStart.getDate() + subDuration)

        const totalTime = end - subStart
        const elapsedTime = today - subStart
        subProgress = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100))

        const remainingDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
        subLabel = remainingDays > 0 ? `متبقي ${remainingDays} يوم` : 'منتهي'
    }

    return (
        <div className={`bg-white dark:bg-gray-800 p-5 rounded-xl border shadow-sm transition-all hover:shadow-md ${isActive ? 'border-green-200 dark:border-green-900/30 ring-1 ring-green-500/10' : 'border-gray-200 dark:border-gray-700'}`}>
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
                <div className="flex gap-2">
                    <Link to={`/client-update?clientId=${client.id}&name=${encodeURIComponent(client.FullName)}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="تعديل">
                        <FaEdit />
                    </Link>
                </div>
            </div>

            {/* Subscription Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-gray-700 dark:text-gray-300">الاشتراك ({subDuration} يوم)</span>
                    <span className={`font-bold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>{subLabel}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                        style={{ width: `${subProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Training Status */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">🏋️ برنامج التدريب</div>
                    <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${trainingStatus.color}`}>
                        {trainingStatus.label}
                    </div>
                    {client.trainingPlan && (
                        <div className="text-[10px] text-gray-400 mt-1">
                            بدء: {new Date(client.trainingPlan.get('startDate')).toLocaleDateString('ar-EG')}
                        </div>
                    )}
                </div>

                {/* Nutrition Status */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">🍎 خطة التغذية</div>
                    <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${nutritionStatus.color}`}>
                        {nutritionStatus.label}
                    </div>
                    {client.nutritionPlan && (
                        <div className="text-[10px] text-gray-400 mt-1">
                            بدء: {new Date(client.nutritionPlan.get('startDate')).toLocaleDateString('ar-EG')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
