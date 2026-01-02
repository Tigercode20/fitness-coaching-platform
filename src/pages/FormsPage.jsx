// ============================================
// src/pages/FormsPage.jsx
// Forms Management Page
// ============================================

import { useState } from 'react'
import { FaUserPlus, FaFileInvoiceDollar, FaDumbbell, FaCalendarCheck } from 'react-icons/fa'
import NewClientForm from '../components/Forms/NewClientForm'
import SalesForm from '../components/Forms/SalesForm'
import STplanForm from '../components/Forms/STplanForm'
import UpdateForm from '../components/Forms/UpdateForm'

export default function FormsPage() {
    const [activeForm, setActiveForm] = useState('newClient')

    const forms = [
        { id: 'newClient', label: 'عميل جديد', icon: FaUserPlus, component: NewClientForm },
        { id: 'sales', label: 'اشتراك جديد', icon: FaFileInvoiceDollar, component: SalesForm },
        { id: 'stPlan', label: 'خطة أولية (ST)', icon: FaDumbbell, component: STplanForm },
        { id: 'update', label: 'متابعة عميل', icon: FaCalendarCheck, component: UpdateForm },
    ]

    const handleFormSubmit = async (data) => {
        console.log('Form Submitted:', activeForm, data)
        alert('تم حفظ البيانات بنجاح! (محاكاة)')
        // Here you would connect to Firebase to save the data
    }

    const ActiveComponent = forms.find(f => f.id === activeForm)?.component || NewClientForm

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark mb-2">الفورمات والنماذج</h1>
                <p className="text-gray-600">إدارة وتسجيل بيانات العملاء والاشتراكات</p>
            </div>

            {/* Form Selection Tabs */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4">
                {forms.map(form => (
                    <button
                        key={form.id}
                        onClick={() => setActiveForm(form.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeForm === form.id
                                ? 'bg-primary text-white shadow-lg transform scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <form.icon className="text-lg" />
                        {form.label}
                    </button>
                ))}
            </div>

            {/* Active Form Render */}
            <div className="animate-fade-in">
                <ActiveComponent onSubmit={handleFormSubmit} />
            </div>
        </div>
    )
}
