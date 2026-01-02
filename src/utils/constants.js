// ============================================
// src/utils/constants.js
// Application Constants
// ============================================

export const PACKAGES = [
    { id: 'Gold', label: 'Gold', price: 2000, currency: 'EGP' },
    { id: 'Wafry', label: 'Wafry', price: 1500, currency: 'EGP' },
    { id: 'VIP', label: 'VIP', price: 3000, currency: 'EGP' }
];

export const CURRENCIES = [
    { id: 'EGP', label: 'Egyptian Pound' },
    { id: 'USD', label: 'US Dollar' },
    { id: 'AED', label: 'UAE Dirham' },
    { id: 'SAR', label: 'Saudi Riyal' },
    { id: 'KWD', label: 'Kuwaiti Dinar' },
    { id: 'EUR', label: 'Euro' }
];

export const SUBSCRIPTION_TYPES = [
    { id: 'New', label: 'اشتراك جديد' },
    { id: 'Renew', label: 'تجديد اشتراك' }
];

export const SUBSCRIPTION_STATUS = [
    { id: 'Pending', label: 'قيد الانتظار', color: 'warning' },
    { id: 'Active', label: 'نشط', color: 'success' },
    { id: 'Expiring Soon', label: 'ينتهي قريباً', color: 'warning' },
    { id: 'Expired', label: 'منتهي', color: 'danger' },
    { id: 'OnHold', label: 'موقوف', color: 'gray' }
];

export const GENDERS = [
    { id: 'Male', label: 'ذكر' },
    { id: 'Female', label: 'أنثى' },
    { id: 'Other', label: 'آخر' }
];

export const EXPERIENCE_LEVELS = [
    { id: 'مبتدئ', label: 'مبتدئ' },
    { id: 'متوسط', label: 'متوسط' },
    { id: 'متقدم', label: 'متقدم' }
];

export const DIET_TYPES = [
    { id: 'مرن', label: 'مرن' },
    { id: 'قاسي', label: 'قاسي' }
];

export const PLAN_DURATIONS = [
    { id: 7, label: '7 أيام' },
    { id: 14, label: '14 يوم' },
    { id: 30, label: '30 يوم' }
];

export const FORM_VALIDATION_MESSAGES = {
    required: 'هذا الحقل مطلوب',
    email: 'البريد الإلكتروني غير صحيح',
    password: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    phoneNumber: 'رقم الهاتف غير صحيح',
    weight: 'الوزن يجب أن يكون رقم موجب',
    height: 'الطول يجب أن يكون رقم موجب'
};
