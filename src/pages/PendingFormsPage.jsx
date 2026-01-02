// ============================================
// src/pages/PendingFormsPage.jsx
// Pending Forms Management Page
// ============================================

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaTrash, FaEye, FaSpinner } from 'react-icons/fa';
import {
    getPendingForms,
    approvePendingForm,
    rejectPendingForm,
    deletePendingForm
} from '../services/pendingFormService';
import { addNewClient } from '../services/clientService';
import { addSubscription } from '../services/subscriptionService';
import FormPreview from '../components/FormPreview';

export default function PendingFormsPage() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedForm, setSelectedForm] = useState(null);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            setLoading(true);
            const allForms = await getPendingForms();
            setForms(allForms);
        } catch (error) {
            console.error('❌ Error loading forms:', error);
            alert('فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const filteredForms = forms.filter(form => form.status === filter);

    const handleApprove = async (form) => {
        if (processing) return;
        setProcessing(true);
        try {
            // 1. Save to the appropriate final collection
            if (form.type === 'client') {
                await addNewClient(form.data);
            } else if (form.type === 'subscription') {
                await addSubscription(form.data);
            }

            // 2. Mark as approved
            await approvePendingForm(form.id, form.data);

            // 3. Refresh
            loadForms();
            setSelectedForm(null);
            alert('✅ تم الموافقة والحفظ بنجاح!');
        } catch (error) {
            console.error('❌ Error approving:', error);
            alert('❌ حدث خطأ أثناء الموافقة');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (formId) => {
        const reason = prompt('سبب الرفض (اختياري):');
        if (processing) return;
        setProcessing(true);
        try {
            await rejectPendingForm(formId, reason || '');
            loadForms();
            setSelectedForm(null);
            alert('✅ تم الرفض');
        } catch (error) {
            console.error('❌ Error rejecting:', error);
            alert('❌ حدث خطأ');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (formId) => {
        if (!confirm('هل تريد حذف هذا الفورم نهائياً؟')) return;
        if (processing) return;
        setProcessing(true);
        try {
            await deletePendingForm(formId);
            loadForms();
            if (selectedForm?.id === formId) setSelectedForm(null);
            alert('✅ تم الحذف');
        } catch (error) {
            console.error('❌ Error deleting:', error);
            alert('❌ حدث خطأ');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">⏳ معلق</span>;
            case 'approved':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">✅ موافق</span>;
            case 'rejected':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">❌ مرفوض</span>;
            default:
                return null;
        }
    };

    const getFormTypeIcon = (type) => {
        switch (type) {
            case 'client': return '👤';
            case 'subscription': return '💳';
            default: return '📝';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <FaSpinner className="animate-spin text-4xl text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        📋 الفورمات المعلقة
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>إجمالي: <strong>{forms.length}</strong></span>
                        <span>معلقة: <strong className="text-yellow-600">{forms.filter(f => f.status === 'pending').length}</strong></span>
                        <span>موافق: <strong className="text-green-600">{forms.filter(f => f.status === 'approved').length}</strong></span>
                        <span>مرفوض: <strong className="text-red-600">{forms.filter(f => f.status === 'rejected').length}</strong></span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['pending', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg transition font-medium ${filter === status
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary'
                                }`}
                        >
                            {status === 'pending' && '⏳ معلقة'}
                            {status === 'approved' && '✅ موافق عليها'}
                            {status === 'rejected' && '❌ مرفوضة'}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Forms List */}
                    <div className="space-y-4">
                        {filteredForms.length === 0 ? (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <p className="text-4xl mb-2">📭</p>
                                <p>لا توجد فورمات {filter === 'pending' ? 'معلقة' : filter === 'approved' ? 'موافق عليها' : 'مرفوضة'}</p>
                            </div>
                        ) : (
                            filteredForms.map(form => (
                                <div
                                    key={form.id}
                                    onClick={() => setSelectedForm(form)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${selectedForm?.id === form.id
                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                                <span>{getFormTypeIcon(form.type)}</span>
                                                {form.type === 'client' && 'عميل جديد'}
                                                {form.type === 'subscription' && 'اشتراك جديد'}
                                                {form.type !== 'client' && form.type !== 'subscription' && 'طلب جديد'}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {form.data?.fullName || form.data?.FullName || form.data?.ClientName || 'بدون اسم'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {form.createdAt?.toDate ? new Date(form.createdAt.toDate()).toLocaleString('ar-EG') : 'N/A'}
                                            </p>
                                        </div>
                                        {getStatusBadge(form.status)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right: Preview & Actions */}
                    {selectedForm ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-4 self-start">
                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <FaEye /> معاينة البيانات
                            </h2>

                            {/* Form Preview Component */}
                            <FormPreview form={selectedForm} />

                            {/* Actions */}
                            {selectedForm.status === 'pending' && (
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleApprove(selectedForm)}
                                        disabled={processing}
                                        className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition font-bold flex items-center justify-center gap-2"
                                    >
                                        {processing ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                        موافقة وحفظ
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedForm.id)}
                                        disabled={processing}
                                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition font-bold flex items-center justify-center gap-2"
                                    >
                                        <FaTimes /> رفض
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => handleDelete(selectedForm.id)}
                                disabled={processing}
                                className="w-full mt-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                <FaTrash /> حذف نهائي
                            </button>
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                            <p>اختر فورم من القائمة لعرض التفاصيل</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
