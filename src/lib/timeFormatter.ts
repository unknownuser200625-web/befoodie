/**
 * Smart time formatter for kitchen order displays.
 * Converts timestamps to human-readable relative time.
 */
export function formatOrderTime(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
        return 'Just now';
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }

    if (diffHours < 24) {
        return `${diffHours} hr ago`;
    }

    return 'Yesterday';
}

/**
 * Get urgency level based on order age.
 * Returns: 'normal' | 'warning' | 'urgent' | 'critical'
 */
export function getOrderUrgency(timestamp: number): 'normal' | 'warning' | 'urgent' | 'critical' {
    const now = Date.now();
    const diffMinutes = Math.floor((now - timestamp) / 1000 / 60);

    if (diffMinutes >= 30) return 'critical';
    if (diffMinutes >= 20) return 'urgent';
    if (diffMinutes >= 10) return 'warning';
    return 'normal';
}

/**
 * Get Tailwind CSS classes for order card based on urgency.
 */
export function getUrgencyStyles(urgency: 'normal' | 'warning' | 'urgent' | 'critical'): string {
    switch (urgency) {
        case 'critical':
            return 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse';
        case 'urgent':
            return 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]';
        case 'warning':
            return 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
        default:
            return 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
    }
}
