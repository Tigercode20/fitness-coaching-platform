import { FaExternalLinkAlt } from 'react-icons/fa'

export default function ClientDetailsModal({ client, isOpen, onClose }) {
    if (!isOpen || !client) return null

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-gray-700">
                <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b dark:border-gray-800 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">{client.FullName || client.fullName}</h2>
                        <div className="flex gap-4 text-sm text-gray-500 mt-1">
                            <span>كود: {client.ClientCode || client.code}</span>
                            <span>•</span>
                            <span>{client.Timestamp || new Date(client.createdAt).toLocaleDateString('ar-EG') || 'تاريخ التسجيل غير متوفر'}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl">&times;</button>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-8">
                    {/* قسم البيانات الشخصية */}
                    <section>
                        <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-4 border-b pb-2">👤 بيانات شخصية</h3>
                        <div className="space-y-3">
                            <DetailRow label="البريد الإلكتروني" value={client.Email || client.email} />
                            <DetailRow label="رقم الهاتف" value={client.PhoneNumber || client.phone} />
                            <DetailRow label="النوع" value={client.Gender} />
                            <DetailRow label="تاريخ الميلاد" value={client.DOB} />
                            <DetailRow label="الدولة" value={client.Country} />
                            <DetailRow label="الوظيفة" value={client.Job} />
                            <DetailRow label="الديانة" value={client.Religion} />
                        </div>
                    </section>

                    {/* قسم القياسات والصحة */}
                    <section>
                        <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-4 border-b pb-2">🏥 الصحة والقياسات</h3>
                        <div className="space-y-3">
                            <DetailRow label="الوزن الحالي" value={client.Weight} />
                            <DetailRow label="الطول" value={client.Height} />
                            <DetailRow label="هل تعاني من مشاكل صحية؟" value={client.HealthIssues} />
                            <DetailRow label="هل تستخدم أدوية؟" value={client.Medications} />
                            <DetailRow label="هل لديك إصابات؟" value={client.Injuries} />
                            <DetailRow label="هل أنت مدخن؟" value={client.Smoker} />
                            <DetailRow label="عمل تحاليل مؤخراً؟" value={client.DidTests} />
                            <FileLink label="ملف التحاليل" url={client.TestsFile} />
                            <FileLink label="ملف الأشعة" url={client.XrayFile} />
                        </div>
                    </section>

                    {/* قسم التغذية */}
                    <section>
                        <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-4 border-b pb-2">🍎 التغذية</h3>
                        <div className="space-y-3">
                            <DetailRow label="الهدف من الاشتراك" value={client.Goal} />
                            <DetailRow label="تاريخ الدايت السابق" value={client.DietHistory} />
                            <DetailRow label="طبيعة اليوم والمجهود" value={client.DailyActivity} />
                            <DetailRow label="أسباب عدم الالتزام" value={client.ComplianceIssues} />
                            <DetailRow label="هل تشرب منبهات؟" value={client.Caffeine} />
                            <DetailRow label="حساسية من طعام" value={client.FoodAllergies} />
                            <DetailRow label="طعام لا تحبه" value={client.DislikedFood} />
                            <DetailRow label="هل تريد فيتامينات؟" value={client.WantVitamins} />
                            <DetailRow label="عدد الوجبات المفضل" value={client.MealsCount} />
                            <DetailRow label="نوع النظام (مرن/قاسي)" value={client.DietType} />
                            <DetailRow label="الميزانية" value={client.Budget} />
                            <DetailRow label="البروتين المفضل" value={client.FavProtein} />
                            <DetailRow label="الكربوهيدرات المفضلة" value={client.FavCarbs} />
                            <DetailRow label="الدهون المفضلة" value={client.FavFats} />
                            <FileLink label="ملف آخر دايت" url={client.LastDietFile} />
                        </div>
                    </section>

                    {/* قسم التمرين */}
                    <section>
                        <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-4 border-b pb-2">💪 التمرين</h3>
                        <div className="space-y-3">
                            <DetailRow label="الخبرة في التمرين" value={client.TrainingExp} />
                            <DetailRow label="مدة ممارسة الحديد" value={client.LiftingDuration} />
                            <DetailRow label="هل تمارس رياضة أخرى؟" value={client.OtherSports} />
                            <DetailRow label="مكان التمرين" value={client.GymLocation} />
                            <DetailRow label="الأدوات المتاحة" value={client.AvailableTools} />
                            <DetailRow label="عدد أيام التمرين" value={client.TrainingDays} />
                            <DetailRow label="الأيام المتاحة" value={client.AvailableDays} />
                            <DetailRow label="تمارين تسبب ألم" value={client.PainfulExercises} />
                            <DetailRow label="الكارديو المفضل" value={client.FavCardio} />
                            <DetailRow label="متوسط خطوات اليوم" value={client.StepsCount} />
                        </div>
                    </section>

                    {/* معلومات إضافية */}
                    <section className="md:col-span-2">
                        <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-4 border-b pb-2">ℹ️ معلومات إضافية</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <DetailRow label="تجربة سابقة أونلاين؟" value={client.OnlineExp} />
                            <DetailRow label="سبب الاشتراك معنا؟" value={client.JoinReason} />
                        </div>
                    </section>

                    {/* ملاحظات */}
                    <section className="md:col-span-2">
                        <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-4 border-b pb-2">📝 ملاحظات إضافية</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                            <p className="dark:text-gray-300 whitespace-pre-wrap">{client.Notes || 'لا توجد ملاحظات إضافية'}</p>
                        </div>
                    </section>

                    {/* الصور */}
                    <section className="md:col-span-2">
                        <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-4 border-b pb-2">📸 صور الجسم والملفات</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <ImageCard label="أمامية" url={client.files?.front || client.PhotoFront} />
                            <ImageCard label="جانبية" url={client.files?.side || client.PhotoSide} />
                            <ImageCard label="خلفية" url={client.files?.back || client.PhotoBack} />
                        </div>
                        <div className="mt-4 flex gap-4">
                            <FileLink label="ملف التحاليل" url={client.files?.tests || client.TestsFile} />
                            <FileLink label="ملف الأشعة" url={client.files?.xray || client.XrayFile} />
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t dark:border-gray-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    )
}

function DetailRow({ label, value }) {
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

                {/* Fallback link if image fails */}
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
