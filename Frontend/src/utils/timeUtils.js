/**
 * Time Utilities - Consistent time formatting across app
 * Fixes duplicate formatTime functions issue
 */

/**
 * Format relative time (for conversation list)
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted relative time
 */
export const formatRelativeTime = (date) => {
    if (!date) return "";
    
    const now = new Date();
    const messageTime = new Date(date);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    // For older dates, show actual date
    return messageTime.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Format message time (HH:mm format)
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted time string
 */
export const formatMessageTime = (date) => {
    if (!date) return "";
    
    return new Date(date).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * Format full date and time for tables/details
 * @param {string|Date} date - Date to format
 * @returns {string} - Full formatted datetime
 */
export const formatFullDateTime = (date) => {
    if (!date) return "N/A";
    
    return new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Format date only (for tables)
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return "N/A";
    
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};