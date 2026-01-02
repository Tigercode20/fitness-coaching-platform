// ============================================
// src/components/Common/NotFound.jsx
// 404 Not Found Page
// ============================================

import { Link } from 'react-router-dom'

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-light">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-dark mb-2">الصفحة غير موجودة</h2>
                <p className="text-gray-400 mb-6">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
                <Link to="/" className="btn btn-primary">
                    العودة للرئيسية
                </Link>
            </div>
        </div>
    )
}
