// ============================================
// src/utils/helpers.js
// Helper Functions
// ============================================

/**
 * Format date to Arabic format
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ar-EG');
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'EGP') => {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

/**
 * Validate Email
 */
export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validate Phone Number (Egypt)
 */
export const validatePhoneNumber = (phone) => {
    const regex = /^(\+20|0)[0-9]{9,10}$/;
    return regex.test(phone);
};

/**
 * Validate Egyptian National ID
 */
export const validateNationalID = (id) => {
    return /^\d{14}$/.test(id);
};

/**
 * Generate Client Code
 */
export const generateClientCode = () => {
    return 'C' + Date.now().toString().slice(-8);
};

/**
 * Calculate Age from Birth Date
 */
export const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

/**
 * Calculate BMI
 */
export const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
};

/**
 * Get BMI Category
 */
export const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'نقص وزن', color: 'warning' };
    if (bmi < 25) return { category: 'وزن صحي', color: 'success' };
    if (bmi < 30) return { category: 'زيادة وزن', color: 'warning' };
    return { category: 'السمنة', color: 'danger' };
};

/**
 * Days until date
 */
export const daysUntil = (date) => {
    const today = new Date();
    const endDate = new Date(date);
    const diff = endDate - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Get Subscription Status Color
 */
export const getStatusColor = (status) => {
    const colors = {
        'Pending': '#a84b2f',
        'Active': '#218d8d',
        'Expiring Soon': '#a84b2f',
        'Expired': '#c01527',
        'OnHold': '#777c7c'
    };
    return colors[status] || '#777c7c';
};

/**
 * Truncate Text
 */
export const truncate = (text, length = 50) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Check if File is Image
 */
export const isImageFile = (file) => {
    return file && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
};

/**
 * Check if File is PDF
 */
export const isPDFFile = (file) => {
    return file && file.type === 'application/pdf';
};

/**
 * Format File Size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
