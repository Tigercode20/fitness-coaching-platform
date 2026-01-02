// ============================================
// src/pages/Login.jsx
// Login Page
// ============================================

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn } from '../services/authService'
import { validateEmail } from '../utils/helpers'

export default function Login() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
            if (!formData.email || !formData.password) {
                throw new Error('يرجى ملء جميع الحقول')
            }

            if (!validateEmail(formData.email)) {
                throw new Error('البريد الإلكتروني غير صحيح')
            }

            if (formData.password.length < 6) {
                throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
            }

            // Sign In
            await signIn(formData.email, formData.password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="card">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-primary mb-2">💪</h1>
                        <h2 className="text-2xl font-bold text-dark">دخول الحساب</h2>
                        <p className="text-gray-600 mt-2">
                            مرحباً بعودتك إلى منصة المدرب
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-danger mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
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

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                        >
                            {loading ? 'جاري الدخول...' : 'دخول'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border-color">
                        <p className="text-center text-gray-600 mb-4">
                            ليس لديك حساب؟
                        </p>
                        <Link
                            to="/register"
                            className="btn btn-outline btn-full"
                        >
                            إنشاء حساب جديد
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
