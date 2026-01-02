// ============================================
// src/components/Common/Loading.jsx
// Loading Spinner Component
// ============================================

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-light">
            <div className="text-center">
                <div className="mb-4">
                    <div className="inline-block animate-spin">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                </div>
                <h2 className="text-xl font-semibold text-dark mb-2">جاري التحميل...</h2>
                <p className="text-gray-400">يرجى الانتظار قليلاً</p>
            </div>
        </div>
    )
}
