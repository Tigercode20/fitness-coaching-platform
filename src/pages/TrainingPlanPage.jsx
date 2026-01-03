import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaCopy, FaSave, FaCalendarAlt, FaDumbbell, FaAppleAlt } from 'react-icons/fa'
import { getClientByCode } from '../services/clientService'
import Parse from '../services/back4app'
import { toast } from 'react-toastify'

export default function TrainingPlanPage() {
    const navigate = useNavigate()
    const [clientCode, setClientCode] = useState('')
    const [client, setClient] = useState(null)
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)

    // Plan State
    const [planType, setPlanType] = useState('training') // 'training' or 'nutrition'
    const [planContent, setPlanContent] = useState('')
    const [duration, setDuration] = useState(30) // Default 30 days? User said "Number of days"
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!clientCode.trim()) return

        setSearching(true)
        try {
            const foundClient = await getClientByCode(clientCode.trim())
            if (foundClient) {
                setClient(foundClient)
                toast.success('تم العثور على العميل')
            } else {
                setClient(null)
                toast.error('لم يتم العثور على عميل بهذا الكود')
            }
        } catch (error) {
            console.error(error)
            toast.error('حدث خطأ أثناء البحث')
        } finally {
            setSearching(false)
        }
    }

    const generateQAText = () => {
        if (!client) return ''
        return `
👤 بيانات شخصية:
- الاسم: ${client.FullName}
- البريد: ${client.Email}
- الهاتف: ${client.PhoneNumber}
- النوع: ${client.Gender}
- الطول: ${client.Height} سم
- الوزن: ${client.Weight} كجم

🍎 التغذية:
- الهدف: ${client.Goal}
- نشاط يومي: ${client.DailyActivity}
- عدد الوجبات: ${client.MealsCount}
- الميزانية: ${client.Budget}
- ممنوعات: ${client.DislikedFood}
- حساسية: ${client.FoodAllergies}

💪 التمرين:
- الخبرة: ${client.TrainingExp}
- أيام متاحة: ${client.TrainingDays} (${client.AvailableDays})
- مكان التمرين: ${client.GymLocation}
- أدوات: ${client.AvailableTools}
- إصابات: ${client.Injuries}
- تمارين مكروهة / مؤلمة: ${client.PainfulExercises}

📝 ملاحظات:
${client.Notes || 'لا يوجد'}
        `.trim()
    }

    const copyQA = () => {
        const text = generateQAText()
        navigator.clipboard.writeText(text)
        toast.info('تم نسخ البيانات إلى الحافظة')
    }

    const handleSave = async () => {
        if (!client) return
        if (!planContent.trim()) {
            toast.warning('يرجى كتابة محتوى الخطة')
            return
        }

        setLoading(true)
        try {
            const TrainingPlan = Parse.Object.extend('TrainingPlan')
            const plan = new TrainingPlan()

            // Create Pointer to Client
            const ClientPointer = Parse.Object.extend('Client')
            const clientObj = new ClientPointer()
            clientObj.id = client.id

            plan.set('client', clientObj)
            plan.set('clientCode', client.ClientCode)
            plan.set('clientName', client.FullName)
            plan.set('type', planType)
            plan.set('content', planContent)
            plan.set('duration', parseInt(duration))
            plan.set('startDate', new Date(startDate))
            plan.set('status', 'active')

            await plan.save()

            toast.success('✅ تم حفظ الخطة بنجاح!')
            // Optional: clear form or navigate? User said "Save... and that's it"
            // Maybe reset content?
            setPlanContent('')
        } catch (error) {
            console.error(error)
            toast.error('❌ فشل حفظ الخطة: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📄 إنشاء خطط التدريب</h1>
                    <p className="text-gray-600 dark:text-gray-400">ابحث عن العميل، راجع إجاباته، وأنشئ الخطة المناسبة.</p>
                </div>

                {/* Search Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                    <form onSubmit={handleSearch} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                كود العميل
                            </label>
                            <input
                                type="text"
                                value={clientCode}
                                onChange={(e) => setClientCode(e.target.value)}
                                placeholder="C-1001"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={searching || !clientCode}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {searching ? 'جاري البحث...' : <><FaSearch /> بحث</>}
                        </button>
                    </form>
                </div>

                {/* Main Content Area (Only if client found) */}
                {client && (
                    <div className="grid lg:grid-cols-3 gap-8 animate-fadeIn">
                        {/* Sidebar: Personal Info & Q&A */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Client Card */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-500 to-teal-500 opacity-20"></div>
                                <div className="relative">
                                    <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                                        <img
                                            src={client.PhotoFront || 'https://via.placeholder.com/150'}
                                            alt={client.FullName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Img'}
                                        />
                                    </div>
                                    <h2 className="text-xl font-bold dark:text-white">{client.FullName}</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{client.Email}</p>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold">
                                        {client.ClientCode}
                                    </span>
                                </div>
                            </div>

                            {/* Q&A Box */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">📋 إجابات الاستبيان</h3>
                                    <button
                                        onClick={copyQA}
                                        className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 font-semibold"
                                        title="نسخ الكل"
                                    >
                                        <FaCopy /> نسخ
                                    </button>
                                </div>
                                <div className="p-4 max-h-[500px] overflow-y-auto text-sm space-y-4 text-gray-600 dark:text-gray-300 whitespace-pre-line custom-scrollbar">
                                    {generateQAText()}
                                </div>
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tabs */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPlanType('training')}
                                    className={`py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${planType === 'training'
                                            ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <FaDumbbell className="text-xl" /> برنامج التدريب
                                </button>
                                <button
                                    onClick={() => setPlanType('nutrition')}
                                    className={`py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${planType === 'nutrition'
                                            ? 'bg-green-600 text-white shadow-lg scale-[1.02]'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <FaAppleAlt className="text-xl" /> خطة التغذية
                                </button>
                            </div>

                            {/* Editor Form */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
                                <div className="mb-6">
                                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        محتوى {planType === 'training' ? 'البرنامج التدريبي' : 'خطة التغذية'}
                                    </label>
                                    <textarea
                                        value={planContent}
                                        onChange={(e) => setPlanContent(e.target.value)}
                                        placeholder={`اكتب تفاصيل ${planType === 'training' ? 'التمرين' : 'الدايت'} هنا...`}
                                        className="w-full h-96 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white font-mono text-base leading-relaxed resize-none"
                                    ></textarea>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            عدد الأيام (مدة الصلاحية)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">يوم</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            تاريخ البدء
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                                            />
                                            <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className={`w-full py-4 rounded-xl font-bold text-xl text-white shadow-lg transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 ${planType === 'training'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                                            : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600'
                                        }`}
                                >
                                    {loading ? 'جاري الحفظ...' : <><FaSave /> حفظ الخطة</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
