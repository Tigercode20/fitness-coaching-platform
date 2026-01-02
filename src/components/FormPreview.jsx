// ============================================
// src/components/FormPreview.jsx
// Reusable Form Data Preview Component
// ============================================

export default function FormPreview({ form }) {
    const { type, data } = form;

    const renderClientPreview = () => (
        <div className="space-y-3">
            <Item label="الاسم الكامل" value={data?.fullName || data?.FullName} />
            <Item label="البريد الإلكتروني" value={data?.email || data?.Email} />
            <Item label="رقم الهاتف" value={data?.phone || data?.PhoneNumber} />
            <Item label="العمر" value={data?.age || data?.Age} />
            <Item label="الجنس" value={data?.gender || data?.Gender} />
            <Item label="الهدف" value={data?.mainGoal || data?.Goal} />
            <Item label="ملاحظات" value={data?.notes || data?.Notes} />
        </div>
    );

    const renderSubscriptionPreview = () => (
        <div className="space-y-3">
            <Item label="اسم العميل" value={data?.ClientName} />
            <Item label="الباقة" value={data?.Type} />
            <Item label="السعر" value={data?.Price ? `${data.Price} EGP` : null} />
            <Item label="تاريخ البداية" value={data?.StartDate} />
            <Item label="تاريخ النهاية" value={data?.EndDate} />
            <Item label="الحالة" value={data?.Status} />
        </div>
    );

    const renderGenericPreview = () => (
        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(data, null, 2)}
        </pre>
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            {type === 'client' && renderClientPreview()}
            {type === 'subscription' && renderSubscriptionPreview()}
            {type !== 'client' && type !== 'subscription' && renderGenericPreview()}
        </div>
    );
}

function Item({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex justify-between text-sm border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
            <span className="font-medium text-gray-700 dark:text-gray-300">{label}:</span>
            <span className="text-gray-600 dark:text-gray-400">{value}</span>
        </div>
    );
}
