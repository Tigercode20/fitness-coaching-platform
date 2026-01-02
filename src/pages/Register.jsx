// ============================================
// src/pages/Register.jsx
// Register Page
// ============================================

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp } from '../services/authService'
import { validateEmail } from '../utils/helpers'

export default function Register() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'coach'
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Validation
            if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
                throw new Error('يرجى ملء جميع الحقول')
            }

            if (!validateEmail(formData.email)) {
                throw new Error('البريد الإلكتروني غير صحيح')
            }

            if (formData.password.length < 6) {
                throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error('كلمات المرور غير متطابقة')
            }

            // Sign Up
            await signUp(formData.email, formData.password, {
                fullName: formData.fullName,
                role: formData.role
            })

            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                <div className="card">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-primary mb-2">💪</h1>
                        <h2 className="text-2xl font-bold text-dark">إنشاء حساب جديد</h2>
                        <p className="text-gray-600 mt-2">
                            انضم إلى منصة المدرب الأونلاين
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-danger mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="fullName">الاسم الكامل</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="أدخل اسمك الكامل"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">البريد الإلكتروني</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="أدخل بريدك الإلكتروني"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">الدور</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="coach">مدرب</option>
                                <option value="admin">مسؤول</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">كلمة المرور</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="أدخل كلمة المرور"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="أعد إدخال كلمة المرور"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                        >
                            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border-color">
                        <p className="text-center text-gray-600 mb-4">
                            هل لديك حساب بالفعل؟
                        </p>
                        <Link
                            to="/login"
                            className="btn btn-outline btn-full"
                        >
                            دخول الحساب
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
