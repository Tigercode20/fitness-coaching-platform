/**
 * Format a date object or string to 'YYYY/MM/DD' format.
 * @param {Date|string|undefined} date - The date to format
 * @returns {string} - Date formatted as 'YYYY/MM/DD' or '-' if invalid
 */
export const formatDate = (date) => {
    if (!date) return '-'
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}/${month}/${day}`
}
