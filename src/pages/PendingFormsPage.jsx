// ============================================
// src/pages/PendingFormsPage.jsx
// Pending Forms Management Page - Enhanced
// ============================================

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaTrash, FaEye, FaSpinner, FaEdit, FaSave } from 'react-icons/fa';
import {
    getPendingForms,
    approvePendingForm,
    rejectPendingForm,
    deletePendingForm,
    updatePendingForm
} from '../services/pendingFormService';
import { addNewClient, getAllClients } from '../services/clientService';
import { addSubscription } from '../services/subscriptionService';
import FormPreview from '../components/FormPreview';

export default function PendingFormsPage() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedForm, setSelectedForm] = useState(null);
    const [filter, setFilter] = useState('pending');
    const [processing, setProcessing] = useState(false);

    // Edit Mode State
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});

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

    // Generate sequential client code (C-1001, C-1002, etc.)
    const generateClientCode = async () => {
        try {
            const clients = await getAllClients();

            // Extract all existing codes that match C-XXXX pattern
            const codes = clients
                .map(c => c.ClientCode || c.clientCode)
                .filter(code => code && /^C-\d+$/.test(code))
                .map(code => parseInt(code.replace('C-', ''), 10));

            // Find the highest code number, default to 1000 if none exist
            const maxCode = codes.length > 0 ? Math.max(...codes) : 1000;

            // Generate next code
            const nextCode = `C-${maxCode + 1}`;
            console.log('📊 Existing codes:', codes.length, 'Max:', maxCode, 'Next:', nextCode);
            return nextCode;
        } catch (error) {
            console.error('❌ Error generating code:', error);
            // Fallback to timestamp-based if query fails
            const fallback = `C-${Date.now().toString().slice(-6)}`;
            console.log('⚠️ Using fallback code:', fallback);
            return fallback;
        }
    };

    const handleApprove = async (form) => {
        if (processing) return;
        setProcessing(true);
        try {
            // Get data (either edited or original)
            const rawData = editMode ? { ...editData } : { ...form.data };

            // ✅ Clean data - remove undefined, null, empty strings
            const cleanData = Object.entries(rawData).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {});

            console.log('📋 Raw data:', rawData);
            console.log('🧹 Clean data:', cleanData);

            // Add ClientCode for new clients (sequential)
            if (form.type === 'client' && !cleanData.ClientCode) {
                cleanData.ClientCode = await generateClientCode();
            }

            // Add approval metadata
            cleanData.approvedAt = new Date().toISOString();
            cleanData.Status = 'Active';

            console.log('📦 Final data to save:', cleanData);

            // 1. Save to the appropriate final collection
            if (form.type === 'client') {
                await addNewClient(cleanData);
            } else if (form.type === 'subscription') {
                await addSubscription(cleanData);
            }

            // 2. Mark as approved
            await approvePendingForm(form.id, cleanData);

            console.log('✅ Saved successfully!');

            // 3. Refresh
            loadForms();
            setSelectedForm(null);
            setEditMode(false);
            setEditData({});
            alert(`✅ تم الموافقة والحفظ بنجاح!${form.type === 'client' ? `\n\nكود العميل: ${cleanData.ClientCode}` : ''}`);
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
            setEditMode(false);
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
            if (selectedForm?.id === formId) {
                setSelectedForm(null);
                setEditMode(false);
            }
            alert('✅ تم الحذف');
        } catch (error) {
            console.error('❌ Error deleting:', error);
            alert('❌ حدث خطأ');
        } finally {
            setProcessing(false);
        }
    };

    // Start editing
    const handleStartEdit = () => {
        setEditData({ ...selectedForm.data });
        setEditMode(true);
    };

    // Save edits to pending form
    const handleSaveEdit = async () => {
        if (processing) return;
        setProcessing(true);
        try {
            await updatePendingForm(selectedForm.id, editData);
            // Update local state
            setForms(prev => prev.map(f =>
                f.id === selectedForm.id ? { ...f, data: editData } : f
            ));
            setSelectedForm(prev => ({ ...prev, data: editData }));
            setEditMode(false);
            alert('✅ تم حفظ التعديلات');
        } catch (error) {
            console.error('❌ Error saving edit:', error);
            alert('❌ حدث خطأ');
        } finally {
            setProcessing(false);
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditMode(false);
        setEditData({});
    };

    // Handle edit field change
    const handleEditChange = (key, value) => {
        setEditData(prev => ({ ...prev, [key]: value }));
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

    // Translate field keys
    const translateKey = (key) => {
        const translations = {
            fullName: 'الاسم الكامل', FullName: 'الاسم الكامل',
            email: 'البريد الإلكتروني', Email: 'البريد الإلكتروني',
            phone: 'رقم الهاتف', PhoneNumber: 'رقم الهاتف',
            age: 'العمر', Age: 'العمر',
            gender: 'الجنس', Gender: 'الجنس',
            mainGoal: 'الهدف الرئيسي', Goal: 'الهدف', goal: 'الهدف',
            notes: 'ملاحظات', Notes: 'ملاحظات',
            healthConditions: 'الحالات الصحية',
            injuries: 'الإصابات',
            medications: 'الأدوية',
        };
        return translations[key] || key;
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
                            onClick={() => { setFilter(status); setSelectedForm(null); setEditMode(false); }}
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
                                    onClick={() => { setSelectedForm(form); setEditMode(false); }}
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
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {editMode ? <><FaEdit /> تعديل البيانات</> : <><FaEye /> معاينة البيانات</>}
                                </h2>
                                {selectedForm.status === 'pending' && !editMode && (
                                    <button
                                        onClick={handleStartEdit}
                                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg flex items-center gap-1"
                                    >
                                        <FaEdit /> تعديل
                                    </button>
                                )}
                            </div>

                            {/* Edit Mode or Preview */}
                            {editMode ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {Object.entries(editData).map(([key, value]) => (
                                        <div key={key} className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {translateKey(key)}
                                            </label>
                                            <input
                                                type="text"
                                                value={value || ''}
                                                onChange={(e) => handleEditChange(key, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <FormPreview form={selectedForm} />
                            )}

                            {/* Actions */}
                            {editMode ? (
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={processing}
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                                    >
                                        <FaSave /> حفظ التعديلات
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-bold"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
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
