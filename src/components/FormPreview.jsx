// ============================================
// src/components/FormPreview.jsx
// Reusable Form Data Preview Component - Enhanced
// ============================================

export default function FormPreview({ form, onEdit }) {
    const { type, data } = form;

    // Show ALL data dynamically
    const renderAllFields = () => {
        if (!data) return <p className="text-gray-500">لا توجد بيانات</p>;

        const entries = Object.entries(data);
        if (entries.length === 0) return <p className="text-gray-500">لا توجد بيانات</p>;

        return (
            <div className="space-y-2 max-h-80 overflow-y-auto">
                {entries.map(([key, value]) => (
                    <Item key={key} label={translateKey(key)} value={formatValue(value)} />
                ))}
            </div>
        );
    };

    // Translate field keys to Arabic
    const translateKey = (key) => {
        const translations = {
            fullName: 'الاسم الكامل',
            FullName: 'الاسم الكامل',
            email: 'البريد الإلكتروني',
            Email: 'البريد الإلكتروني',
            phone: 'رقم الهاتف',
            PhoneNumber: 'رقم الهاتف',
            age: 'العمر',
            Age: 'العمر',
            gender: 'الجنس',
            Gender: 'الجنس',
            mainGoal: 'الهدف الرئيسي',
            Goal: 'الهدف',
            goal: 'الهدف',
            goalDetails: 'تفاصيل الهدف',
            reason: 'السبب',
            notes: 'ملاحظات',
            Notes: 'ملاحظات',
            healthConditions: 'الحالات الصحية',
            injuries: 'الإصابات',
            medications: 'الأدوية',
            experienceLevel: 'مستوى الخبرة',
            trainingFrequency: 'تكرار التمرين',
            frontPhoto: 'صورة أمامية',
            sidePhoto: 'صورة جانبية',
            backPhoto: 'صورة خلفية',
            Status: 'الحالة',
            status: 'الحالة',
            ClientName: 'اسم العميل',
            ClientID: 'معرف العميل',
            Type: 'النوع',
            Price: 'السعر',
            StartDate: 'تاريخ البداية',
            EndDate: 'تاريخ النهاية',
            PaidAmount: 'المبلغ المدفوع',
            RemainingAmount: 'المبلغ المتبقي',
            ClientCode: 'كود العميل',
            createdAt: 'تاريخ الإنشاء',
        };
        return translations[key] || key;
    };

    // Format values for display
    const formatValue = (value) => {
        if (value === null || value === undefined || value === '') return '—';
        if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
        if (typeof value === 'object') {
            // Handle Firestore Timestamp
            if (value.toDate) return value.toDate().toLocaleString('ar-EG');
            return JSON.stringify(value);
        }
        return String(value);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            {/* Type Badge */}
            <div className="mb-4 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${type === 'client' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        type === 'subscription' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {type === 'client' && '👤 عميل'}
                    {type === 'subscription' && '💳 اشتراك'}
                    {type !== 'client' && type !== 'subscription' && `📝 ${type}`}
                </span>
            </div>

            {/* All Fields */}
            {renderAllFields()}
        </div>
    );
}

function Item({ label, value }) {
    if (!value || value === '—') return null;
    return (
        <div className="flex justify-between text-sm border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0 gap-4">
            <span className="font-medium text-gray-700 dark:text-gray-300 shrink-0">{label}:</span>
            <span className="text-gray-600 dark:text-gray-400 text-left break-words">{value}</span>
        </div>
    );
}
