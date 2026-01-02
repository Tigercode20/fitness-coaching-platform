// ============================================
// src/pages/Home.jsx
// Home Page
// ============================================

import { Link } from 'react-router-dom'
import { FaDumbbell, FaUsers, FaChartLine, FaLock } from 'react-icons/fa'

export default function Home() {
    return (
        <div className="bg-light">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary">💪 منصة المدرب الأونلاين</h1>
                    <nav className="space-x-4">
                        <Link to="/login" className="btn btn-outline btn-sm">
                            دخول
                        </Link>
                        <Link to="/register" className="btn btn-primary btn-sm">
                            تسجيل جديد
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-b from-primary/10 to-light py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                        إدارة عملاء التدريب بسهولة
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        منصة شاملة لإدارة العملاء والاشتراكات والخطط الغذائية والبرامج التمرينية
                    </p>
                    <div className="space-x-4">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            ابدأ الآن
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-lg">
                            دخول الحساب
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h3 className="text-3xl font-bold text-center text-dark mb-12">
                        المميزات الرئيسية
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="card">
                            <div className="text-4xl text-primary mb-4">
                                <FaUsers />
                            </div>
                            <h4 className="text-xl font-semibold text-dark mb-2">إدارة العملاء</h4>
                            <p className="text-gray-600">
                                أضف وأدير بيانات العملاء بسهولة مع تتبع شامل
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card">
                            <div className="text-4xl text-primary mb-4">
                                <FaDumbbell />
                            </div>
                            <h4 className="text-xl font-semibold text-dark mb-2">برامج تدريبية</h4>
                            <p className="text-gray-600">
                                أنشئ وأرسل برامج تدريبية مخصصة لكل عميل
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card">
                            <div className="text-4xl text-primary mb-4">
                                <FaChartLine />
                            </div>
                            <h4 className="text-xl font-semibold text-dark mb-2">إحصائيات ودعم</h4>
                            <p className="text-gray-600">
                                متابعة تقدم العملاء مع تقارير تفصيلية
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card">
                            <div className="text-4xl text-primary mb-4">
                                <FaLock />
                            </div>
                            <h4 className="text-xl font-semibold text-dark mb-2">أمان عالي</h4>
                            <p className="text-gray-600">
                                بيانات آمنة وخاصة مع تشفير قوي
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-primary to-primary-dark py-16">
                <div className="max-w-4xl mx-auto px-4 text-center text-white">
                    <h3 className="text-3xl font-bold mb-4">
                        جاهز لبدء رحلتك؟
                    </h3>
                    <p className="text-lg mb-8">
                        انضم إلى آلاف المدربين الذين يستخدمون منصتنا
                    </p>
                    <Link to="/register" className="btn bg-white text-primary hover:bg-gray-100 btn-lg">
                        إنشاء حساب مجاني
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-dark text-white py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>&copy; 2026 منصة المدرب الأونلاين. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    )
}
