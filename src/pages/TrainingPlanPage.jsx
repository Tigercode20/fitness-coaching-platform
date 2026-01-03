// ============================================
// src/pages/TrainingPlanPage.jsx
// صفحة إنشاء خطط التدريب (Create Training Plans)
// ============================================

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaCopy, FaSave, FaCalendarAlt, FaDumbbell, FaAppleAlt, FaUserClock } from 'react-icons/fa'
import { getClientByCode, getRecentClients } from '../services/clientService'
import Parse from '../services/back4app'
import { toast } from 'react-toastify'

export default function TrainingPlanPage() {
    const navigate = useNavigate()

    // Search State
    const [clientCode, setClientCode] = useState('C-')
    const [client, setClient] = useState(null)
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [recentClients, setRecentClients] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)

    // Plan State
    const [planType, setPlanType] = useState('training') // 'training' or 'nutrition'
    const [planContent, setPlanContent] = useState('')
    const [duration, setDuration] = useState(30)
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        loadRecentClients()

        // Click outside listener for dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const loadRecentClients = async () => {
        try {
            const clients = await getRecentClients(10)
            setRecentClients(clients)
        } catch (error) {
            console.error('Failed to load recent clients', error)
        }
    }

    // Handle Input Change (Auto Prefix "C-")
    const handleCodeChange = (e) => {
        let val = e.target.value

        // If user deleted everything, reset to "C-" or empty if they deleted the C too, but let's keep it "C-" friendly
        if (val.length < 2 && !val.startsWith('C-')) {
            // Check if they are deleting
            if (val === 'C' || val === '') {
                setClientCode('') // Allow empty
                return
            }
        }

        // Force uppercase for display consistency? User said "doesn't matter case".
        // But for "C-" let's keep it clean.
        if (!val.toUpperCase().startsWith('C-') && val.length > 0) {
            // Try to fix it? e.g. user typed "1001" -> "C-1001"
            if (!isNaN(val)) {
                val = 'C-' + val
            } else if (val.toLowerCase().startsWith('c') && !val.toLowerCase().startsWith('c-')) {
                // user typed "c1001" -> "C-1001"
                val = 'C-' + val.substring(1)
            }
        }

        setClientCode(val)
        setShowDropdown(true)
    }

    const handleSearch = async (e) => {
        if (e) e.preventDefault()

        // Add "C-" if missing when searching
        let codeToSearch = clientCode.trim()
        if (codeToSearch && !codeToSearch.toUpperCase().startsWith('C-')) {
            codeToSearch = 'C-' + codeToSearch
            setClientCode(codeToSearch) // update UI
        }

        if (!codeToSearch) return

        setSearching(true)
        setShowDropdown(false)
        try {
            // Case insensitive search is handled by ensuring we send the correct format
            // Assuming DB stores as "C-1001" (Uppercase C).
            // We'll capitalize the 'C' part at least.
            const formattedCode = codeToSearch.charAt(0).toUpperCase() + codeToSearch.slice(1)

            const foundClient = await getClientByCode(formattedCode)
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

    const selectClient = (c) => {
        setClientCode(c.ClientCode)
        setClient(c)
        setShowDropdown(false)
        toast.success(`تم اختيار: ${c.FullName}`)
    }

    const generateQAText = () => {
        if (!client) return ''
        return `
👤 بيانات شخصية:
- الهاتف: ${client.PhoneNumber}
- الكود: ${client.ClientCode}
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
${client.additionalNotes ? '- ملاحظات إضافية: ' + client.additionalNotes : ''}
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
            // Keep the editor open maybe? Or clear? 
            // User: "Then a save button... gets saved"
        } catch (error) {
            console.error(error)
            toast.error('❌ فشل حفظ الخطة: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    // Filter Dropdown
    const filteredClients = recentClients.filter(c => {
        if (!clientCode || clientCode === 'C-') return true
        const search = clientCode.toLowerCase()
        return (c.FullName && c.FullName.toLowerCase().includes(search)) ||
            (c.ClientCode && c.ClientCode.toLowerCase().includes(search))
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📄 إنشاء خطط التدريب</h1>
                        <p className="text-gray-600 dark:text-gray-400">نظام ذكي لإنشاء ومتابعة خطط العملاء</p>
                    </div>
                </div>

                {/* Search Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 relative z-20">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full relative" ref={dropdownRef}>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                كود أو اسم العميل
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={clientCode}
                                    onChange={handleCodeChange}
                                    onFocus={() => setShowDropdown(true)}
                                    placeholder="C-1001"
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white transition dir-ltr font-mono text-lg"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">#</span>
                            </div>

                            {/* Dropdown Results */}
                            {showDropdown && filteredClients.length > 0 && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto no-scrollbar z-50">
                                    <div className="p-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                        {clientCode && clientCode !== 'C-' ? 'نتائج البحث' : 'أحدث النشاطات'}
                                    </div>
                                    {filteredClients.map(c => (
                                        <div
                                            key={c.id}
                                            onClick={() => selectClient(c)}
                                            className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 transition-colors border-b dark:border-gray-700/50 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                                                <img
                                                    src={c.personalImageUrl || c.PhotoFront || 'https://via.placeholder.com/150'}
                                                    alt={c.FullName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{c.FullName}</p>
                                                <p className="text-xs text-gray-500">{c.ClientCode}</p>
                                            </div>
                                            {(c.updatedAt) && (
                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                    <FaUserClock />
                                                    {new Date(c.updatedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={searching}
                            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 h-[52px]"
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
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 text-center relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 transition-all group-hover:opacity-100"></div>
                                <div className="relative pt-8">
                                    <div className="w-32 h-32 mx-auto bg-white dark:bg-gray-700 rounded-full mb-4 overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl relative z-10 transition-transform group-hover:scale-105">
                                        <img
                                            src={client.personalImageUrl || client.PhotoFront || 'https://via.placeholder.com/150'}
                                            alt={client.FullName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Img'}
                                        />
                                    </div>
                                    <h2 className="text-2xl font-bold dark:text-white mb-1">{client.FullName}</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 font-mono">{client.Email}</p>
                                    <div className="flex justify-center gap-2">
                                        <span className="bg-blue-100 text-blue-800 text-sm px-4 py-1.5 rounded-full font-bold shadow-sm">
                                            {client.ClientCode}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Q&A Box */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden flex flex-col max-h-[600px]">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 flex justify-between items-center shrink-0">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        📊 بيانات الاستبيان
                                    </h3>
                                    <button
                                        onClick={copyQA}
                                        className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded text-xs flex items-center gap-1 font-bold transition shadow-sm"
                                        title="نسخ الكل"
                                    >
                                        <FaCopy /> نسخ
                                    </button>
                                </div>
                                <div className="p-5 overflow-y-auto text-sm space-y-4 text-gray-700 dark:text-gray-300 whitespace-pre-line custom-scrollbar leading-relaxed">
                                    {generateQAText()}
                                </div>
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tabs */}
                            <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                                <button
                                    onClick={() => setPlanType('training')}
                                    className={`py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${planType === 'training'
                                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    <FaDumbbell className="text-xl" /> برنامج التدريب
                                </button>
                                <button
                                    onClick={() => setPlanType('nutrition')}
                                    className={`py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${planType === 'nutrition'
                                        ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-md'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    <FaAppleAlt className="text-xl" /> خطة التغذية
                                </button>
                            </div>

                            {/* Editor Form */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700 relative">
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 text-lg">
                                            محتوى {planType === 'training' ? 'البرنامج التدريبي' : 'خطة التغذية'}
                                        </label>
                                        <span className="text-xs text-gray-400">يدعم اللصق المباشر من ChatGPT</span>
                                    </div>
                                    <textarea
                                        value={planContent}
                                        onChange={(e) => setPlanContent(e.target.value)}
                                        placeholder={`اكتب او الصق تفاصيل ${planType === 'training' ? 'التمرين' : 'الدايت'} هنا...`}
                                        className="w-full h-[400px] p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white font-mono text-base leading-relaxed resize-none shadow-inner"
                                    ></textarea>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-8 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border dark:border-gray-700/50">
                                    <div>
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                                            عدد الأيام (مدة الصلاحية)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="w-full pl-4 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white font-bold text-center"
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">يوم</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                                            تاريخ البدء
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
                                            />
                                            <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className={`w-full py-4 rounded-xl font-bold text-xl text-white shadow-lg transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 ${planType === 'training'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/30'
                                        : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-green-500/30'
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
